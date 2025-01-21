const { expect } = require('chai');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const sinon = require('sinon');

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const { window } = new JSDOM(html, { runScripts: 'dangerously' });
global.window = window;
global.document = window.document;

// Mock the require function
global.require = (module) => {
  if (module === 'electron') {
    return { ipcRenderer: { send: sinon.stub() } };
  }
  return require(module);
};

const {
  renderProjects,
  addProject,
  deleteProject,
  resetTimer,
  toggleTimer,
  stopAllProjects,
  suggestProjectNames
} = require('../functions');

describe('WorkTimer Functions', () => {
  beforeEach(() => {
    // Reset the DOM and projects array before each test
    document.body.innerHTML = html;
    global.projects = [];
  });

  it('should add a project', () => {
    addProject('Test Project');
    expect(projects).to.have.lengthOf(1);
    expect(projects[0].name).to.equal('Test Project');
  });

  it('should not add a project with a duplicate name', () => {
    addProject('Test Project');
    addProject('Test Project');
    expect(projects).to.have.lengthOf(1);
  });

  it('should delete a project', () => {
    addProject('Test Project');
    deleteProject(0);
    expect(projects).to.have.lengthOf(0);
  });

  it('should reset a project timer', () => {
    addProject('Test Project');
    toggleTimer(0);
    setTimeout(() => {
      resetTimer(0);
      expect(projects[0].elapsedTime).to.equal(0);
      expect(projects[0].running).to.be.false;
    }, 1000);
  });

  it('should toggle a project timer', () => {
    addProject('Test Project');
    toggleTimer(0);
    expect(projects[0].running).to.be.true;
    toggleTimer(0);
    expect(projects[0].running).to.be.false;
  });

  it('should stop all projects', () => {
    addProject('Test Project 1');
    addProject('Test Project 2');
    toggleTimer(0);
    toggleTimer(1);
    stopAllProjects();
    expect(projects[0].running).to.be.false;
    expect(projects[1].running).to.be.false;
  });

  it('should suggest project names from log file', () => {
    const logFilePath = path.join(__dirname, '../worktimer-log.csv');
    fs.writeFileSync(logFilePath, 'Project Name,Start Time,End Time,Duration(s)\nTest Project,2023-10-01T00:00:00Z,2023-10-01T01:00:00Z,3600\n');
    const suggestions = suggestProjectNames();
    expect(suggestions).to.include('Test Project');
    fs.unlinkSync(logFilePath);
  });
});
