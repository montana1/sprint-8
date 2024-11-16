FROM golang:latest AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /reports

FROM alpine

WORKDIR /

COPY --from=builder /reports /reports
EXPOSE 8000
CMD ["/reports"]