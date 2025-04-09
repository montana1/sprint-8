const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { JwksClient } = require("jwks-rsa");

const app = express();
const port = 8000;

app.use(cors());

const keycloakConfig = {
  realm: process.env.REACT_APP_KEYCLOAK_REALM || "reports-realm",
  authServerUrl: process.env.REACT_APP_KEYCLOAK_URL || "http://localhost:8080",
  clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || "reports-frontend",
};

const jwksClient = new JwksClient({
  jwksUri: `${keycloakConfig.authServerUrl}/realms/${keycloakConfig.realm}/protocol/openid-connect/certs`,
});

const verify = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token not provided" });
  }

  const token = authHeader.split(" ")[1];

  const decoded = jwt.decode(token, { complete: true });

  if (!decoded?.header?.kid) {
    return res.status(401).json({ error: "Invalid token: no KID" });
  }

  const key = await jwksClient.getSigningKey(decoded.header.kid);
  const publicKey = key.getPublicKey();

  const verified = jwt.verify(token, publicKey, {
    algorithms: ["RS256"],
  });

  req.user = {
    id: verified.sub,
    roles: verified.realm_access?.roles || [],
    email: verified.email,
  };

  const realmRoles = req.user.roles || [];

  if (!realmRoles.includes("prothetic_user")) {
    return res
      .status(401)
      .json({ error: "Access denied: insufficient permissions" });
  }

  res.send("Hello World!");

  next();
};

app.get("/reports", verify);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
