FROM python:3.9-slim
# RUN apt-get update && apt-get install -y curl

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

CMD ["sh", "-c", "until curl -s http://keycloak:8080/realms/reports-realm/protocol/openid-connect/certs; do echo 'Waiting for Keycloak...'; sleep 20; done; flask run --host=0.0.0.0 --port=8000"]
# CMD ["flask", "run", "--host=0.0.0.0", "--port=8000"]