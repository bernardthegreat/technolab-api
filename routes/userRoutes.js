const { Router } = require('express');
const userController = require('../controllers/userController');

const router=Router();

// GET
router.get('/', userController.getAllUsers)
router.get('/:username', userController.getAllUsers);
router.get('*', (req,res)=>{
    res.status(404).send({ error: "API not found"});
});


// POST
router.post('/add', userController.addUser);

// PUT
router.put('/update/', userController.updateUser);

module.exports=router;