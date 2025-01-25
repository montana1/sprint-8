FROM golang:latest AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /api

FROM alpine

WORKDIR /

COPY --from=builder /api /api
EXPOSE 8000
CMD ["/api"]