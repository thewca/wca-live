# WCA Live API

GraphQL API for the WCA Live app.

Built with [Phoenix](https://www.phoenixframework.org/) and [Absinthe](https://absinthe-graphql.org/).

## Setup

Requirements:

- Erlang & Elixir
- PostgreSQL
- wkhtmltopdf (on Ubuntu/Debian run `sudo apt update && sudo apt install wkhtmltopdf`)

```sh
# Run the setup task, it installs dependencies and initialized the database.
mix setup
```

## Development

```sh
# Start the server.
mix phx.server
```

Now you can visit [`localhost:4000/api/graphiql`](http://localhost:4000/api/graphiql)
from your browser for an interactive GraphQL client.

## Testing

```sh
# Run all tests.
mix test

# See other usage examples.
mix help test
```
