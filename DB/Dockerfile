FROM alpine:latest

RUN apk add --no-cache bash curl

RUN curl -fsSL -o /usr/local/bin/mc https://dl.min.io/client/mc/release/linux-amd64/mc && \
    chmod +x /usr/local/bin/mc

COPY createuser.sh /usr/local/bin/createuser.sh

RUN chmod +x /usr/local/bin/createuser.sh

WORKDIR /usr/local/bin