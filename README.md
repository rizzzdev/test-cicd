# test-cicd

Project Express.js sederhana dengan pola MVC, dilengkapi pre-commit hook (Husky + lint-staged) dan pipeline CI/CD (GitHub Actions) yang build image Docker, push ke Docker Hub, lalu deploy ke VPS via SSH.

## Struktur

```
src/
  controllers/   logika request/response
  models/        data (in-memory untuk contoh ini)
  routes/        definisi endpoint
  views/         template EJS
  public/        aset statis (css)
  app.js         setup express
  server.js      entry point
```

## Menjalankan secara lokal

```bash
cp .env.example .env
npm install
npm run dev
```

Buka http://localhost:3000

## Lint & format

```bash
npm run lint
npm run format
```

Husky menjalankan `lint-staged` otomatis di setiap `git commit` (eslint --fix + prettier pada file yang di-stage).

## Docker

Build image secara lokal:

```bash
docker build -t test-cicd .
docker run -p 3000:3000 test-cicd
```

## CI/CD (GitHub Actions)

Alur di `.github/workflows/deploy.yml`, jalan setiap push ke branch `main`:

1. **build-and-push** — build image Docker lalu push ke Docker Hub dengan tag `latest` dan tag commit SHA.
2. **deploy** — copy `docker-compose.yml` ke VPS, lalu SSH ke VPS untuk `docker compose pull` & `docker compose up -d`. Routing publik ditangani Traefik (lihat label di `docker-compose.yml`).

Panduan lengkap setup VPS, Docker Hub, GitHub Secrets, dan troubleshooting: lihat **[DEPLOYMENT.md](DEPLOYMENT.md)**.

## Alur kerja developer

1. Ubah kode → `git add` → `git commit` (Husky menjalankan lint-staged).
2. `git push origin main`.
3. GitHub Actions otomatis build & push image, lalu deploy ke VPS.
