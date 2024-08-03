ARG ELIXIR_VERSION=1.14.2
ARG OTP_VERSION=25.2.3
ARG DEBIAN_VERSION=bullseye-20240722-slim

ARG BUILDER_IMAGE="hexpm/elixir:${ELIXIR_VERSION}-erlang-${OTP_VERSION}-debian-${DEBIAN_VERSION}"
ARG RUNNER_IMAGE="debian:${DEBIAN_VERSION}"

# Stage 1: build
FROM ${BUILDER_IMAGE} as build

# Install build dependencies
RUN apt-get update -y && apt-get install -y build-essential git && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -f /var/lib/apt/lists/*_*

WORKDIR /app

# Install hex and rebar
RUN mix local.hex --force && \
    mix local.rebar --force

# Set build ENV
ENV MIX_ENV=prod

# Install mix dependencies
COPY mix.exs mix.lock ./
RUN mix deps.get --only $MIX_ENV
RUN mkdir config

# Copy compile-time config files before we compile dependencies to
# ensure any relevant config change will trigger the dependencies to
# be re-compiled
COPY config/config.exs config/${MIX_ENV}.exs config/
RUN mix deps.compile

COPY client client

# Compile assets
RUN mix do client.setup, client.build

COPY priv priv
COPY lib lib

# Compile the release
RUN mix compile

# Changes to config/runtime.exs don't require recompiling the code
COPY config/runtime.exs config/

COPY rel rel
RUN mix release

# Stage 2: release image
FROM ${RUNNER_IMAGE}

# Install runtime dependencies
RUN apt-get update -y && \
  apt-get install -y libstdc++6 openssl libncurses5 locales \
    # PDF generation
    wkhtmltopdf fonts-freefont-ttf \
    # Getting node IP in env.sh
    curl jq \
  && apt-get clean && rm -f /var/lib/apt/lists/*_*

# Set the locale
RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && locale-gen

ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

WORKDIR /app

# set runner ENV
ENV MIX_ENV=prod

# Only copy the final release from the build stage
COPY --from=build /app/_build/${MIX_ENV}/rel/wca_live ./

CMD ["/app/bin/server"]
