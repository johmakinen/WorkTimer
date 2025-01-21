const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

let projects = [];
let singleMode = false;
let logEntries = []; // store session logs

function renderProjects() {
  const container = document.getElementById('projects');
  container.innerHTML = '';
  projects.forEach((project, index) => {
    const projectDiv = document.createElement('div');
    projectDiv.className = 'project-details';

    const projectInfo = document.createElement('div');
    projectInfo.className = 'project-info';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = project.name;
    projectInfo.appendChild(nameSpan);

    projectDiv.appendChild(projectInfo);

    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'button-group';

    const timerSpan = document.createElement('span');
    timerSpan.id = 'timer-' + index;
    timerSpan.textContent = formatTime(project.elapsedTime);
    buttonGroup.appendChild(timerSpan);

    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = project.running ? 'Stop' : 'Start';
    toggleBtn.addEventListener('click', () => toggleTimer(index));
    buttonGroup.appendChild(toggleBtn);

    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset';
    resetBtn.addEventListener('click', () => resetTimer(index));
    buttonGroup.appendChild(resetBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteProject(index));
    buttonGroup.appendChild(deleteBtn);

    projectDiv.appendChild(buttonGroup);
    container.appendChild(projectDiv);
  });
  updateTotalTimer();
  if (ipcRenderer) {
    ipcRenderer.send('adjust-window-size', projects.length);
  }
}

function formatTime(elapsedMs) {
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function updateTimer(index) {
  const project = projects[index];
  const now = Date.now();
  const totalMs = (now - project.startTime) + project.elapsedTime;
  document.getElementById('timer-' + index).textContent = formatTime(totalMs);
}

function updateTotalTimer() {
  let total = 0;
  projects.forEach(p => {
    const now = p.running ? Date.now() - p.startTime + p.elapsedTime : p.elapsedTime;
    total += now;
  });
  document.getElementById('totalTimer').textContent = 'Total: ' + formatTime(total);
}

function toggleTimer(index) {
  const project = projects[index];
  if (!project.running) {
    if (singleMode) stopAllProjects(); // ensure only one runs
    project.startTime = Date.now();
    project.running = true;
    project.intervalId = setInterval(() => {
      updateTimer(index);
      updateTotalTimer();
    }, 1000);
    project.lastStart = new Date().toISOString();
  } else {
    clearInterval(project.intervalId);
    project.elapsedTime += Date.now() - project.startTime;
    project.running = false;
    // log the session
    logEntries.push({
      name: project.name,
      startTime: project.lastStart,
      endTime: new Date().toISOString(),
      duration: (Date.now() - project.startTime) / 1000 // seconds
    });
  }
  renderProjects();
}

function stopAllProjects() {
  projects.forEach((p, idx) => {
    if (p.running) {
      clearInterval(p.intervalId);
      p.elapsedTime += Date.now() - p.startTime;
      p.running = false;
      logEntries.push({
        name: p.name,
        startTime: p.lastStart,
        endTime: new Date().toISOString(),
        duration: (Date.now() - p.startTime) / 1000
      });
    }
  });
}

function resetTimer(index) {
  if (confirm('Are you sure you want to reset the timer?')) {
    const project = projects[index];
    clearInterval(project.intervalId);
    project.startTime = 0;
    project.elapsedTime = 0;
    project.running = false;
    renderProjects();
  }
}

function deleteProject(index) {
  if (confirm('Are you sure you want to delete this project?')) {
    const project = projects[index];
    if (project.running) {
      clearInterval(project.intervalId);
    }
    projects.splice(index, 1);
    renderProjects();
  }
}

function addProject(projectName) {
  if (projects.some(project => project.name === projectName)) {
    alert('A project with this name already exists.');
    return;
  }
  projects.push({
    name: projectName,
    startTime: 0,
    elapsedTime: 0,
    running: false,
    intervalId: null,
    lastStart: null
  });
  renderProjects();
}

function toggleSingleMode() {
  singleMode = !singleMode;
  document.getElementById('singleModeBtn').textContent = `Single Mode: ${singleMode ? 'ON' : 'OFF'}`;
  if (singleMode) stopAllProjects();
}

function saveLogOnExit() {
  stopAllProjects(); // stop all running timers
  if (ipcRenderer) {
    ipcRenderer.send('save-log', logEntries);
  }
}

function suggestProjectNames() {
  const logFilePath = path.join(__dirname, 'worktimer-log.csv');
  if (!fs.existsSync(logFilePath)) return [];

  const data = fs.readFileSync(logFilePath, 'utf8');
  const lines = data.split('\n').slice(1); // skip header
  const projectNames = new Set();

  lines.forEach(line => {
    const [name] = line.split(',');
    if (name) projectNames.add(name);
  });

  return Array.from(projectNames);
}

module.exports = {
  renderProjects,
  formatTime,
  updateTimer,
  updateTotalTimer,
  toggleTimer,
  stopAllProjects,
  resetTimer,
  deleteProject,
  addProject,
  toggleSingleMode,
  saveLogOnExit,
  suggestProjectNames
};