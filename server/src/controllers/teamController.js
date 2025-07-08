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
    // Populate members.userId before returning
    const populatedTeam = await Team.findById(team._id).populate('members.userId', 'name email');
    res.status(201).json(populatedTeam);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all teams (user-centric)
exports.getTeams = async (req, res) => {
  try {
    const userId = req.user.userId;
    const teams = await Team.find({ 'members.userId': userId }).populate('members.userId', 'name email');
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
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    // Only owner or admin can update
    const member = team.members.find(m => m.userId.toString() === req.user.userId);
    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
      return res.status(403).json({ error: 'Only owners or admins can update the team.' });
    }
    team.name = name;
    await team.save();
    const populatedTeam = await Team.findById(team._id).populate('members.userId', 'name email');
    res.json(populatedTeam);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a team
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    // Only owner can delete
    const member = team.members.find(m => m.userId.toString() === req.user.userId);
    if (!member || member.role !== 'owner') {
      return res.status(403).json({ error: 'Only owners can delete the team.' });
    }
    await Team.findByIdAndDelete(req.params.id);
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

    // Send invitation email first
    const subject = `You are invited to join the team: ${team.name}`;
    const text = `You have been invited to join the team "${team.name}" on DataViz. Please log in or sign up to accept the invitation.`;
    const html = `<p>You have been invited to join the team <b>${team.name}</b> on DataViz.</p><p>Please log in or sign up to accept the invitation.</p>`;
    try {
      await sendEmail({ to: email, subject, text, html });
    } catch (emailErr) {
      console.error('Failed to send invitation email:', emailErr);
      return res.status(500).json({ error: 'Failed to send invitation email. Please check your email configuration.' });
    }

    // Only save the invitation if email was sent successfully
    team.invitations.push({ email, invitedBy: req.user.userId });
    await team.save();

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
      // Prevent duplicate member entries
      if (!team.members.some(m => m.userId.toString() === req.user.userId)) {
        team.members.push({ userId: req.user.userId, role: 'member' });
      }
    }
    await team.save();
    // Return the updated team with populated members
    const updatedTeam = await Team.findById(teamId).populate('members.userId', 'name email');
    res.json({ message: `Invitation ${status}`, team: updatedTeam });
  } catch (err) {
    console.error('Error in respondToInvitation:', err);
    res.status(500).json({ error: err.message });
  }
};

// Remove a member from the team
exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    const actingMember = team.members.find(m => m.userId.toString() === req.user.userId);
    const targetMember = team.members.find(m => m.userId.toString() === userId);
    if (!actingMember || (actingMember.role !== 'owner' && actingMember.role !== 'admin')) {
      return res.status(403).json({ error: 'Only owners or admins can remove members.' });
    }
    if (targetMember && targetMember.role === 'owner' && actingMember.role !== 'owner') {
      return res.status(403).json({ error: 'Only owners can remove other owners.' });
    }
    team.members = team.members.filter(m => m.userId.toString() !== userId);
    await team.save();
    const populatedTeam = await Team.findById(team._id).populate('members.userId', 'name email');
    res.json({ message: 'Member removed', team: populatedTeam });
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
    const actingMember = team.members.find(m => m.userId.toString() === req.user.userId);
    const targetMember = team.members.find(m => m.userId.toString() === userId);
    if (!actingMember || (actingMember.role !== 'owner' && actingMember.role !== 'admin')) {
      return res.status(403).json({ error: 'Only owners or admins can change roles.' });
    }
    if (targetMember && targetMember.role === 'owner' && actingMember.role !== 'owner') {
      return res.status(403).json({ error: 'Only owners can change the role of other owners.' });
    }
    targetMember.role = role;
    await team.save();
    const populatedTeam = await Team.findById(team._id).populate('members.userId', 'name email');
    res.json({ message: 'Role updated', team: populatedTeam });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all teams where the logged-in user has a pending invitation
exports.getPendingInvitations = async (req, res) => {
  try {
    const email = req.user.email;
    const teams = await Team.find({
      'invitations': { $elemMatch: { email, status: 'pending' } }
    }).select('name _id invitations');
    // Filter invitations to only include the relevant one for this user
    const pendingInvites = teams.map(team => ({
      teamId: team._id,
      teamName: team.name,
      invitation: team.invitations.find(inv => inv.email === email && inv.status === 'pending')
    }));
    res.json(pendingInvites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 