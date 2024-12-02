import http, { request } from 'node:http';
import * as jose from 'jose';

const port = process.env['PORT'] ?? 8011;
const keycloakUrl = process.env['KEYCLOAK_URL'];
const realmName = process.env['REALM_NAME'];

const NEED_ROLE = 'prothetic_user';

if (!keycloakUrl || !realmName) {
    process.exit(1);
}

const corsHeaders = {
    'Access-Control-Allow-Origin': `http://localhost:3002`,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PATCH, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

type JWTBody = {
    realm_access: {
        roles: string[],
    }
};

type Router = {
    path: RegExp;
    method: string;
    listener: http.RequestListener;
};

type Keys = {
    keys: {
        kid: string;
        kty: 'RSA';
        n: string;
        e: string;
    }[];
};

async function loadCerts(): Promise<Keys> {
    return new Promise((res, rej) => {
        const url = new URL(`${keycloakUrl}/realms/${realmName}/protocol/openid-connect/certs`)

        const certRequest = request({
            host: url.hostname,
            port: url.port,
            path: url.pathname,
        }, (response) => {
            let text = '';
            response.setEncoding('utf8');
            response.on('data', (chunk) => text += String(chunk));
            response.on('end', () => {
                return res(JSON.parse(text));
            });
        });
        certRequest.on('error', (e) => {
            console.error(`Problem with request: ${e.message}`);
            return rej(e);
        });
        certRequest.end();
    });
}

async function verifyToken<T>(jwt: string, jwks: Keys['keys']): Promise<T | undefined> {
    const alg = 'RS256';
    for (const jwk of jwks) {
        try {
            const publicKey = await jose.importJWK(jwk, alg);
            const {payload, protectedHeader} = await jose.jwtVerify(jwt, publicKey);
        
            console.log(protectedHeader);
            console.log(payload);

            return payload as T;
        } catch (err) {
            console.error(err);
        }
    }

    return;
}

const routers: Router[] = [
    {
        path: /reports/,
        method: 'GET',
        listener: async (req, res) => {
            const token = req.headers['authorization']?.replace('Bearer ', '') ?? '';
            const certs = await loadCerts();
            console.log(certs);
            const payload = await verifyToken<JWTBody>(token, certs.keys);

            if (!payload) {
                return res
                    .writeHead(401, corsHeaders)
                    .end();
            }

            const roles = payload.realm_access.roles;
            if (!roles.includes(NEED_ROLE)) {
                return res
                    .writeHead(401, corsHeaders)
                    .end();
            }

            return res
                .writeHead(200, {'Content-Type': 'application/json', ...corsHeaders})
                .end(JSON.stringify([
                    {
                        id: 'one',
                    },
                    {
                        id: 'two',
                    },
                    {
                        id: 'three',
                    }
                ]));
        },
    },
    {
        path: /reports/,
        method: 'OPTIONS',
        listener: async (req, res) => {
            return res
                .writeHead(200, corsHeaders)
                .end();
        },
    },
];

const server = http.createServer((req, res) => {
    console.log(req.method, req.url);
    const router = routers.find((router) => {
        return router.method === req.method && router.path.test(req.url ?? '');
    });
    if (router) {
        router.listener(req, res);
    } else {
        res.writeHead(404, {'Content-Type': 'text/plain'}).end('Not found');
    }
});

server.listen(port);
