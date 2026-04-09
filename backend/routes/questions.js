const express = require('express');
const Question = require('../models/Question');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/questions — Post a question
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description, and category are required' });
    }

    const question = await Question.create({
      title,
      description,
      category,
      author: req.user.id,
    });

    return res.status(201).json(question);
  } catch (err) {
    console.error('Create question error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/questions — List all questions with answers
router.get('/', authMiddleware, async (req, res) => {
  try {
    const questions = await Question.find()
      .populate('author', 'name studentId')
      .populate('answers.author', 'name studentId')
      .sort({ createdAt: -1 });
    return res.json(questions);
  } catch (err) {
    console.error('Get questions error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/questions/:id — Update own question
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    if (question.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own questions' });
    }

    const { title, description, category } = req.body;
    if (title) question.title = title;
    if (description) question.description = description;
    if (category) question.category = category;

    await question.save();
    return res.json(question);
  } catch (err) {
    console.error('Update question error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/questions/:id — Delete own question
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    if (question.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own questions' });
    }

    await question.deleteOne();
    return res.json({ message: 'Question deleted' });
  } catch (err) {
    console.error('Delete question error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/questions/:id/answers — Add an answer
router.post('/:id/answers', authMiddleware, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Answer text is required' });

    question.answers.push({ text, author: req.user.id });
    await question.save();

    // Re-populate and return the updated question
    const updated = await Question.findById(req.params.id)
      .populate('author', 'name studentId')
      .populate('answers.author', 'name studentId');

    return res.status(201).json(updated);
  } catch (err) {
    console.error('Add answer error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/questions/:id/answers/:answerId/accept — Accept an answer (question owner only)
router.put('/:id/answers/:answerId/accept', authMiddleware, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    if (question.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the question owner can accept an answer' });
    }

    const answer = question.answers.id(req.params.answerId);
    if (!answer) return res.status(404).json({ message: 'Answer not found' });

    // Unaccept all other answers, then accept this one
    question.answers.forEach((a) => { a.isAccepted = false; });
    answer.isAccepted = true;
    await question.save();

    const updated = await Question.findById(req.params.id)
      .populate('author', 'name studentId')
      .populate('answers.author', 'name studentId');

    return res.json(updated);
  } catch (err) {
    console.error('Accept answer error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
