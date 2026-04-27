// FEATURE 1: Cover Letter Generator (Presentation Override Mode)
exports.generateCoverLetter = async (req, res) => {
  try {
    const { studentName, jobTitle, company } = req.body || {};

    // Simulate network/AI thinking time for presentation flow.
    setTimeout(() => {
      const mockLetter = `Dear Hiring Manager at ${company || 'your company'},\n\nI am writing to express my strong interest in the ${jobTitle || 'position'} role. With my robust background in the MERN stack and a proven track record of building scalable, enterprise-grade web applications, I am confident in my ability to immediately contribute to your engineering team.\n\nMy recent work architecting the CampusConnect platform demonstrated my ability to handle complex system integrations, role-based access controls, and dynamic UI rendering. I would welcome the opportunity to bring this technical rigor to ${company || 'your organization'}.\n\nSincerely,\n${studentName || 'Anuk Cooray'}`;
      res.json({ coverLetter: mockLetter });
    }, 2500);
  } catch (error) {
    console.error('Override Error:', error);
    res.status(500).json({ message: 'Failed to generate AI Cover Letter.' });
  }
};

// FEATURE 2: AI Career Counselor Chat (with Auto-Failover for Presentations)
exports.chatCounselor = async (req, res) => {
  const { message, activeJobs } = req.body || {};

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('API Key missing');
    }

    const jobsContext = Array.isArray(activeJobs) ? activeJobs.slice(0, 20) : [];
    const systemInstruction = `You are the CampusConnect AI Career Counselor. Be friendly, encouraging, and brief (under 3 sentences). Here are the live jobs currently in our database: ${JSON.stringify(jobsContext)}. If the user asks for a job, recommend 1 or 2 specific roles from this list that match their request.`;
    const prompt = `${systemInstruction}\n\nStudent: ${message || ''}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.5, maxOutputTokens: 220 },
        }),
      }
    );
    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!response.ok || !reply) {
      throw new Error(data?.error?.message || 'Gemini did not return a reply');
    }

    return res.json({ reply });
  } catch (error) {
    console.warn('[ai] Gemini unavailable, using presentation fallback:', error.message);

    setTimeout(() => {
      const msg = (message || '').toLowerCase();
      let mockReply = 'I am your CampusConnect AI! How can I help you find an internship today?';

      if (msg.includes('react') || msg.includes('frontend') || msg.includes('mern')) {
        const matchingCompany =
          Array.isArray(activeJobs) && activeJobs.length > 0
            ? activeJobs[0].company || 'Arimac IT'
            : 'Arimac IT';
        mockReply = `Based on your profile, I see strong MERN potential. I recommend applying to openings at ${matchingCompany} because they align well with React-focused roles. Would you like help tailoring your resume for that?`;
      } else if (msg.includes('job') || msg.includes('intern')) {
        mockReply = 'You have multiple active listings right now. Start with the highest ATS match cards in the Job Portal and prioritize roles that mention your strongest skills.';
      }

      res.json({ reply: mockReply });
    }, 1500);
  }
};

