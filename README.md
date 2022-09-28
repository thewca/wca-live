<h1 align="center">WCA Live</h1>
<div align="center">
  <img height="120" src="client/public/favicon.png" />
</div>
<br />
<div align="center">
  <strong>
    Platform for running WCA competitions and sharing live results with the world.
  </strong>
</div>
<br />
<div align="center">

  [![Actions Status](https://github.com/thewca/wca-live/workflows/Test/badge.svg)](https://github.com/thewca/wca-live/actions)
  [![Actions Status](https://github.com/thewca/wca-live/workflows/Deploy/badge.svg)](https://github.com/thewca/wca-live/actions)

</div>

## Introduction


Welcome to the [WCA Live](https://live.worldcubeassociation.org) repository!
Here you can find all the source code that helps to run hundreds of official WCA competitions a year.
Check out the [About](https://live.worldcubeassociation.org/about) page
for more background information on where and how this platform is used.

The app is focused on the administrative side of competitions (round management,
entering results, calculating ranking, proceeding competitors from round to round),
as well as the presentation side (displaying round rankings, records, podiums,
real-time updates as results get entered).

## Design

Briefly speaking, WCA Live is a WCA-integrated application
composed of a web client and a GraphQL API server with
a relational database behind. Let's break it down.

### WCA Integration

First of all we use OAuth2 offered by the WCA website,
so that users authenticate with their existing WCA accounts.
This plays an important role when it comes to granting
users access to administrative competition tasks,
as we can check if the given user is a delegate,
organizer or another staff member at the given competition.

Now to the crucial integration element - data synchronization.
At the WCA we developed a standardized format for exchanging
competition data between tools/systems, it's called
[WCIF](https://github.com/thewca/wcif/blob/master/specification.md) (WCA Competition Interchange Format)
and defines a huge JSON object that contains all relevant competition information
(events, rounds, schedule, competitors, results, etc.).
The idea behind it is to have a well defined data format and
empower developers to build tools working with this data
(more on that in the [vision](https://github.com/thewca/wcif/blob/master/vision.md) document).
The WCA website offers endpoints for fetching and saving data in this format
and that's exactly what WCA Live uses. When a delegate/organizer
imports a competition into the app, we fetch WCIF data for this competition
and save all of it into the database. Later, competition admins can trigger
synchronization, which works both ways: gets new data from the WCA website
saving changes to the local database, and also sends local changes (like results) to the WCA website.
Think of the WCA website as the source of truth
that many tools read from and save data to.
Thanks to this approach delegates/organizers don't have to
enter redundant competition information into WCA Live
and can also use/build additional tools to help them run their competitions.

### Server

The server exposes a [GraphQL](https://graphql.org) API
allowing the client to fetch the necessary subset of data
and subscribe to real-time updates. It is also responsible
for authenticating users with WCA OAuth and generating some PDFs.
Under the hood it often makes requests to the WCA API
in order to fetch/save WCIF data, to get regional records
or to list competitions that the current user may import.
It also uses a relational database as a primary source of data.

### Database

The app uses a relational database, specifically PostgreSQL.
A bunch of information comes from the WCA website and is fetched during competition import.
We get the data in a heavily nested WCIF format and we decompose
it into relevant tables. Some objects are an inherent part of their parent object,
in which case we just store them in a JSON column (e.g. time limit,
cutoff and advancement condition in the `rounds` table).

### Client

The client is a web application built with React.
It talks to the server via the GraphQL API,
this way it always fetches the necessary subset of data
in a single web request. It leverages a library called Apollo
that provides a number of valuable features, from basic ones
like React hooks for querying/mutating data, to more sophisticated ones
like configurable cache with clever updates.

### Deployment

Currently we use a single AWS EC2 instance for hosting the app
and a RDS instance with the database.
To set up a fresh instance we use [this](./bin/setup.sh) tiny script
that basically installs Docker and fetches the app.
The application image is hosted on DockerHub and built automatically.
We have an automated GitHub Actions [workflow](./.github/workflows/deploy.yaml)
that builds the image, pushes them to DockerHub and finally tells the
the app to pick up the new images.

## Development

There are two options when it comes to setting up your development environment.
The Docker based one boils down to running a single command
and is most likely what you want, especially when getting started.

### Docker based setup

Make sure you have Docker and Docker Compose installed.
If you're running Ubuntu/Debian have a look at the [production setup script](./bin/setup.sh),
which contains the relevant installation instructions.

To start all the services just run the following Docker Compose command:

```sh
docker compose -f docker compose.dev.yml up
```

This starts the client, server and database on ports `3000`, `4000` and `5432` respectively.
Make sure those ports are free on your machine, so that Docker can bind the relevant services to them.
Running it for the first time builds the docker images
and installs all dependencies, so it may take a while.
Subsequent runs should be relatively quick.

Once everything is up and running you should be able to access the app at [`localhost:3000`](http://localhost:3000).

Having the containers running you can easily execute custom commands inside them,
just as you'd do on your machine. A few examples:

TODO: update with the latest changes

```sh
# Executing commands in running containers takes the following form:
docker compose -f docker compose.dev.yml exec SERVICE COMMAND

# Run client tests
docker compose -f docker compose.dev.yml exec client npm test

# Run server tests
docker compose -f docker compose.dev.yml exec server mix test

# Run the interactive Elixir shell with all the application modules loaded
docker compose -f docker compose.dev.yml exec server iex -S mix

# Run the database shell
docker compose -f docker compose.dev.yml exec database psql -U postgres wca_live_dev
```

### Manual setup

This option provides more control over the individual parts, but takes more time to set up
and is less reproducible than the Docker based one.

TODO: expand on this

### OAuth during development

In the development environment, instead of interacting with the real WCA server
we talk to the [staging server](https://staging.worldcubeassociation.org).
It's similar to the production one, but used for testing purposes.
In particular there is no sensitive data and every user has the password of `wca`,
so you can sign in as whoever you want.

To have a competition to work on, find an upcoming one with some registered
competitors, then sign in as one of the delegates/organizers and import
the competition under *My competitions*.
