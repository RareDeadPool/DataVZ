const mongoose = require('mongoose');
const Project = require('./src/models/Project');
const Team = require('./src/models/Team');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dataviz';

async function main() {
  const [,, PROJECT_ID, TEAM_ID, USER_ID] = process.argv;
  if (!PROJECT_ID || !TEAM_ID || !USER_ID) {
    console.log('Usage: node fixProjectTeamUser.js <PROJECT_ID> <TEAM_ID> <USER_ID>');
    process.exit(1);
  }
  await mongoose.connect(MONGO_URI);
  // Fix project
  const project = await Project.findById(PROJECT_ID);
  if (!project) {
    console.log('Project not found');
    process.exit(1);
  }
  if (!project.teams.map(t => t.toString()).includes(TEAM_ID)) {
    project.teams.push(TEAM_ID);
    await project.save();
    console.log('Team added to project.');
  } else {
    console.log('Team already present in project.');
  }
  // Fix team
  const team = await Team.findById(TEAM_ID);
  if (!team) {
    console.log('Team not found');
    process.exit(1);
  }
  if (!team.members.some(m => m.userId.toString() === USER_ID)) {
    team.members.push({ userId: USER_ID, role: 'member' });
    await team.save();
    console.log('User added to team.');
  } else {
    console.log('User already in team.');
  }
  await mongoose.disconnect();
  console.log('Done.');
}

main(); 