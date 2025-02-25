FROM bellsoft/liberica-openjdk-alpine:21 as build

WORKDIR /app

COPY gradle /app/gradle
COPY gradlew /app
COPY build.gradle.kts /app
COPY settings.gradle.kts /app
COPY src /app/src

RUN ./gradlew clean build --no-daemon

FROM bellsoft/liberica-openjdk-alpine:21

WORKDIR /app

COPY --from=build /app/build/libs/*.jar /app/app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
