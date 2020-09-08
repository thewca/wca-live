#!/bin/sh

host=live.worldcubeassociation.org
email=software@worldcubeassociation.org

# Obtain a certificate in a standalone mode.
# This way Certbot sets up a temporary web server on port 80
# for the challenge. If there is already a valid certificate
# this doesn't really do anything.
# Running this command first ensures that there are certificate
# files under /etc/letsencrypt and we can safely start Nginx.
certbot certonly --standalone -d $host --email $email -n --agree-tos

# Start cron to periodically renew the certificate.
crond

# Start Nginx in the foreground.
nginx -g "daemon off;"
