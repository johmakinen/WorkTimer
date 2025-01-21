const fs = require('fs');
const path = require('path');

function saveLog(logEntries) {
  const logFilePath = path.join(__dirname, 'worktimer-log.csv');
  let csv = '';
  if (!fs.existsSync(logFilePath)) {
    csv += 'Project Name,Start Time,End Time,Duration(s)\n';
  }
  logEntries.forEach(entry => {
    csv += `${entry.name},${entry.startTime},${entry.endTime},${entry.duration}\n`;
  });
  fs.appendFileSync(logFilePath, csv);
}

module.exports = { saveLog };