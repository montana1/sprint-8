# Используем официальный Python образ
FROM python:3.11-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы приложения
COPY app.py requirements.txt /app/

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Открываем порт приложения
EXPOSE 5000

# Запускаем приложение
CMD ["python", "app.py"]
