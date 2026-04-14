const express = require('express');
const auth = require('../middleware/auth');
const {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} = require('../controllers/categoryController');

const router = express.Router();

router.use(auth);

router.post('/', createCategory);
router.get('/', getCategories);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
