const Team = require('../models/Team');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');

// Create a new team
exports.createTeam = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.userId; // Fix: use userId from JWT payload
    const team = new Team({
      name,
      members: [{ userId, role: 'owner' }],
    });
    await team.save();
    res.status(201).json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all teams for the current user
exports.getTeams = async (req, res) => {
  try {
    const userId = req.user.userId;
    const teams = await Team.find({ 'members.userId': userId })
      .populate('members.userId', 'name email');
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single team by ID
exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members.userId', 'name email');
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a team (name only for now)
exports.updateTeam = async (req, res) => {
  try {
    const { name } = req.body;
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a team
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json({ message: 'Team deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Invite a user to the team by email
exports.inviteMember = async (req, res) => {
  try {
    const { email } = req.body;
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User with this email does not exist. Ask them to sign up first.' });
    }
    // Prevent duplicate invitations
    if (team.invitations.some(inv => inv.email === email && inv.status === 'pending')) {
      return res.status(400).json({ error: 'Invitation already sent' });
    }
    team.invitations.push({ email, invitedBy: req.user._id });
    await team.save();

    // Send invitation email
    const subject = `You are invited to join the team: ${team.name}`;
    const text = `You have been invited to join the team "${team.name}" on DataViz. Please log in or sign up to accept the invitation.`;
    const html = `<p>You have been invited to join the team <b>${team.name}</b> on DataViz.</p><p>Please log in or sign up to accept the invitation.</p>`;
    await sendEmail({ to: email, subject, text, html });

    res.json({ message: 'Invitation sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Accept or reject an invitation
exports.respondToInvitation = async (req, res) => {
  try {
    const { teamId, status } = req.body; // status: 'accepted' or 'rejected'
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    const invitation = team.invitations.find(inv => inv.email === req.user.email && inv.status === 'pending');
    if (!invitation) return res.status(404).json({ error: 'Invitation not found' });
    invitation.status = status;
    if (status === 'accepted') {
      team.members.push({ userId: req.user._id, role: 'member' });
    }
    await team.save();
    res.json({ message: `Invitation ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove a member from the team
exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    team.members = team.members.filter(m => m.userId.toString() !== userId);
    await team.save();
    res.json({ message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Change a member's role
exports.changeMemberRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    const member = team.members.find(m => m.userId.toString() === userId);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    member.role = role;
    await team.save();
    res.json({ message: 'Role updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 