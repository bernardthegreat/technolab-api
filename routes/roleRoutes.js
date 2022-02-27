const { Router } = require('express');
const roleController = require('../controllers/roleController');

const router=Router();

// GET
router.get('/', roleController.getAllRoles)
router.get('/:name', roleController.getAllRoles);
router.get('*', (req,res)=>{
    res.status(404).send({ error: "API not found"});
});


// POST
router.post('/add', roleController.addRole);

// PUT
router.put('/update', roleController.updateRole);

module.exports=router;