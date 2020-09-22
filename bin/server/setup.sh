#!/usr/bin/env bash

# This script is supposed to be run on a brand new Ubuntu instance.
# It sets up the environment, installs dependencies and fetches the app.
# It assumes running as a non-root user with sudo access (usually `ubuntu` for fresh EC2 instances),
# if the instance has only root user, set up a default one like so:
#
#   # Create a new user and add him to the sudo group.
#   sudo adduser --disabled-password --gecos "" default
#   sudo usermod -aG sudo default
#   echo -e '\n# Allow the user to use sudo without being asked for password.\ndefault ALL=(ALL) NOPASSWD:ALL' | sudo EDITOR='tee -a' visudo
#   sudo su - default
#   mkdir .ssh
#
# Invoke this script without cloning the repo up-front (this is taken care of later):
# bash <(curl -s https://raw.githubusercontent.com/thewca/wca-live/master/bin/server/setup.sh)

set -e

read -p "This script modifies the environment and installs stuff, run it on a new production VM. Do you want to continue? [y/N] "
if [[ ! $REPLY =~ ^[yY]$ ]]; then
  exit 1
fi

echo "Setting up the environment"

##
# Install Docker
# See https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-20-04
##

echo "* installing Docker"
sudo apt update
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
sudo apt update
sudo apt install -y docker-ce
# Add the current user to docker group to run docker without sudo.
sudo usermod -aG docker $USER

##
# Install Docker Compose
##

echo "* installing Docker Compose"
sudo curl -L "https://github.com/docker/compose/releases/download/1.27.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

##
# Set up the app repository
##

echo "* cloning the app repository"
sudo apt install git
git clone --branch prod https://github.com/thewca/wca-live.git
# Create .env file from the template
cp wca-live/.env.template wca-live/.env

##
# Print the next setup steps
##

echo -e "\n# Next steps\n"
echo "1. Set environment variables in ~/wca-live/.env"
echo "2. Update authorized RSA keys by running ~/wca-live/bin/server/update-authorized-keys.sh"
echo "3. Start the app by running ~/wca-live/bin/server/up.sh"
