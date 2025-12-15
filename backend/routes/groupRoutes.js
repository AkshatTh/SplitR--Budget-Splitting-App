const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    createGroup, 
    getGroups, 
    addMember, 
    deleteGroup, 
    removeMember,
    getGroupById 
} = require('../controllers/groupController');

router.post('/', protect, createGroup);
router.get('/', protect, getGroups);
router.put('/addmember', protect, addMember);
router.put('/removemember', protect, removeMember);
router.get('/:id', protect, getGroupById); 

router.delete('/:id' , protect, deleteGroup);

module.exports = router;