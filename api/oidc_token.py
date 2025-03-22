import json
import jwt

from urllib.request import urlopen
from authlib.jose.rfc7517.jwk import JsonWebKey
from jwt.exceptions import InvalidSignatureError


class OIDCToken:

    def __init__(self, url, accepted_roles):
        self.url = urlopen(f"{url}/protocol/openid-connect/certs")
        jsonurl = urlopen(f"{url}/protocol/openid-connect/certs")
        
        keys = JsonWebKey.import_key_set(json.loads(jsonurl.read()))
        self.keys = [k.as_pem() for k in keys.keys]

        self.accepted_roles = accepted_roles

    def validate(self, token) -> bool:
        for key in self.keys:
            try:
                decoded_token = jwt.decode(token, key, algorithms=['HS256', 'RS256'])

                for role in decoded_token['realm_access']['roles']:
                    if role in self.accepted_roles:
                        return True
                    
            except InvalidSignatureError:
                pass

        return False
    
    def extract_from_request(self, request) -> str:
        jwt_token = request.headers.get("Authorization")

        if jwt_token:
            jwt_token = jwt_token.split()[-1]

        return jwt_token