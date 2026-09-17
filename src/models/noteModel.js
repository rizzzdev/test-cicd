let notes = [
  { id: 1, title: 'Belajar Express', body: 'Setup project MVC sederhana.' },
  { id: 2, title: 'Setup CI/CD', body: 'Build image lalu deploy ke VPS.' },
  { id: 3, title: 'Setup Husky', body: 'Pre-commit hook dengan lint-staged.' },
  { id: 4, title: 'Setup Docker', body: 'Build image dengan Dockerfile multi-stage.' },
  {
    id: 5,
    title: 'Setup Docker Compose',
    body: 'Jalankan container di VPS dengan docker compose.',
  },
  { id: 6, title: 'Setup Traefik', body: "Reverse proxy dan TLS otomatis lewat Let's Encrypt." },
  { id: 7, title: 'Setup GitHub Actions', body: 'Workflow build, push, dan deploy otomatis.' },
  { id: 8, title: 'Setup Docker Hub', body: 'Registry untuk menyimpan image hasil build.' },
  { id: 9, title: 'Setup SSH Key', body: 'Deploy key khusus untuk akses VPS dari CI/CD.' },
  { id: 10, title: 'Setup GitHub Secrets', body: 'Simpan kredensial sensitif untuk workflow.' },
  { id: 11, title: 'Setup Commitlint', body: 'Wajibkan format Conventional Commits.' },
  { id: 12, title: 'Setup ESLint', body: 'Cek kualitas dan konsistensi kode JavaScript.' },
  { id: 13, title: 'Setup Prettier', body: 'Rapikan format kode secara otomatis.' },
  { id: 14, title: 'Setup EJS View', body: 'Render halaman HTML dari template.' },
  { id: 15, title: 'Setup VPS', body: 'Siapkan Docker, network proxy, dan SSH key deploy.' },
];
let nextId = 16;

function findAll() {
  return notes;
}

function findById(id) {
  return notes.find((note) => note.id === Number(id));
}

function create({ title, body }) {
  const note = { id: nextId++, title, body };
  notes.push(note);
  return note;
}

function update(id, { title, body }) {
  const note = findById(id);
  if (!note) return null;
  note.title = title;
  note.body = body;
  return note;
}

function remove(id) {
  const before = notes.length;
  notes = notes.filter((note) => note.id !== Number(id));
  return notes.length < before;
}

module.exports = { findAll, findById, create, update, remove };
