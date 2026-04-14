const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const taskSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  dueDate: Joi.date().optional().allow(null),
  status: Joi.string().valid('pending', 'completed').optional(),
  categoryId: Joi.string().optional().allow(null),
  tagIds: Joi.array().items(Joi.string()).optional(),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  dueDate: Joi.date().optional().allow(null),
  status: Joi.string().valid('pending', 'completed').optional(),
  categoryId: Joi.string().optional().allow(null),
  tagIds: Joi.array().items(Joi.string()).optional(),
}).min(1);

const categorySchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
});

const tagSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  taskSchema,
  updateTaskSchema,
  categorySchema,
  tagSchema,
};
