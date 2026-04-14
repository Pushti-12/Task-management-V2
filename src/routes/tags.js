const express = require('express');
const auth = require('../middleware/auth');
const {
  createTag,
  deleteTag,
  getTags,
  updateTag,
} = require('../controllers/tagController');

const router = express.Router();

router.use(auth);

router.post('/', createTag);
router.get('/', getTags);
router.put('/:id', updateTag);
router.delete('/:id', deleteTag);

module.exports = router;
