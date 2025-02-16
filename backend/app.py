from cryptography import x509
from cryptography.hazmat.backends import default_backend
import jwt
import requests
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
import jwt
from jwt.exceptions import InvalidTokenError
from functools import wraps
import base64

logging.basicConfig(level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Создание Flask приложения
app = Flask(__name__)
CORS(app)

KEYCLOAK_PUBLIC_KEY_URL = "http://keycloak:8080/realms/reports-realm/protocol/openid-connect/certs"

def get_public_key():
    response = requests.get(KEYCLOAK_PUBLIC_KEY_URL)
    keycloak_cert = response.json()
    cert_pem = keycloak_cert['keys'][0]['x5c'][0]
    # public_key = f"-----BEGIN CERTIFICATE-----\n{cert_pem}\n-----END CERTIFICATE-----"
    
    cert_bytes = base64.b64decode(cert_pem)
    cert = x509.load_der_x509_certificate(cert_bytes, default_backend())
    public_key = cert.public_key()
    
    return public_key

PUBLIC_KEY = get_public_key()

# SECRET_KEY = "oNwoLQdvJAvRcL89SydqCWCe5ry1jMgq"

# Декоратор для проверки роли пользователя
def role_required(role):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            logger.info("Начата проверка авторизации")
            token = request.headers.get("Authorization")
            if not token:
                logger.warning("Токен отсутствует в заголовках запроса")
                return jsonify({"error": "Missing token"}), 401

            token = token.split(" ")[1]  # Убираем "Bearer " из токена
            logger.info("Токен извлечен и обработан")
            logger.debug(f"Токен: {token}")
            logger.info("PUBLIC_KEY: %s", PUBLIC_KEY)

            try:
                logger.info("Попытка декодирования токена")
                decoded_token = jwt.decode(token, 
                                           key=PUBLIC_KEY, 
                                           algorithms=["RS256"],
                                           options={
                                                "verify_signature": True,
                                                "verify_exp": True,
                                                "verify_aud": False
                                            })
                user_roles = decoded_token.get("realm_access", {}).get("roles", [])
                logger.info("Токен успешно декодирован: %s", user_roles)
                if role not in user_roles:
                    logger.warning("Недостаточно прав. Требуемая роль: %s", role)
                    return jsonify({"error": "Insufficient permissions"}), 403
                logger.info("Роль %s подтверждена, доступ разрешен", role)
            except InvalidTokenError as e:
                logger.error("Ошибка: недействительный токен")
                logger.error(f"Invalid token: {e}")
                return jsonify({"error": "Invalid token"}), 401

            return f(*args, **kwargs)

        return wrapper
    return decorator

# Эндпоинт для получения отчётов
@app.route('/reports', methods=['GET'])
@role_required('prothetic_user')  # Требуется роль prothetic_user
def get_reports():
    # Генерация произвольных данных отчета
    report_data = {
        "report_id": 1,
        "name": "Prothetic User Report",
        "data": [ {"item": "item1", "value": 100}, {"item": "item2", "value": 200}]
    }
    return jsonify(report_data)

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=8000)