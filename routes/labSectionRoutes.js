const { Router } = require('express');
const labSectionController = require('../controllers/labSectionController');

const router=Router();

// GET
router.get('/', labSectionController.getAllSections)
router.get('/:sectionName', labSectionController.getAllSections);
router.get('*', (req,res)=>{
    res.status(404).send({ error: "API not found"});
});


// POST
router.post('/', labSectionController.addSection);

// PUT
router.put('/:id', labSectionController.updateSection);

module.exports=router;