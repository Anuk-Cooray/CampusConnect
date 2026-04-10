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

