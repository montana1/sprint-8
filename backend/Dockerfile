FROM golang:1.22

COPY go.mod go.sum ./

RUN go mod download

COPY *.go ./
COPY internal/ ./internal/

RUN CGO_ENABLED=0 go build -o /app

EXPOSE 8000

# Run
CMD ["/app"]