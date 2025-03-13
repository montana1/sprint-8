import 'dotenv/config'
import express from 'express';
import Keycloak from 'keycloak-connect';
import cors from 'cors';

const app = express();
app.use(cors());
const port = 8000;

const kcConfig = {
    "realm": process.env.BACKEND_API_KEYCLOAK_REALM,
    "bearer-only": true,
    "auth-server-url": process.env.BACKEND_API_KEYCLOAK_URL,
    "ssl-required": "external",
    "resource": process.env.BACKEND_API_KEYCLOAK_CLIENT_ID,
    "confidential-port": 0
  };


// Overriding keycloak access denied to return 401 status code and custom message.
Keycloak.prototype.accessDenied = (req,res,next) => {
  console.log("Access denied");
  // console.log(req);

  res.sendStatus(401);
};

const keycloak = new Keycloak({},kcConfig);

app.use(keycloak.middleware());

const report = 
  {
    name: "Report1",
    data: "Some data"
  };

app.get('/reports', keycloak.protect('realm:prothetic_user'), (req, res) => {   
  console.log("Success");
  // console.log(req);
  res.json(report);
});

app.use('*', (req, res) => {
  res.sendStatus(404);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}.`);
});