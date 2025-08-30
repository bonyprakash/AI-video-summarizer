const { addJob } = require('../workers/jobProcessor');

async function handleUpload(req, res) {
  try {
    const file = req.file;
    const opts = {
      contentType: req.body.contentType || 'lecture',
      summaryStyle: req.body.summaryStyle || 'concise',
      languages: req.body.languages || 'EN,FR,ES'
    };

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const jobId = await addJob(file, opts);
    res.json({ jobId, statusUrl: `/api/status/${jobId}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
}

module.exports = { handleUpload };
