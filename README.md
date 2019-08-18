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

## Local authentication with OAuth

WCA Live uses OAuth for authentication (meaning that users sign in via the WCA website).
In the development mode, instead of interacting with the real WCA server,
we talk to the [staging server](https://staging.worldcubeassociation.org).
It's similar to the production one, but used for testing purposes.
In particular there is no sensitive data and every user has the password of `wca`.

To sign in do the following:
- navigate to http://localhost:4000/oauth/sign-in
- sign in as [any Delegate](https://staging.worldcubeassociation.org/delegates),
  preferably one with some upcoming competitions (to actually have something to work on)
- click "Authorize"
- navigate to http://localhost:3000/admin, where you should be able to import/manage your competitions

*Technical note: in the development we run two servers: one serving frontend assets
and the other one being our actual backend. While localhost:3000 correctly sends all
API requests to the backend, in order to use OAuth we need to hit the backend directly.*

## Docs

See [docs](docs.md) for some top level notes.
