FROM python:3.11

ENV TZ=Europe/Moscow
WORKDIR /app
COPY /app/requirements.txt /app/
RUN pip install --no-cache-dir -r /app/requirements.txt
COPY . /app
RUN ls -la /app

# Если .env находится в корневой директории проекта, копируем его в нужное место
#RUN if [ -f /app/.env ] && [ ! -f /app/app/.env ]; then cp /app/.env /app/app/.env; fi
EXPOSE 8000
WORKDIR /app

# Выполняем миграции для БД и запускаем проект
CMD ["sh", "-c", "echo 'Рабочая директория:' && pwd && echo 'Содержимое /app:' && ls -la /app &&  uvicorn app.main:app --host 0.0.0.0 --port 8000"]
