const { Router } = require('express');
const laboratoryController = require('../controllers/laboratoryController');

const router=Router();

// GET
router.get('/', laboratoryController.getAllLaboratories)
router.get('/:labName', laboratoryController.getAllLaboratories);
router.get('*', (req,res)=>{
    res.status(404).send({ error: "API not found"});
});


// POST
router.post('/add', laboratoryController.addLaboratory);

// PUT
router.put('/update', laboratoryController.updateLaboratory);

module.exports=router;