## Задание
Необходимо улучшить безопасность приложения, заменив Code Grant на PKCE. Затем необходимо реализовать API для работы с отчётом.  


### Решение 

##### Реализация PKCE
В качестве реализации сделано:
 1. Добавалена PKCE в клиентскую конфигурацию в realm-export.json:
 
```json
{
  "clientId": "reports-frontend",
  "enabled": true,
  "publicClient": true,
  "redirectUris": ["http://localhost:3000/*"],
  "webOrigins": ["http://localhost:3000"],
  "directAccessGrantsEnabled": true,
  "attributes": {
    "pkce.code.challenge.method": "S256"
  }
}
```
  
 2. Обновлена часть фронтенда с установлением initOptions:

```typescript

const initOptions: KeycloakInitOptions = {
  pkceMethod: 'S256',
  onLoad: 'login-required',
};

const keycloak = new Keycloak(keycloakConfig);

const App: React.FC = () => {
  return (
    <ReactKeycloakProvider authClient={keycloak} initOptions={initOptions}>
      <div className="App">
        <ReportPage />
      </div>
    </ReactKeycloakProvider>
  );
};

```


##### Реализация API

Реализован бэкенд в стеке Express/Node.js Typescript. Код в директории /backend, в корне файл Dockerfile, который описывает сборку приложения. API содержит ендпоинт  /reports, который отдает отчет только пользователю с ролью prothetic_user.

```typescript
app.get('/reports', keycloak.protect('realm:prothetic_user'), reportsRouter);

```

В docker-compose добавлен код для настройки и запуска API.

```yaml
services:
  # ... существующие сервисы ...
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      KEYCLOAK_URL: http://localhost:8080
      KEYCLOAK_CLIENT_SECRET: oNwoLQdvJAvRcL89SydqCWCe5ry1jMgq
      PORT: 8000

```

##### Проверка работы
Запуск системы 

```bash
docker-compose up --build
```

* Фронтенд на http://localhost:3000, войти под пользователем с ролью prothetic_user (например, prothetic1/prothetic123)

* Доступ к API http://localhost:8000/reports - доступ есть.

* Если войти под пользователем без нужной роли (например, user1/password123), доступ к API запрещён.

##### В итоге реализация обеспечивает:

* Аутентификацию через Keycloak

* Реализацию PKCE для улучшенной безопасности фронтенд-аутентификации

* Авторизацию по ролям

* Защиту API с проверкой токенов

