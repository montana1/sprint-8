FROM python:3.11-slim

WORKDIR /app

COPY req.txt main.py ./
RUN pip install -r req.txt

CMD ["fastapi", "dev", "main.py", "--host", "0.0.0.0"]
