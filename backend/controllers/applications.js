const Application = require('../models/Application');

const ALLOWED_STATUS = ['Pending', 'Approved', 'Rejected', 'Shortlisted'];

// Admin updates the status of a CV/Application
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !ALLOWED_STATUS.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Use Pending, Approved, Rejected, or Shortlisted.',
      });
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    ).populate('jobId', 'title company jobType');

    if (!updatedApplication) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    console.log(`Application ${id} marked as ${status}`);

    res.json({
      message: `CV successfully ${status.toLowerCase()}`,
      id: updatedApplication._id,
      status: updatedApplication.status,
      application: updatedApplication,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update CV status.' });
  }
};
