import cors from 'cors';
import express from 'express';
import { keycloak } from './keycloak-config';
import reportsRouter from './routes/reports';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

//Keycloak middleware
app.use(keycloak.middleware());


//Routes

app.get('/', reportsRouter);

app.get('/reports', keycloak.protect('realm:prothetic_user'), reportsRouter);


// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});