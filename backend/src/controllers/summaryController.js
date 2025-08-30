const { getJobStatus } = require('../workers/jobProcessor');

function getSummaryStatus(req, res) {
  const jobId = req.params.jobId;
  const job = getJobStatus(jobId);

  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
}

module.exports = { getSummaryStatus };
