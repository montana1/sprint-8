FROM maven:3.8.3-openjdk-17 AS build
COPY --chown=maven:maven .. /opt
WORKDIR /opt
RUN mvn clean package -DskipTests

FROM bellsoft/liberica-openjre-debian:17 AS extractor
WORKDIR /opt

FROM extractor
ENV PORT 8080
ENV TZ=Europe/Moscow

EXPOSE $PORT

COPY --from=build /opt/target/*.jar /opt/backend.jar
ENTRYPOINT java  -jar *.jar
