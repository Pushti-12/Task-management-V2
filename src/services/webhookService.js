const { writeNotificationLog } = require('./notificationLogger');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sendCompletionWebhook = async (task, attempt = 1) => {
  if (!process.env.ANALYTICS_WEBHOOK_URL) {
    writeNotificationLog('Analytics webhook skipped because ANALYTICS_WEBHOOK_URL is not set', {
      taskId: task._id,
      userId: task.userId,
    });
    return;
  }

  const payload = {
    event: 'task.completed',
    taskId: task._id,
    title: task.title,
    completedAt: task.completedAt || new Date(),
    userId: task.userId,
  };

  try {
    const response = await fetch(process.env.ANALYTICS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Analytics webhook failed with status ${response.status}`);
    }

    writeNotificationLog('Analytics webhook delivered', {
      taskId: task._id,
      attempt,
    });
  } catch (error) {
    if (attempt >= 3) {
      writeNotificationLog('Analytics webhook failed after retries', {
        taskId: task._id,
        error: error.message,
      });
      throw error;
    }

    const backoffMs = 1000 * (2 ** (attempt - 1));
    writeNotificationLog('Analytics webhook retry scheduled', {
      taskId: task._id,
      attempt,
      backoffMs,
      error: error.message,
    });
    await delay(backoffMs);
    return sendCompletionWebhook(task, attempt + 1);
  }
};

module.exports = {
  sendCompletionWebhook,
};
