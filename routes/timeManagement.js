const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/timeManagementController');

router.get('/assignments', protect, ctrl.getAssignments);
router.post('/assignments', protect, ctrl.createAssignment);
router.put('/assignments/:id', protect, ctrl.updateAssignment);
router.delete('/assignments/:id', protect, ctrl.deleteAssignment);

router.get('/study-sessions', protect, ctrl.getStudySessions);
router.post('/study-sessions', protect, ctrl.createStudySession);
router.put('/study-sessions/:id', protect, ctrl.updateStudySession);
router.delete('/study-sessions/:id', protect, ctrl.deleteStudySession);

router.get('/exams', protect, ctrl.getExams);
router.post('/exams', protect, ctrl.createExam);
router.put('/exams/:id', protect, ctrl.updateExam);
router.delete('/exams/:id', protect, ctrl.deleteExam);

module.exports = router;