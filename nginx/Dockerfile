FROM nginx:1.19-alpine

# Install certbot for obtaining an SSL certificate.
RUN apk add --no-cache certbot

# Copy all custom Nginx configuration files.
COPY conf/nginx.conf /etc/nginx/nginx.conf
COPY conf/dhparam.pem /etc/nginx/dhparam.pem
COPY conf/conf.d /etc/nginx/conf.d
COPY conf/includes /etc/nginx/includes

# Create the directory for ACME challenge files.
RUN mkdir -p /var/lib/letsencrypt

# Let cron run the reneval script daily.
# We intentionally omit the file extension, as otherwise `run-parts` ignores it.
COPY bin/renew.sh /etc/periodic/daily/renew

COPY bin/docker-entrypoint.sh /
ENTRYPOINT [ "/docker-entrypoint.sh" ]
