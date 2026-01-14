# Auth Service – Docker

This folder contains a minimal containerization setup for the Auth service and a local MongoDB using Docker.

## Prerequisites

- Docker Desktop 4.x+

## Quick start

1. (Optional) Copy `.env.example` to `.env` and adjust values for local, if you plan to run outside Docker. Docker Compose already injects the required variables.
2. Build and start services:

```bash
# From the auth/ directory
docker compose up -d --build
```

3. Verify the service is healthy:

```bash
curl http://localhost:3000/api/health
```

You should see:

```json
{ "status": "OK", "message": "Auth service is running" }
```

## Services

- auth (Node.js, port 3000)
- mongo (MongoDB 7, port 27017)

`MONGO_URI` inside the `auth` container points to `mongodb://mongo:27017/auth` via Docker network.

## Common commands

```bash
# View logs
docker compose logs -f auth

# Restart only the auth service
docker compose up -d --build auth

# Stop everything
docker compose down

# Stop and remove volumes (Mongo data)
docker compose down -v
```

## Notes

- Set a strong `JWT_SECRET` in `docker-compose.yml` or via environment variables before deploying.
- For production, consider adding Mongo authentication and updating `MONGO_URI` accordingly.
