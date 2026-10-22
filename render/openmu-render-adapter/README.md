# OpenMU on Render — adapter draft

This branch is an isolated deployment adapter for the public upstream project
[Ignies/OpenMu-Client-Babylon](https://github.com/Ignies/OpenMu-Client-Babylon).
It does not replace the existing game on `main`.

## Important before deploying

The upstream installer was designed for a single Linux host running Docker Compose.
Render runs each service separately. In particular, the proxy must translate the
OpenMU connect-server/game-server addresses correctly when the client switches
from port 44405 to game ports 55901–55906. A naive split deployment can show the
web page but fail when entering the world.

Do not deploy a public proxy until its allowed target hosts and ports are pinned.
Do not use the existing `Forge` database in Virginia for Frankfurt services:
Render private networking requires the services and database to be in the same
region.

## Current status

- Source of truth: upstream OpenMu-Client-Babylon (client, proxy, service code, plugins).
- Render deployment: not yet deployed.
- Database: create a dedicated PostgreSQL database in Frankfurt for this game.
- Client/proxy: must use HTTPS/WSS and keepalive handling.
- OpenMU: needs its server-advertised connect/game-server addresses aligned with the
  proxy's private upstream addresses.

## Safe deployment sequence

1. Fork the upstream repository into the GitHub account connected to Render.
2. Add the Render-specific Dockerfiles and a `render.yaml` Blueprint to that fork.
3. Create a dedicated PostgreSQL database in Frankfurt.
4. Deploy the OpenMU private service first and confirm it can migrate/create its schema.
5. Deploy the proxy only after its TCP upstream target allowlist and address rewriting
   have been tested.
6. Deploy the static web client with `VITE_WS_HOST=wss://<proxy-service>.onrender.com`
   and a server-list entry whose target host is the address the proxy can reach.
7. Test account creation, login, character selection, entering the map, reconnecting,
   and persistence after a restart.

## Why this is not a one-click Blueprint yet

A Render Blueprint can create services and environment variables, but it cannot
automatically make OpenMU's TCP connect-server protocol compatible with a separately
hosted proxy. That requires a tested proxy/address configuration, not just YAML.
A half-configured Blueprint would deploy a web page while the actual MMORPG login
or game connection fails.
