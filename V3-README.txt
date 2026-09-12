SEVENWANDS OVERLAY MANAGER V3
=============================

Important:
- Do NOT run `npm audit fix --force` on this project.
- V3 is pinned to Prisma 7.10.0 and the MariaDB adapter 7.10.0.
- Copy .env.example to .env and fill in your real values before migrations.

Install:
  npm install
  npm run build

Local:
  npm run dev

Database:
  npx prisma generate
  npx prisma migrate deploy

If npm reports vulnerabilities, review them before changing dependency major versions.
