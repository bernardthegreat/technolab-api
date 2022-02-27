const { Router } = require('express');
const instrumentController = require('../controllers/instrumentController');

const router=Router();

// GET
router.get('/', instrumentController.getAllInstruments)
router.get('/:instrumentCode', instrumentController.getAllInstruments);
router.get('*', (req,res)=>{
    res.status(404).send({ error: "API not found"});
});


// POST
router.post('/add', instrumentController.addInstrument);

// PUT
router.put('/update/', instrumentController.updateInstrument);

module.exports=router;