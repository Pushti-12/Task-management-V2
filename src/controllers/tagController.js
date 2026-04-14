const Tag = require('../models/Tag');
const Task = require('../models/Task');
const { tagSchema } = require('../utils/validation');

const createTag = async (req, res) => {
  const { error } = tagSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const tag = await Tag.create({
      name: req.body.name.trim(),
      userId: req.user.id,
    });

    res.status(201).json(tag);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Tag already exists' });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

const getTags = async (req, res) => {
  try {
    const tags = await Tag.find({ userId: req.user.id }).sort({ name: 1 });
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateTag = async (req, res) => {
  const { error } = tagSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const tag = await Tag.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name: req.body.name.trim() },
      { new: true }
    );

    if (!tag) return res.status(404).json({ message: 'Tag not found' });
    res.json(tag);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Tag already exists' });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

const deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!tag) return res.status(404).json({ message: 'Tag not found' });

    await Task.updateMany(
      { userId: req.user.id },
      { $pull: { tags: tag._id } }
    );

    res.json({ message: 'Tag deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createTag,
  deleteTag,
  getTags,
  updateTag,
};
