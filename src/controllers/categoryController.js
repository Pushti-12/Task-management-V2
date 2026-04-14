const Category = require('../models/Category');
const Task = require('../models/Task');
const { categorySchema } = require('../utils/validation');

const createCategory = async (req, res) => {
  const { error } = categorySchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const category = await Category.create({
      name: req.body.name.trim(),
      userId: req.user.id,
    });

    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.user.id }).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateCategory = async (req, res) => {
  const { error } = categorySchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name: req.body.name.trim() },
      { new: true }
    );

    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!category) return res.status(404).json({ message: 'Category not found' });

    await Task.updateMany(
      { userId: req.user.id, category: category._id },
      { $unset: { category: 1 } }
    );

    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
};
