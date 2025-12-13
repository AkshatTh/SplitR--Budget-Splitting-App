const express = require('express');
const router = express.Router();
const { createGroup } = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');
const { getGroups } = require('../controllers/groupController');
const { addMember } = require('../controllers/groupController');
const { deleteGroup } = require('../controllers/groupController');
const { removeMember } = require('../controllers/groupController');

router.post('/', protect, createGroup);
router.get('/', protect, getGroups);
router.put('/addmember', protect, addMember);
router.delete('/:id' , protect, deleteGroup);
router.put('/removemember', protect, removeMember);

module.exports = router;