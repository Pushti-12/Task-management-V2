const Task = require('../models/Task');
const { writeNotificationLog } = require('./notificationLogger');

const REMINDER_LEAD_TIME_MS = 60 * 60 * 1000;
const scheduledReminders = new Map();

const clearReminder = (taskId) => {
  const existingReminder = scheduledReminders.get(String(taskId));
  if (existingReminder) {
    clearTimeout(existingReminder);
    scheduledReminders.delete(String(taskId));
  }
};

const sendReminderWebhook = async (task) => {
  if (!process.env.REMINDER_WEBHOOK_URL) {
    return;
  }

  const response = await fetch(process.env.REMINDER_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'task.reminder',
      taskId: task._id,
      title: task.title,
      dueDate: task.dueDate,
      userId: task.userId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Reminder webhook failed with status ${response.status}`);
  }
};

const triggerReminder = async (taskId) => {
  scheduledReminders.delete(String(taskId));

  const task = await Task.findById(taskId).populate('category').populate('tags');
  if (!task || task.status === 'completed' || !task.dueDate) {
    return;
  }

  const reminderPayload = {
    taskId: task._id,
    title: task.title,
    dueDate: task.dueDate,
    category: task.category ? task.category.name : null,
    tags: task.tags.map((tag) => tag.name),
    userId: task.userId,
  };

  writeNotificationLog('Task reminder triggered', reminderPayload);

  try {
    await sendReminderWebhook(task);
  } catch (error) {
    writeNotificationLog('Task reminder webhook failed', {
      taskId: task._id,
      error: error.message,
    });
  }
};

const scheduleTaskReminder = (task) => {
  clearReminder(task._id);

  if (!task.dueDate || task.status === 'completed') {
    return;
  }

  const dueDateMs = new Date(task.dueDate).getTime();
  const reminderTimeMs = dueDateMs - REMINDER_LEAD_TIME_MS;
  const now = Date.now();

  if (dueDateMs <= now) {
    return;
  }

  const delay = reminderTimeMs <= now ? 1000 : reminderTimeMs - now;
  const timeout = setTimeout(() => {
    triggerReminder(task._id).catch((error) => {
      writeNotificationLog('Task reminder processing failed', {
        taskId: task._id,
        error: error.message,
      });
    });
  }, delay);

  scheduledReminders.set(String(task._id), timeout);
};

const initializeReminderScheduler = async () => {
  const tasks = await Task.find({
    dueDate: { $ne: null },
    status: 'pending',
  });

  tasks.forEach((task) => scheduleTaskReminder(task));
};

module.exports = {
  clearReminder,
  initializeReminderScheduler,
  scheduleTaskReminder,
};
