let notes = [
  { id: 1, title: 'Belajar Express', body: 'Setup project MVC sederhana.' },
  { id: 2, title: 'Setup CI/CD', body: 'Build image lalu deploy ke VPS.' },
];
let nextId = 3;

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
