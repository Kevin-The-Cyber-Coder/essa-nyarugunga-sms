const express = require('express');
const authMiddleware = require('../middleware/auth');
const { upload, describeMulterError, extensionAllowed } = require('../utils/uploader');
const {
  uploadBuffer,
  scanBuffer,
  kindFor,
  extOf,
  ALLOWED_EXTENSIONS,
  MAX_UPLOAD_BYTES,
  resolveProvider
} = require('../utils/storage');

const router = express.Router();

// The client asks for the rules before opening the picker so validation happens
// in the file dialog rather than after a failed upload.
router.get('/files/config', authMiddleware, (req, res) => {
  res.json({
    success: true,
    config: {
      maxBytes: MAX_UPLOAD_BYTES,
      maxFiles: 5,
      extensions: [...ALLOWED_EXTENSIONS],
      provider: resolveProvider()
    }
  });
});

// Generic authenticated file storage. The returned descriptors are consumed by
// the class resource endpoints; those endpoints enforce class access.
router.post('/files/upload', authMiddleware, (req, res) => {
  upload.array('files', 5)(req, res, async (multerError) => {
    const uploadError = describeMulterError(multerError);
    if (uploadError) return res.status(413).json({ success: false, message: uploadError });
    if (multerError) return res.status(400).json({ success: false, message: multerError.message });

    try {
      const files = req.files || [];
      if (!files.length) return res.status(400).json({ success: false, message: 'No file was provided.' });

      const rejected = files.find((f) => !extensionAllowed(f.originalname));
      if (rejected) {
        return res.status(415).json({
          success: false,
          message: `File type ".${extOf(rejected.originalname)}" is not allowed.`
        });
      }

      // Scan everything before storing anything so a rejected file cannot
      // leave earlier files orphaned in storage.
      for (const file of files) {
        const verdict = await scanBuffer(file.buffer, file.originalname);
        if (!verdict.clean) return res.status(422).json({ success: false, message: verdict.reason });
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const stored = [];
      for (const file of files) {
        const saved = await uploadBuffer({
          buffer: file.buffer,
          filename: file.originalname,
          mime: file.mimetype,
          folder: 'resources',
          baseUrl
        });
        stored.push({
          url: saved.url,
          name: file.originalname,
          mime: file.mimetype,
          size: saved.size,
          kind: kindFor(file.originalname),
          provider: saved.provider,
          key: saved.key
        });
      }

      res.json({ success: true, files: stored });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
});

module.exports = router;
