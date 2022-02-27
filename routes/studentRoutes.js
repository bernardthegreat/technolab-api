const { Router }=require('express');
const studentController=require('../controllers/studentController');


const router=Router();
router.get('/info/:sn',studentController.studentinfo_get);
router.get('/grades/:sn',studentController.studentgrades_get);

router.post('/transactions',studentController.studentTransac_get); //For Mobile app
router.post('/olpayments',studentController.studentPayment_get); //For Mobile app


router.get('/registration/:sn',studentController.studentregistration_get);
router.get('/registration/:sn/:semester',studentController.studentregistration_get);
router.get('/load:sn',studentController.studentload_get);
router.get('/form9/:sn',studentController.studentform9_get);

router.get('/academic-records-transactions/',studentController.student_academic_records_get);
router.post('/request-academic-records/',studentController.student_academic_records_get);




router.get('*', (req,res)=>{
    res.status(400).send({ error: "API not found"});
});

module.exports=router;