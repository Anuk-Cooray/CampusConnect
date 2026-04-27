const express = require('express');
const Job = require('../models/Job');

const router = express.Router();
const GEMINI_MODEL = 'gemini-2.0-flash';

router.post('/', async (req, res) => {
  try {
    const { title, company, description, jobType, postedBy } = req.body;
    const newJob = new Job({ title, company, description, jobType, postedBy });
    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/jobs/sync (MOCK API SYNC)
// @desc    Inject a batch of industry jobs instantly
router.post('/sync', async (req, res) => {
  try {
    const jobsToSync = req.body.jobs;

    if (!jobsToSync || !Array.isArray(jobsToSync)) {
      return res.status(400).json({ message: 'Invalid data format.' });
    }

    const defaultPostedBy = '65e4a3b2c1f8d900123abcde';
    const normalizedJobs = jobsToSync.map((job) => ({
      ...job,
      postedBy: job.postedBy || defaultPostedBy,
    }));

    const insertedJobs = await Job.insertMany(normalizedJobs);

    res.status(201).json({
      message: `Successfully synced ${insertedJobs.length} live jobs!`,
      insertedJobs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/jobs/ai-assist
// @desc    Get AI recommendations for jobs and profile improvements
router.post('/ai-assist', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ message: 'GEMINI_API_KEY is missing in backend/.env' });
    }

    const { jobs = [], profile = {}, targetRole = '' } = req.body || {};
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return res.status(400).json({ message: 'Jobs list is required' });
    }

    const prompt = `
You are an AI career assistant for university students.
Analyze the student's profile and available jobs, then return STRICT JSON.

Student profile:
${JSON.stringify(profile, null, 2)}

Target role (optional):
${targetRole || 'Not specified'}

Jobs:
${JSON.stringify(jobs.slice(0, 30), null, 2)}

Return JSON only with this shape:
{
  "topMatches": [
    {
      "jobId": "string",
      "score": 0-100,
      "reason": "short explanation"
    }
  ],
  "profileImprovements": ["tip1", "tip2", "tip3"],
  "resumeBulletIdeas": ["bullet1", "bullet2", "bullet3"]
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
        }),
      }
    );

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!response.ok || !text) {
      return res.status(502).json({
        message: 'Failed to get AI response',
        details: data?.error?.message || 'Unknown Gemini error',
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return res.status(502).json({ message: 'AI returned non-JSON response' });
    }

    res.json(parsed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

