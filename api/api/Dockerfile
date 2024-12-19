FROM gradle:8.3.0-jdk17 AS builder
WORKDIR /build

COPY gradlew ./
COPY gradle gradle
COPY build.gradle settings.gradle ./

RUN ./gradlew --no-daemon build -x test || true

COPY src ./src

RUN ./gradlew --no-daemon clean bootJar -x test

FROM amazoncorretto:17-alpine
WORKDIR /opt/app

RUN addgroup --system javauser && adduser -S -s /usr/sbin/nologin -G javauser javauser

COPY --from=builder /build/build/libs/*.jar app.jar

RUN chown -R javauser:javauser /opt/app
USER javauser

ENTRYPOINT ["java", "-jar", "app.jar"]