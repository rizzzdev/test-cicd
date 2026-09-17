const express = require('express');
const noteRoutes = require('./noteRoutes');

const router = express.Router();

router.get('/', (req, res) => res.redirect('/notes'));
router.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
router.use('/notes', noteRoutes);

module.exports = router;
