# Решение задания спринта 8

## Задание 1. Реализация PKCE
Перед проверкой необходимо выполнить установить необходимые react-библиотеки для автоматического подставления и работы PKCE
```bash
npm install react react-dom @react-keycloak/web keycloak-js
```
После установки выполнить команду 
```bash
docker-compose up --build
```
В качестве результата авторизация должна работать, а также при выполнении запроса auth и проверке через браузер в Payload проверить наличие строк 
 - code_challenge: <<генерируемое значение>>
 - code_challenge_method: S256

## Задание 2. Реализация бэкенд-части приложения для API
Выполнить команду (если еще не выполнена)
```bash
docker-compose up --build
```
После успешного поднятия backend-1 зайти на http://localhost:3000 (желательно открывать в режиме Incognito)

### Проверка пользователя с ролью prothetic_user
1. Войти под login/password=prothetic1/prothetic123
2. Нажать на кнопку Download Report
3. Проверить появление внутри зеленого фрейма со следующим JSON
 ```json
 Report Data:
{
  "data": [
    {
      "item": "item1",
      "value": 100
    },
    {
      "item": "item2",
      "value": 200
    }
  ],
  "name": "Prothetic User Report",
  "report_id": 1
}
```

 ### Проверка пользователя без роли prothetic_user 
1. Войти под login/password=user1/password123
2. Нажать на кнопку Download Report
3. Проверить появление красного фрейма со следующим JSON
```json
{
    "error": "Insufficient permissions"
}
```

###  Проверка валидности токена
1. Открыть Postman/Insomnia (любой другой инструмент для проверки API запросов)
2. Выполнить следующий запрос (Bearer token специально изменен)
```curl
curl 'http://localhost:8000/reports' \
  -H 'Accept: */*' \
  -H 'Accept-Language: ru-RU,ru;q=0.9' \
  -H 'Authorization: Bearer eyJkbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJLMHVTblNEcHk3REQ4QzhoaTZzVENGQWJOOUdyQnA1MHk0N2RueGVIQ2lFIn0.eyJleHAiOjE3MzczNzg4NTIsImlhdCI6MTczNzM3ODU1MiwiYXV0aF90aW1lIjoxNzM3Mzc4NTUyLCJqdGkiOiJkYjk4MjE3Yy00NDllLTQxMTAtOTZmNS0zYzVmOGYyYmYwZWYiLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwODAvcmVhbG1zL3JlcG9ydHMtcmVhbG0iLCJzdWIiOiI2MGU2MzNlZS1hZGFlLTQ1MTYtOGM3Ni1jNGRjNWJkY2RiNjIiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJyZXBvcnRzLWZyb250ZW5kIiwibm9uY2UiOiI2NzVhM2QwYS0xZmY1LTQ2NGMtYTI2Zi0wNmQzMGE1NWQwMjYiLCJzZXNzaW9uX3N0YXRlIjoiYzQ5YzFmYzEtZWQxZC00MWNjLWE4YTQtYjIyZmI3ZDBjNjViIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwOi8vbG9jYWxob3N0OjMwMDAiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbInVzZXIiXX0sInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJzaWQiOiJjNDljMWZjMS1lZDFkLTQxY2MtYThhNC1iMjJmYjdkMGM2NWIiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsIm5hbWUiOiJVc2VyIE9uZSIsInByZWZlcnJlZF91c2VybmFtZSI6InVzZXIxIiwiZ2l2ZW5fbmFtZSI6IlVzZXIiLCJmYW1pbHlfbmFtZSI6Ik9uZSIsImVtYWlsIjoidXNlcjFAZXhhbXBsZS5jb20ifQ.Va2ptS9ioPqP0fIcHy12Vc8ahxozeP5xvQxqWAaaiK6CnMvarIJ_IJfBsauWAQjxbpqyJm2Tr4sGzXO2OKR4qcGfiD-B89Fw_2SPHhMK1Wy9QtV9e76ff99exAFVm7oDTulM3uvbks-xzQ2FY6fzxd21MCb30sNCJ_VjTV3mF6sj114GzDeVQx_60Gm-bzcQEEqsZomFWg0y5uyKKGxs4Gic2co8tL9hs1Ukaz_-wq3Oe4FVUr8M4EgQ0Xpr-J8IIq8dNOcxMv8iLSObm9E6JrEKvWIMVGcLgVeh1DktI176TU9o-yFUsdohaa8L4h_Uo4YBVa9bKa0OWrsFMUspkw' \
  -H 'Connection: keep-alive' \
  -H 'Origin: http://localhost:3000' \
  -H 'Referer: http://localhost:3000/' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-site' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' \
  -H 'sec-ch-ua: "Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "macOS"'
```
3. Проверить получение HTTP_STATUS_CODE 401 UNAUTHORIZED со следующим JSON
```json
{
    "error": "Invalid token"
}
```