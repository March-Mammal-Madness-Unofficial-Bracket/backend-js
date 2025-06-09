# MMM JavaScript Backend 


## Quick Start

To run this app, clone the repository and install dependencies:

```bash
$ git clone https://github.com/passport/todos-express-password.git
$ cd todos-express-password
$ npm install
```

Then start the server.

```bash
$ npm start
```

Navigate to [`http://localhost:3000`](http://localhost:3000).

## Production Deployment

Get a Cloudflare Tunnel token, and put it in the .env file:

```
CF_TOKEN=thisisafaketoken
```

build the Docker image for the backend

```bash
$ docker compose build
```

run the code:

```bash
$ docker compose up
```

The server will then be accessible from the Cloudflare Tunnel's output
