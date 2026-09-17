const express = require('express');
const noteController = require('../controllers/noteController');

const router = express.Router();

router.get('/', noteController.index);
router.get('/new', noteController.showNewForm);
router.post('/', noteController.create);
router.get('/:id', noteController.show);
router.post('/:id/delete', noteController.destroy);

module.exports = router;
