import express, {Request, RequestHandler, Response} from 'express';
import Keycloak from 'keycloak-connect';
import cors, {CorsOptions} from 'cors';


const app = express();

const corsOptions: CorsOptions = {
    origin: true,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};
app.use(cors(corsOptions));

const keycloak = new Keycloak({}, {
    realm: 'reports-realm',
    'auth-server-url': 'http://localhost:8080/',
    'ssl-required': 'none',
    resource: 'reports-api',
    'bearer-only': true,
    'confidential-port': 0,
});

console.log(keycloak)

app.use(keycloak.middleware());

app.use((req, res, next) => {
    console.log('grant:', (req as any).kauth?.grant);
    next();
});

const checkToken = (): RequestHandler => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('Нет токена в заголовке Authorization');
            console.log('hi')
            return res.status(401).json({ error: 'Unauthorized: token not provided' });
        }
        console.log(authHeader)

        next()
    };
};

const requireRole = (requiredRole: string): RequestHandler => {
    return (req, res, next) => {
        const token = (req as any).kauth?.grant?.access_token;
        const roles = token?.content?.realm_access?.roles || [];

        console.log('token:', token);
        console.log('Roles:', roles);

        if (!roles.includes(requiredRole)) {
            return res.status(403).json({ error: 'Forbidden: insufficient role' });
        }

        next();
    };
};

app.get(
    '/reports',
    // keycloak.protect(),
    checkToken(),
    requireRole('prothetic_user'),
    // keycloak.protect((token) => {
    //     console.log(token)
    //     const roles = (token as any).content?.realm_access?.roles || [];
    //     return roles.includes('prothetic_user');
    // }),
    (req: Request, res: Response) => {
        const username = (req as any).kauth?.grant?.access_token?.content?.preferred_username;
        res.json({
            message: 'Report data for prothetic users only',
            user: username,
        });
    }
);

app.listen(8000, () => {
    console.log('Backend API started on http://localhost:8000');
});