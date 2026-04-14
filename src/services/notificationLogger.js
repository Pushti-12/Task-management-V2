const fs = require('fs');
const path = require('path');

const logDirectory = path.join(process.cwd(), 'logs');
const notificationLogFile = path.join(logDirectory, 'notifications.log');

const ensureLogFile = () => {
  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
  }
};

const writeNotificationLog = (message, payload) => {
  ensureLogFile();
  const entry = `[${new Date().toISOString()}] ${message} ${JSON.stringify(payload)}\n`;
  fs.appendFileSync(notificationLogFile, entry);
  console.log(message, payload);
};

module.exports = {
  writeNotificationLog,
};
