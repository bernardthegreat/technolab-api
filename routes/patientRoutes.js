const { Router } = require('express');
const patientController = require('../controllers/patientController');

const router=Router();

// GET
// router.get('/', patientController.getAllPatients)
// router.get('/:patientNo', patientController.getAllPatients);
// router.get('*', (req,res)=>{
//     res.status(404).send({ error: "API not found"});
// });


// POST
// router.post('/add', patientController.addUser);

// PUT
// router.put('/update/', patientController.updateUser);

module.exports=router;