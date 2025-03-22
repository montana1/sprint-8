FROM python

RUN pip install requests flask flask-cors Authlib PyJWT Faker

COPY . /opt

WORKDIR /opt

CMD [ "python", "server.py" ]
