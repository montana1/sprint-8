# Используем официальный базовый образ Python
   FROM python:3.9-slim

   # Устанавливаем рабочую директорию в контейнере
   WORKDIR /app

   # Копируем файлы проекта в контейнер
   COPY ./app /app

   # Устанавливаем зависимости
   RUN pip install --no-cache-dir --upgrade pip && \
       pip install --no-cache-dir fastapi uvicorn python-jose[cryptography] httpx

   # Определяем команду для запуска приложения
   CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8005"]
