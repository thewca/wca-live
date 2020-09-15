# WCA Live Nginx configuration

A Docker image with production Nginx configuration.

The configuration is based on recommendations from [nginxconfig.io](https://nginxconfig.io).

The Docker image automatically obtains and renews an SSL certificate
from [Let's Encrypt](https://letsencrypt.org) using [Certbot](https://certbot.eff.org).
Implementation details inspired by [this article](https://medium.com/@vshab/nginx-with-lets-encrypt-in-docker-container-e549d18c00d7).

## Notes

The `dhparam.pem` file has been generated like so:

```sh
 openssl dhparam -out conf/dhparam.pem 2048
 ```

It contains custom parameters for the DH key exchange algorithm,
which is recommended over using some default widely used parameters.
