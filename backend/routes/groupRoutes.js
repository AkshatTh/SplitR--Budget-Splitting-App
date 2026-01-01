const express = require('express');
const router = express.Router();
const { createGroup, getGroups, getGroupById, addMember, deleteGroup, removeMember } = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');


router.post('/', protect, createGroup);
router.get('/', protect, getGroups);
router.get('/:id', protect, getGroupById);
router.put('/:id/member', protect, addMember);
router.delete('/:id', protect, deleteGroup);
router.put('/:id/member/remove', protect, removeMember);




module.exports = router