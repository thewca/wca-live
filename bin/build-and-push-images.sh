#!/bin/bash

set -e
cd "$(dirname "$0")/.."

# Here we build all Docker images for deployment.
# As you can see it's not a simple `docker build`
# or even `docker-compose build`. There's quite some investigation
# behind it, so bear with me.

# Docker builds every image by going through Dockerfile top-down
# and building a new layer whenever there's a step mutating the image.
# On subsequent builds those layers are reused if possible,
# e.g. a source code change doesn't usually affect first n steps
# in a Dockerfile, like installing system packages and other dependencies,
# so those steps may effectively be cached.
# This approach brings a significant boost to subsequent build times.

# In a CI environment we usually get a brand new virtual machine,
# so any local cache from previous builds is gone.
# There are several ways to work around that,
# for instance we may *inline* all the data necessary for caching
# into an image and push it to the registry of choice.
# Then before a new build we pull the image and specify it as a cache source
# (see https://docs.docker.com/engine/reference/commandline/build/#specifying-external-cache-sources).
# This approach however doesn't work with multi-stage builds, which we use.

# That's where BuildKit (https://github.com/moby/buildkit) comes in.
# It's an improved toolkit for building Docker images (possibly the default in the future).
# It brings many performance improvements out of the box (like parallelization of multi-stage builds)
# and entirely new features as well.
# What's crucial in our case is the ability to effectively cache multi-stage builds!
# Basically it packs the cache data (layers, metadata) together
# and offers several strategies of exporting it.
# Conveniently, we may export this data to a remote registry just like with a regular image.
# Then we simply specify that location as cache source for the subsequent build.
# Sounds cool, right?

# There are several ways to actually use BuildKit:
#   * install the buildkitd daemon and buildctl client
#   * execute the build in a Docker container provided by BuildKit,
#     it contains both the buildkitd daemon and buildctl client
#   * use buildx - a wrapper on top of BuildKit with interface similar to `docker build`
#
# The last option is kinda experimental at this point,
# while the first one requires an additional setup.
# The second option doesn't require any additional setup
# and is actually pretty straightforward, so that's what we're going to use.

# For more details see the BuildKit documentation (https://github.com/moby/buildkit).

# The final approach is mostly based on this article: https://bit.ly/3bV8KSC.
# For some context you may also read this one: https://bit.ly/3mlcHow
# (it shows buildx, but that's analogous and provides valueable insights).

services=(client server nginx)

for service in "${services[@]}"; do
  service_dir="$(pwd)/$service"
  repo="thewca/wca-live-$service"
  image_tag="$repo:latest"
  cache_tag="$repo:cache"

  echo -e "### Building $image_tag ###\n"

  docker run \
    --rm \
    --privileged \
    -v $service_dir:/tmp/service \
    -v $HOME/.docker:/root/.docker \
    --entrypoint buildctl-daemonless.sh \
    moby/buildkit:latest \
      build \
      --frontend dockerfile.v0 \
      --local context=/tmp/service \
      --local dockerfile=/tmp/service \
      --output type=image,name=$image_tag,push=true \
      --export-cache mode=max,type=registry,ref=$cache_tag,push=true \
      --import-cache type=registry,ref=$cache_tag

  echo -e "\n"
done
