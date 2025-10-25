FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git

# Copy go mod files
COPY go.mod go.sum* ./
RUN go mod download

# Copy source code
COPY main.go .
COPY seed_data.sql .
COPY seed.sh .

# Build application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy binary and seed files from builder
COPY --from=builder /app/main .
COPY --from=builder /app/seed_data.sql .
COPY --from=builder /app/seed.sh .

# Make seed script executable
RUN chmod +x /root/seed.sh

EXPOSE 8080

CMD ["./main"]
