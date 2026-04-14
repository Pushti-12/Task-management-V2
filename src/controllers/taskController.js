const Task = require('../models/Task');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const { taskSchema, updateTaskSchema } = require('../utils/validation');
const { clearReminder, scheduleTaskReminder } = require('../services/reminderService');
const { sendCompletionWebhook } = require('../services/webhookService');

const populateTaskRelations = (query) => query.populate('category').populate('tags');

const trySendCompletionWebhook = async (task) => {
  try {
    await sendCompletionWebhook(task);
  } catch (error) {
    console.error('Completion webhook delivery failed:', error.message);
  }
};

const resolveTaskRelations = async (userId, categoryId, tagIds = []) => {
  let category = null;
  let tags = [];

  if (categoryId) {
    category = await Category.findOne({ _id: categoryId, userId });
    if (!category) {
      return { error: { status: 400, message: 'Invalid categoryId' } };
    }
  }

  if (tagIds.length > 0) {
    tags = await Tag.find({ _id: { $in: tagIds }, userId });
    if (tags.length !== tagIds.length) {
      return { error: { status: 400, message: 'One or more tagIds are invalid' } };
    }
  }

  return {
    category,
    tags,
  };
};

const createTask = async (req, res) => {
  const { error } = taskSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { title, description, dueDate, status, categoryId, tagIds = [] } = req.body;
  const userId = req.user.id;

  try {
    const relations = await resolveTaskRelations(userId, categoryId, tagIds);
    if (relations.error) {
      return res.status(relations.error.status).json({ message: relations.error.message });
    }

    const completedAt = status === 'completed' ? new Date() : null;
    const task = new Task({
      title,
      description,
      dueDate: dueDate || null,
      status,
      userId,
      category: relations.category ? relations.category._id : null,
      tags: relations.tags.map((tag) => tag._id),
      completedAt,
    });
    await task.save();

    scheduleTaskReminder(task);
    if (task.status === 'completed') {
      await trySendCompletionWebhook(task);
    }

    const populatedTask = await populateTaskRelations(Task.findById(task._id));
    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getTasks = async (req, res) => {
  const userId = req.user.id;
  const { categoryId, tagIds } = req.query;

  try {
    const filters = { userId };
    if (categoryId) {
      filters.category = categoryId;
    }

    if (tagIds) {
      filters.tags = { $in: tagIds.split(',').filter(Boolean) };
    }

    const tasks = await populateTaskRelations(Task.find(filters)).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getTask = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const task = await populateTaskRelations(Task.findOne({ _id: id, userId }));
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateTask = async (req, res) => {
  const { error } = updateTaskSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { id } = req.params;
  const userId = req.user.id;

  try {
    const existingTask = await Task.findOne({ _id: id, userId });
    if (!existingTask) return res.status(404).json({ message: 'Task not found' });

    const relations = await resolveTaskRelations(
      userId,
      Object.prototype.hasOwnProperty.call(req.body, 'categoryId') ? req.body.categoryId : existingTask.category,
      Object.prototype.hasOwnProperty.call(req.body, 'tagIds') ? req.body.tagIds : existingTask.tags.map((tagId) => String(tagId))
    );
    if (relations.error) {
      return res.status(relations.error.status).json({ message: relations.error.message });
    }

    const nextStatus = req.body.status || existingTask.status;
    const becameCompleted = existingTask.status !== 'completed' && nextStatus === 'completed';
    const updatePayload = {
      ...req.body,
      category: relations.category ? relations.category._id : null,
      tags: relations.tags.map((tag) => tag._id),
    };

    delete updatePayload.categoryId;
    delete updatePayload.tagIds;

    if (Object.prototype.hasOwnProperty.call(req.body, 'dueDate')) {
      updatePayload.dueDate = req.body.dueDate || null;
    }

    if (becameCompleted) {
      updatePayload.completedAt = new Date();
    } else if (nextStatus !== 'completed') {
      updatePayload.completedAt = null;
    }

    const task = await Task.findOneAndUpdate({ _id: id, userId }, updatePayload, { new: true });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.status === 'completed') {
      clearReminder(task._id);
    } else {
      scheduleTaskReminder(task);
    }

    if (becameCompleted) {
      await trySendCompletionWebhook(task);
    }

    const populatedTask = await populateTaskRelations(Task.findById(task._id));
    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteTask = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const task = await Task.findOneAndDelete({ _id: id, userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    clearReminder(task._id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask };
