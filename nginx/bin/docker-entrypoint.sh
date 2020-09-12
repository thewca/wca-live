#!/bin/sh

conf_path='/etc/nginx/conf.d/default.conf'
host="${HOST:?Missing env variable HOST}"

# Replace {{HOST}} occurrences in the config.
sed -i "s/{{HOST}}/$host/g" $conf_path

if [ "$REQUEST_SSL_CERT" = "true" ]; then
  email="${EMAIL:?Missing env variable EMAIL}"

  # Obtain a certificate in a standalone mode.
  # This way Certbot sets up a temporary web server on port 80
  # for the challenge. If there is already a valid certificate
  # this doesn't really do anything.
  # Running this command first ensures that there are certificate
  # files under /etc/letsencrypt and we can safely start Nginx.
  certbot certonly --standalone -d $host --email $email -n --agree-tos

  # Start cron to periodically renew the certificate.
  crond
else
  # As we don't obtain an SSL certificate, comment out the relevant SSL configuration.
  sed -i -r 's/(listen .*443)/#ssl#\1/g; s/(ssl_(certificate|certificate_key|trusted_certificate) )/#ssl#\1/g' $conf_path
fi

# Start Nginx in the foreground.
nginx -g "daemon off;"
