const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const auth = require('../middleware/auth');

// Create a new team
router.post('/', auth, teamController.createTeam);
// Get all teams for the current user
router.get('/', auth, teamController.getTeams);
// Get a single team by ID
router.get('/:id', auth, teamController.getTeamById);
// Update a team (name only for now)
router.put('/:id', auth, teamController.updateTeam);
// Delete a team
router.delete('/:id', auth, teamController.deleteTeam);
// Invite a user to the team
router.post('/:id/invite', auth, teamController.inviteMember);
// Respond to an invitation (accept/reject)
router.post('/invitation/respond', auth, teamController.respondToInvitation);
// Remove a member from the team
router.post('/:id/remove-member', auth, teamController.removeMember);
// Change a member's role
router.post('/:id/change-role', auth, teamController.changeMemberRole);
// Get all pending invitations for the logged-in user
router.get('/invitations/pending', auth, teamController.getPendingInvitations);

module.exports = router; 