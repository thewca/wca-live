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
# bash <(curl -s https://raw.githubusercontent.com/thewca/wca-live/master/bin/setup.sh)

set -e

read -p "This script modifies the environment and installs stuff, run it on a new production VM. Do you want to continue? [y/N] "
if [[ ! $REPLY =~ ^[yY]$ ]]; then
  exit 1
fi

echo "Setting up the environment"

##
# Install Docker
##

echo "* installing Docker"
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
# Add the current user to docker group to run docker without sudo
sudo usermod -aG docker $USER

##
# Set up the app repository
##

echo "* cloning the app repository"
sudo apt-get install git
git clone --branch prod https://github.com/thewca/wca-live.git
# Create .env file from the template
cp wca-live/.env.template wca-live/.env

##
# Print the next setup steps
##

echo -e "\n# Next steps\n"
echo "1. Set environment variables in ~/wca-live/.env"
echo "2. Update authorized RSA keys by running ~/wca-live/bin/update-authorized-keys.sh"
echo "3. Start the app by running ~/wca-live/bin/up.sh"
