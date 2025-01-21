const fs = require('fs');
const path = require('path');

function saveLog(logEntries) {
  let csv = 'Project Name,Start Time,End Time,Duration(s)\n';
  logEntries.forEach(entry => {
    csv += `${entry.name},${entry.startTime},${entry.endTime},${entry.duration}\n`;
  });
  fs.writeFileSync(path.join(__dirname, 'worktimer-log.csv'), csv);
}

module.exports = { saveLog };