import express from 'express';
import Keycloak from 'keycloak-connect';

const app = express();
const port = 8000;

// Middleware configuration loaded from keycloak.json file.

const kcConfig = {
    "realm": "reports-realm",
    "bearer-only": true,
    "auth-server-url": "http://localhost:8080/",
    "ssl-required": "external",
    "resource": "reports-api",
    "confidential-port": 0
  };

const keycloak = new Keycloak({},kcConfig);

app.use(keycloak.middleware());

app.get('/reports', keycloak.protect('realm:prothetic_user'), (req, res) => {   
  res.json({report: 'report'});
});

app.use('*', (req, res) => {
  res.send('Not found!');
});

app.listen(port, () => {
  console.log(`Listening on port ${port}.`);
});