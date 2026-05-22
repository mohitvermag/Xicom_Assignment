const express = require('express');
const uploadDocuments = require('../middleware/uploadMiddleware');
const {
  createCandidate,
  getCandidates,
} = require('../controllers/candidateController');

const router = express.Router();

router.post('/', uploadDocuments, createCandidate);
router.get('/', getCandidates);

module.exports = router;
