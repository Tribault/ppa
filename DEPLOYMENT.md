# Deployment

Production runs on an IONOS VPS (Ubuntu 24.04), self-hosted MongoDB, nginx + PM2, no Docker.

- Frontend: `posters.tribault.com` (nginx serves `client/dist` as a static SPA)
- API: `api.posters.tribault.com` (nginx reverse-proxies to the Node app on `127.0.0.1:5000`)
- Repo lives at `/home/thomas/ppa` on the VPS.

## One-time setup
1. MongoDB, Node (via nvm), nginx, PM2, certbot installed on the VPS.
2. DNS: `A` records for both subdomains pointing at the VPS IP.
3. Clone the repo, `npm ci` in both `client/` and `server/`.
4. Copy `server/.env.example` to `server/.env` and fill in real values (`FRONTEND_URL=https://posters.tribault.com`, `MONGO_URI=mongodb://localhost:27017/postersDB`, etc).
5. `client/.env.production` is committed with the real subdomains already — no secrets in it (Vite env vars end up in the public JS bundle regardless).
6. `cd client && npm run build`.
7. Copy `deploy/nginx/*.conf` into `/etc/nginx/sites-available/`, symlink into `sites-enabled/`, `nginx -t && systemctl reload nginx`.
8. `certbot --nginx -d posters.tribault.com -d api.posters.tribault.com`.
9. `pm2 start deploy/ecosystem.config.js --env production && pm2 save`.

## Shipping an update
On the VPS, from the repo root:
```
bash deploy/redeploy.sh
```
Pulls latest, reinstalls deps, rebuilds the client, and reloads the PM2 process.

## Notes
- `server/uploads/` holds real user-uploaded poster images on the VPS disk (not in git) — back it up periodically.
- The Node process binds to `127.0.0.1` only (see `server/server.js`) — nginx is the only intended path in. `ufw` should allow just 22/80/443.
