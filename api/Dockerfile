FROM python:3.11-alpine

ENV PYTHONUNBUFFERED=1

WORKDIR /app/

# Installing of python app requirements
COPY requirements.txt requirements.txt
RUN set -e \
## 0 Links to the requirements
&& reqs=requirements.txt \
## 1 Installing of temporary build tools and libs for usage by packages
&& tmp_deps="build-base" \
&& apk add --no-cache libstdc++ gcompat libgcc $tmp_deps \
## 3 General packages installing
&& pip install --no-cache-dir -r ${reqs} \
## 4 Clean
&& apk del --no-cache $tmp_deps \
## 4.1 Remove all temporary files
&& rm -rf ..?* .[!.]* * \
&& set +e

# Environment variables for the app setting
ENV PYTHONPATH=/app/reporter

# Copy project
COPY ./app /app/reporter

CMD ["fastapi", "run", "--workers", "4", "/app/reporter/main.py"]
