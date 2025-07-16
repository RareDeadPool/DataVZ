const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/avatars'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, req.user.userId + '_' + Date.now() + ext);
  }
});
const upload = multer({ storage });

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);
router.post('/avatar', auth, upload.single('avatar'), authController.uploadAvatar);
router.post('/request-password-change', authController.requestPasswordChange);
router.put('/password', authController.changePassword);
router.delete('/profile', auth, authController.deleteAccount);
router.get('/users', auth, authController.getAllUsers); // admin only
router.put('/users/role', auth, authController.updateUserRole); // admin only
router.put('/users/status', auth, authController.updateUserStatus); // admin only

module.exports = router; 