#!/bin/sh

set -e

certbot renew --webroot --webroot-path /var/lib/letsencrypt --post-hook "/usr/sbin/nginx -s reload"
