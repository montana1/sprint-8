FROM ruby:3.4.1

RUN mkdir /usr/src/app
WORKDIR /usr/src/app
COPY Gemfile .
COPY Gemfile.lock .
RUN bundle install

COPY . .

EXPOSE 8000
