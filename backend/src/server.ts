import express, {Request, RequestHandler, Response} from 'express';
import session from 'express-session';
import Keycloak from 'keycloak-connect';
import cors from 'cors';


const app = express();
// const memoryStore = new session.MemoryStore();

app.use(cors({
    origin: 'http://localhost:3000', // или ['http://localhost:3000'] если нужно перечислить несколько
    credentials: false
}));

// app.use(
//     session({
//         secret: 'oNwoLQdvJAvRcL89SydqCWCe5ry1jMgq',
//         resave: false,
//         saveUninitialized: true,
//         store: memoryStore,
//     })
// );

const keycloak = new Keycloak({}, {
    realm: 'reports-realm',
    'auth-server-url': 'http://localhost:8080/',
    'ssl-required': 'none',
    resource: 'reports-api',
    'bearer-only': true,
    'confidential-port': 0,
});

app.use(keycloak.middleware());

// const checkProtheticRole: RequestHandler = (req, res, next) => {
//     const tokenContent = (req as any).kauth?.grant?.access_token?.content;
//     console.log(tokenContent)
//     if (!tokenContent) {
//         res.status(401).json({ error: 'Unauthorized' });
//         return;
//     }
//
//     const roles = tokenContent.realm_access?.roles || [];
//     if (!roles.includes('prothetic_user')) {
//         res.status(403).json({ error: 'Forbidden: not a prothetic_user' });
//         return;
//     }
//
//     next();
// };


app.get(
    '/reports',
    keycloak.protect((token) => {
        const roles: string[] = (token as any).realm_access?.roles || [];
        console.log("Hi")
        console.log(token)
        return roles.includes('prothetic_user');
    }),
    keycloak.protect(),
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