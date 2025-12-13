const express = require('express');
const router = express.Router();
const { createGroup } = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');
const { getGroups } = require('../controllers/groupController');
const { addMember } = require('../controllers/groupController');


router.post('/', protect, createGroup);
router.get('/', protect, getGroups);
router.put('/addmember', protect, addMember);


module.exports = router;