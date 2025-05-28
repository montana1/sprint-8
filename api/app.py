from flask import Flask, request, jsonify, abort
from flask_cors import CORS
from jose import jwt, JWTError
from time import sleep
import requests
import random

app = Flask(__name__)
CORS(app)

KEYCLOAK_URL = 'http://localhost:8080/auth/realms/reports-realm'
JWKS_URL = "http://keycloak:8080/realms/reports-realm/protocol/openid-connect/certs"
AUDIENCE = "reports-frontend" 

def fetch_jwks():
    print(f"[INFO] Запрашиваем JWKS с URL: {JWKS_URL}")
    try:
        jwks_response = requests.get(JWKS_URL)
        jwks_response.raise_for_status()
        jwks = jwks_response.json()
        print(f"[INFO] Получены JWKS ключи: {len(jwks.get('keys', []))} ключей")
        return jwks
    except Exception as e:
        print(f"[ERROR] Не удалось получить JWKS: {e}")
        return None

def get_public_key(token, jwks):
    print("[DEBUG] get_public_key: получаем заголовок JWT")
    header = jwt.get_unverified_header(token)
    print(f"[DEBUG] Заголовок JWT: {header}")
    kid = header.get("kid")
    print(f"[DEBUG] Ищем ключ с kid = {kid}")
    if not jwks:
        print("[ERROR] JWKS не загружен")
        return None
    for key in jwks.get("keys", []):
        if key["kid"] == kid:
            print("[INFO] Найден подходящий публичный ключ")
            return key
    print("[WARN] Ключ с таким kid не найден")
    return None

def verify_token(token, jwks):
    print("[INFO] verify_token: начинаем валидацию токена")
    public_key = get_public_key(token, jwks)
    if not public_key:
        print("[ERROR] Публичный ключ не найден, выбрасываем исключение")
        raise JWTError("Public key not found")

    try:
        claims = jwt.decode(
            token,
            public_key,
            algorithms=public_key["alg"],
        )
        print(f"[INFO] Токен успешно проверен, claims: {claims}")
        return claims
    except JWTError as e:
        print(f"[ERROR] Ошибка при декодировании токена: {e}")
        raise

@app.route("/reports", methods=['GET'])
def reports():
    print("[INFO] /reports: получен запрос")

    jwks = fetch_jwks()
    if not jwks:
        return jsonify({"error": "Failed to fetch JWKS"}), 500

    auth_header = request.headers.get("Authorization", None)
    print(f"[DEBUG] Заголовок Authorization: {auth_header}")

    if not auth_header or not auth_header.startswith("Bearer "):
        print("[WARN] Заголовок Authorization отсутствует или некорректен")
        abort(401, description="Authorization header missing or invalid")

    token = auth_header.split(" ")[1]
    print(f"[DEBUG] Извлечён токен: {token[:10]}... (обрезано)")

    try:
        claims = verify_token(token, jwks)
    except JWTError:
        print("[WARN] Ошибка подписи токена, возвращаем 401")
        return jsonify({"error": "Signature Error"}), 401

    roles = claims.get("realm_access", {}).get("roles", [])
    print(f"[DEBUG] Роли пользователя: {roles}")

    if "prothetic_user" not in roles:
        print("[WARN] Роль 'prothetic_user' отсутствует, доступ запрещён")
        return jsonify({"error": "Access denied"}), 403

    data = {
        "reportId": random.randint(1000, 9999),
        "value": random.random(),
        "message": "Random report data"
    }
    print(f"[INFO] Возвращаем данные: {data}")
    return jsonify(data)

if __name__ == "__main__":
    print("[INFO] Запуск Flask-приложения на 0.0.0.0:5000")
    app.run(host="0.0.0.0", port=5000)
