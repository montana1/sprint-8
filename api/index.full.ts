import http, { request } from 'node:http';
import * as jose from 'jose';

const port = process.env['PORT'] ?? 8011;
const keycloakUrl = process.env['KEYCLOAK_URL'];
const realmName = process.env['REALM_NAME'];
const clientId = process.env['CLIENT_ID'];
const clientSecret = process.env['CLIENT_SECRET'];

const NEED_ROLE = 'prothetic_user';

if (!keycloakUrl || !realmName || !clientId || !clientSecret) {
    process.exit(1);
}

const corsHeaders = {
    'Access-Control-Allow-Origin': `http://localhost:3002`,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PATCH, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function decodeFromBase64Object<T>(str: string): T {
    return JSON.parse(Buffer.from(str, 'base64').toString()) as T;
}

function decode<T>(str: string): T {
    const [head64, body64, sign64] = str.split('.');
    const body = decodeFromBase64Object<T>(body64);

    return body;
}

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
    // const jwk = {
    //     kty: 'RSA',
    //     n: 'whYOFK2Ocbbpb_zVypi9SeKiNUqKQH0zTKN1-6fpCTu6ZalGI82s7XK3tan4dJt90ptUPKD2zvxqTzFNfx4HHHsrYCf2-FMLn1VTJfQazA2BvJqAwcpW1bqRUEty8tS_Yv4hRvWfQPcc2Gc3-_fQOOW57zVy-rNoJc744kb30NjQxdGp03J2S3GLQu7oKtSDDPooQHD38PEMNnITf0pj-KgDPjymkMGoJlO3aKppsjfbt_AH6GGdRghYRLOUwQU-h-ofWHR3lbYiKtXPn5dN24kiHy61e3VAQ9_YAZlwXC_99GGtw_NpghFAuM4P1JDn0DppJldy3PGFC0GfBCZASw',
    //     e: 'AQAB',
    // }
    for (const jwk of jwks) {
        try {
            const publicKey = await jose.importJWK(jwk, alg);
            // const jwt =
            // 'eyJhbGciOiJSUzI1NiJ9.eyJ1cm46ZXhhbXBsZTpjbGFpbSI6dHJ1ZSwiaWF0IjoxNjY5MDU2NDg4LCJpc3MiOiJ1cm46ZXhhbXBsZTppc3N1ZXIiLCJhdWQiOiJ1cm46ZXhhbXBsZTphdWRpZW5jZSJ9.gXrPZ3yM_60dMXGE69dusbpzYASNA-XIOwsb5D5xYnSxyj6_D6OR_uR_1vqhUm4AxZxcrH1_-XJAve9HCw8az_QzHcN-nETt-v6stCsYrn6Bv1YOc-mSJRZ8ll57KVqLbCIbjKwerNX5r2_Qg2TwmJzQdRs-AQDhy-s_DlJd8ql6wR4n-kDZpar-pwIvz4fFIN0Fj57SXpAbLrV6Eo4Byzl0xFD8qEYEpBwjrMMfxCZXTlAVhAq6KCoGlDTwWuExps342-0UErEtyIqDnDGcrfNWiUsoo8j-29IpKd-w9-C388u-ChCxoHz--H8WmMSZzx3zTXsZ5lXLZ9IKfanDKg'
        
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

function checkJWT(token: string): boolean {
    try {
        const body = decode<JWTBody>(token);

        const roles = body.realm_access.roles;
        if (!roles.includes(NEED_ROLE)) {
            return false;
        }
        return true;
    } catch {
        return false;
    }
}

async function checkToken(token: string): Promise<boolean> {
    return new Promise((res, rej) => {
        const tokenUrl = new URL(`${keycloakUrl}/realms/${realmName}/protocol/openid-connect/token/introspect`);
    
        tokenUrl.searchParams.set('client_id', clientId!);
        tokenUrl.searchParams.set('client_secret', clientSecret!);
        tokenUrl.searchParams.set('token', token);
    
        const query = tokenUrl.searchParams.toString();
        console.log({
            host: tokenUrl.hostname,
            port: tokenUrl.port,
            path: tokenUrl.pathname,
            query,
            token,
        });
    
        const tokenRequest = request({
            method: 'POST',
            host: tokenUrl.hostname,
            port: tokenUrl.port,
            path: tokenUrl.pathname,
            headers: {
                // Authorization: req.headers.authorization,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(query),
            },
        }, (response) => {
            let text = '';
            response.setEncoding('utf8');
            response.on('data', (chunk) => text += String(chunk));
            response.on('end', () => {
                console.log(text);
                const json = JSON.parse(text);
                console.log(json);
                if (!json.active) {
                    return res(false);
                }
                const roles = json.realm_access.roles;
                if (!roles.includes(NEED_ROLE)) {
                    return res(false);
                }
                return res(true);
            });
        });
        tokenRequest.on('error', (e) => {
            console.error(`Problem with request: ${e.message}`);
            return rej(e);
        });
        tokenRequest.write(query, 'utf8', () => tokenRequest.end());
    });
}

async function checkUser(token: string): Promise<boolean> {
    return new Promise((res, rej) => {
        const url = new URL(`${keycloakUrl}/realms/${realmName}/protocol/openid-connect/userinfo`);

        console.log({
            host: url.hostname,
            port: url.port,
            path: url.pathname,
            token,
        });

        const userRequest = request({
            host: url.hostname,
            port: url.port,
            path: url.pathname,
            headers: {
                Authorization: `Bearer ${token}`,
                // ContentType: 'application/x-www-form-urlencoded',
            },
        }, (response) => {
            let text = '';
            // console.log('response', response);
            response.setEncoding('utf8');
            response.on('data', (chunk) => text += String(chunk));
            response.on('end', () => {
                console.log('text', text);
                if (response.statusCode === 200) {
                    return res(true);
                }
                return res(false);
            });
        });
        userRequest.on('error', (e) => {
            console.error(`Problem with request: ${e.message}`);
            return rej(false);
        });
        userRequest.end();
    });
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
