import os

from faker import Faker
from flask import Flask, request
from flask_cors import CORS, cross_origin

from oidc_token import OIDCToken
from oidc_checker import OIDCChecker

url = f"{os.environ['KEYCLOCK_URL']}/realms/reports-realm"

oidc_checker = OIDCChecker(url, 10)
oidc_checker.check()

fake = Faker()
oidc_token = OIDCToken(url, [
    'prothetic_user',
])

server = Flask(__name__)
CORS(server, resources={r"/api/*": {
    "origins": "*",
    "methods": ["GET", "HEAD", "OPTIONS"],
    "allow_headers": "*"
}})

@server.route("/reports")
@cross_origin()
def private_scoped():
    token = oidc_token.extract_from_request(request)
    if oidc_token.validate(token):
        return [{"coordinate": fake.coordinate()} for _ in range(20)], 200
    else:
        return "Unauthorized", 401

server.run(host="0.0.0.0", port=8000, debug=True)
