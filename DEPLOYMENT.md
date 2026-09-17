# Panduan Deployment (CI/CD)

Panduan step-by-step untuk menyiapkan pipeline: push ke GitHub → GitHub Actions build & push image ke Docker Hub → deploy otomatis ke VPS via Traefik.

## Ringkasan Alur

```
git push (main)
      │
      ▼
GitHub Actions: build-and-push
  - build image dari Dockerfile
  - push ke Docker Hub (tag: latest, <sha>)
      │
      ▼
GitHub Actions: deploy
  - scp docker-compose.yml ke VPS
  - ssh ke VPS: docker compose pull && docker compose up -d
      │
      ▼
Traefik (di VPS) route domain -> container app (port 3022)
```

---

## 1. Persiapan Docker Hub

1. Buat akun/login di https://hub.docker.com.
2. Buat repository image, misal `test-cicd` (public atau private, bebas).
3. Buat Access Token: **Account Settings → Security → New Access Token**.
   - Simpan token ini, dipakai untuk secret `DOCKERHUB_TOKEN` (jangan pakai password akun).

---

## 2. Persiapan VPS

Asumsi: VPS sudah menjalankan **Traefik** sebagai reverse proxy dengan entrypoint `websecure` dan certresolver `myresolver` (untuk TLS/Let's Encrypt). Jika Traefik belum ada, setup itu di luar cakupan panduan ini.

### 2.1 Install Docker & Docker Compose plugin (jika belum ada)

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

Logout/login ulang agar user bisa jalankan `docker` tanpa `sudo`.

### 2.2 Buat network `proxy` (jika belum ada)

Traefik dan container app harus berada di network Docker yang sama:

```bash
docker network create proxy
```

Pastikan container Traefik juga terhubung ke network `proxy` ini (cek `docker network inspect proxy`).

### 2.3 Buat folder deploy

```bash
mkdir -p ~/apps/test-cicd
```

Path ini nanti diisi ke secret `VPS_PROJECT_PATH` (contoh: `/home/USER/apps/test-cicd`).

### 2.4 Siapkan file `.env` di folder deploy (opsional tapi disarankan)

Berisi variable yang dibutuhkan `docker-compose.yml`:

```bash
cd ~/apps/test-cicd
cat > .env <<'EOF'
DOCKERHUB_USERNAME=usernamekamu
IMAGE_TAG=latest
DOMAIN_NAME=voter.rizzz.dev
EOF
```

Lihat [.env.example](.env.example) untuk daftar lengkap env yang dibutuhkan project ini.

> `docker compose` otomatis membaca file `.env` di folder yang sama saat menjalankan `docker compose pull/up`.

### 2.5 Buat SSH key khusus untuk GitHub Actions

Dari **local machine** (bukan di VPS), generate key pair baru khusus deploy (jangan pakai key pribadi kamu):

```bash
ssh-keygen -t ed25519 -f deploy_key -C "github-actions-deploy" -N ""
```

Ini menghasilkan 2 file: `deploy_key` (private) dan `deploy_key.pub` (public).

Copy public key ke VPS:

```bash
ssh-copy-id -i deploy_key.pub -p <PORT_SSH> user@<VPS_HOST>
# atau manual: tempel isi deploy_key.pub ke ~/.ssh/authorized_keys di VPS
```

Isi file `deploy_key` (private key) nanti dipakai untuk secret `VPS_SSH_KEY` — **jangan pernah commit file ini ke git**.

---

## 3. Setup GitHub Secrets

Di repo GitHub: **Settings → Secrets and variables → Actions → New repository secret**. Tambahkan:

| Secret               | Isi                                                            |
| -------------------- | -------------------------------------------------------------- |
| `DOCKERHUB_USERNAME` | Username Docker Hub                                            |
| `DOCKERHUB_TOKEN`    | Access token dari langkah 1.3                                  |
| `VPS_HOST`           | IP atau domain VPS                                             |
| `VPS_USERNAME`       | User SSH di VPS (mis. `deploy` atau `root`)                    |
| `VPS_SSH_KEY`        | Isi lengkap **private key** `deploy_key` dari langkah 2.5      |
| `VPS_PORT`           | Port SSH VPS (opsional, default `22` kalau tidak diisi)        |
| `VPS_PROJECT_PATH`   | Path folder deploy di VPS (mis. `/home/deploy/apps/test-cicd`) |

Untuk `VPS_SSH_KEY`, paste seluruh isi file `deploy_key`, termasuk baris `-----BEGIN OPENSSH PRIVATE KEY-----` dan `-----END OPENSSH PRIVATE KEY-----`.

---

## 4. Sesuaikan Domain

Domain diambil dari variabel `DOMAIN_NAME` di file `.env` VPS (lihat langkah 2.4), dibaca oleh label Traefik di [docker-compose.yml](docker-compose.yml):

```yaml
- 'traefik.http.routers.cicd.rule=Host(`${DOMAIN_NAME}`)'
```

Pastikan DNS domain tersebut sudah diarahkan (A record) ke IP VPS sebelum deploy pertama, supaya Traefik bisa terbitkan sertifikat TLS lewat `myresolver`.

---

## 5. Jalankan Pipeline

```bash
git add .
git commit -m "setup project"
git push origin main
```

Setelah push, cek tab **Actions** di GitHub repo:

1. Job `build-and-push` — pastikan sukses (image ter-push ke Docker Hub).
2. Job `deploy` — pastikan sukses (scp + ssh ke VPS berhasil).

---

## 6. Verifikasi di VPS

```bash
cd ~/apps/test-cicd
docker compose ps
docker compose logs -f
```

Buka `https://voter.rizzz.dev` (atau domain yang dipakai) — pastikan TLS aktif dan halaman Notes App muncul.

---

## Troubleshooting

- **Job `deploy` gagal `Permission denied (publickey)`** — pastikan public key sudah benar-benar ada di `~/.ssh/authorized_keys` VPS dan permission folder `.ssh` (700) & file `authorized_keys` (600) benar.
- **Traefik tidak route ke container (404/502)** — pastikan container app konek ke network `proxy` yang sama dengan Traefik (`docker network inspect proxy`), dan label `traefik.http.services.cicd.loadbalancer.server.port` (3022) sama dengan port yang didengarkan app di dalam container.
- **`docker compose pull` gagal "pull access denied"** — pastikan image repository di Docker Hub sudah dibuat dan `DOCKERHUB_USERNAME`/`IMAGE_TAG` di `.env` VPS sudah benar; kalau repo private, pastikan VPS juga sudah `docker login` sekali secara manual.
- **Sertifikat TLS tidak keluar** — cek log Traefik, biasanya karena DNS domain belum mengarah ke IP VPS, atau certresolver `myresolver` belum dikonfigurasi di Traefik.
