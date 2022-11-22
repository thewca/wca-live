#!/usr/bin/env bash

set -e
cd "$(dirname "$0")/.."

source ./bin/utils.sh
load_dotenv

print_usage_and_exit() {
  echo "Usage: $0"
  echo "Update ~/.ssh/authorized_keys with the public keys of WST members."
  exit 1
}

update_authorized_keys() {
  # Install https://github.com/ernoaapa/fetch-ssh-keys unless exists.
  if ! which fetch-ssh-keys > /dev/null; then
    sudo curl -L https://github.com/ernoaapa/fetch-ssh-keys/releases/download/v1.1.7/linux_amd64_fetch-ssh-keys -o /usr/local/bin/fetch-ssh-keys
    sudo chmod +x /usr/local/bin/fetch-ssh-keys
  fi

  local authorized_keys_path=~/.ssh/authorized_keys
  local token="${GITHUB_LIST_MEMBERS_ACCESS_TOKEN:?Missing env variable GITHUB_LIST_MEMBERS_ACCESS_TOKEN}"

  fetch-ssh-keys \
    --comment "Keys for WST members" \
    github \
    --organization thewca \
    --team "WST Admin" \
    --token $token \
    $authorized_keys_path

  # Add keys used by GitHub Actions workflows.
  echo "" >> $authorized_keys_path
  echo "# Keys for GitHub Actions workflows" >> $authorized_keys_path
  local github_actions_public_key="$(cat ./.github/key.pub)"
  echo 'command="~/wca-live/bin/update.sh"' $github_actions_public_key >> $authorized_keys_path
}

if [ $# -gt 0 ]; then
  print_usage_and_exit
fi

update_authorized_keys
