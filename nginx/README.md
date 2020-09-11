# WCA Live Nginx configuration

A Docker image with production Nginx configuration.

The configuration is based on recommendations from [nginxconfig.io](https://nginxconfig.io).

The Docker image automatically obtains and renews an SSL certificate
from [Let's Encrypt](https://letsencrypt.org) using [Certbot](https://certbot.eff.org).
Implementation details inspired by [this article](https://medium.com/@vshab/nginx-with-lets-encrypt-in-docker-container-e549d18c00d7).
