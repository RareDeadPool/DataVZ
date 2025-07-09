const SupportMessage = require('../models/SupportMessage');
const sendEmail = require('../utils/sendEmail');

const sendSupportMessage = async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  try {
    // Save to database
    const supportMsg = await SupportMessage.create({ name, email, message });

    // Send email to support
    await sendEmail({
      to: 'support@dataviz.com', // Change to your real support email
      subject: 'New Support Message',
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong><br/>${message}</p>`
    });

    return res.json({ success: true, message: 'Support message received.' });
  } catch (err) {
    console.error('Support message error:', err);
    return res.status(500).json({ error: 'Failed to process support message.' });
  }
};

module.exports = { sendSupportMessage }; 