# Loads environment variables from an .env file into the current shell session.
load_dotenv() {
  # The -a switch makes any expression like `KEY=value` interpreted as `export KEY=value`.
  set -a
  [ -f .env ] && . .env
  set +a
}
