<h1 align="center">WCA Live</h1>
<div align="center">
  <img height="100" src="client/public/favicon.png" />
</div>
<br />
<div align="center">
  <strong>
    Platform for running WCA competitions and sharing live results with the world.
  </strong>
</div>
<br />

[![Build status](https://travis-ci.com/thewca/wca-live.svg?branch=master)](https://travis-ci.com/thewca/wca-live)

## Development

Node.js and MongoDB are required.

```bash
git clone https://github.com/thewca/wca-live.git && cd wca-live
```

**Server**

```bash
cd server
npm install
npm start
```

**Client**

```bash
cd client
npm install
npm start
```

## Authentication with OAuth

WCA Live uses OAuth for authentication (meaning that users sign in via the WCA website).
In the development mode, instead of interacting with the real WCA server,
we talk to the [staging server](https://staging.worldcubeassociation.org).
It's similar to the production one, but used for testing purposes.
In particular there is no sensitive data and every user has the password of `wca`.

To sign in do the following:
- navigate to http://localhost:3000/admin and hit "Sign in"
- sign in as [any Delegate](https://staging.worldcubeassociation.org/delegates),
  preferably one with some upcoming competitions (to actually have something to work on)
- click "Authorize"
- now you should be able to import and manage "your" competitions

## Docs

See [docs](docs.md) for some top level notes.
