const noteModel = require('../models/noteModel');

function index(req, res) {
  const notes = noteModel.findAll();
  res.render('notes/index', { notes });
}

function showNewForm(req, res) {
  res.render('notes/new');
}

function create(req, res) {
  const { title, body } = req.body;
  noteModel.create({ title, body });
  res.redirect('/notes');
}

function show(req, res) {
  const note = noteModel.findById(req.params.id);
  if (!note) return res.status(404).render('notes/not-found');
  res.render('notes/show', { note });
}

function destroy(req, res) {
  noteModel.remove(req.params.id);
  res.redirect('/notes');
}

module.exports = { index, showNewForm, create, show, destroy };
