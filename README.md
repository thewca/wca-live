# WCA Live

Platform for running WCA competitions and sharing live results with the world.

## Development

Node and MongoDB are required.

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

## Authentication

Navigate to http://localhost:4000/oauth/sign-in and sign in as a Delegate (e.g. 2009SHEP01). Since this is the test database, all passwords are `wca`. Then, go to http://localhost:3000/admin and you should be able to import a competition, open rounds and enter results. The competition should then be visible on the main page at http://localhost:3000.
