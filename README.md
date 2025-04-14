# Architecture sprint 8

### Что нужно сделать

1. **Реализуйте PKCE.** Отредактировал конфиг KeyCloak и инициализацию провайдера на фронте.

2. **Создайте бэкенд-часть приложения для API.** Написал на Go в папке backend, в middleware проверяет JWT токен и пускает только пользлвателей с ролью `prothetic_user`.


### Тест

1. `docker compose up --build -d`
2. Захожу на http://localhost:3000, нажимаю Login, ввожу user1 и password - получаю ошибку, тк неверный пароль
3. Ввожу пароль password123 - захожу на сайт
4. Нажимаю DownloadReport, вижу ошибку Insufficient permissions
5. Нажимаю Logout
6. Ввожу prothetic1 и prothetic123 - захожу на сайт
7. Нажимаю DownloadReport, качается JSON с данными
