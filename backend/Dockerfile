FROM golang:1.24-alpine AS builder
WORKDIR /app
COPY go.mod go.sum* ./
RUN go mod download
COPY . .
RUN go build -o reports-api ./cmd/main/main.go


FROM alpine:latest  
WORKDIR /opt
COPY --from=builder /app/reports-api .
EXPOSE 8000
ENTRYPOINT ["/opt/reports-api"]