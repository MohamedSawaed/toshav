const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const { Resend } = require('resend');
const cloudinary = require('cloudinary').v2;
const { connectDB, Submission, Tender, DownloadLog, VisitLog, Protocol } = require('./db');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper function to upload file to Cloudinary
const uploadToCloudinary = async (filePath, originalname) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'husniyya-uploads',
      resource_type: 'auto',
      public_id: `${Date.now()}-${originalname.replace(/\.[^/.]+$/, '')}`
    });
    // Delete local file after upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return {
      url: result.secure_url,
      public_id: result.public_id,
      originalname: originalname,
      size: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Configure Resend email
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function sendEmail({ to, subject, html }) {
  try {
    console.log('\n===== EMAIL NOTIFICATION =====');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('================================\n');

    if (resend) {
      try {
        const { data, error } = await resend.emails.send({
          from: 'Husniyya Municipality <onboarding@resend.dev>',
          to: [to],
          subject: subject,
          html: html
        });

        if (error) {
          console.log('Email failed:', error.message);
          return { success: true, messageId: 'logged', logged: true };
        }

        console.log('Email sent:', data.id);
        return { success: true, messageId: data.id };
      } catch (emailError) {
        console.log('Email failed:', emailError.message);
        return { success: true, messageId: 'logged', logged: true };
      }
    }

    console.log('No email service configured - notification logged only');
    return { success: true, messageId: 'logged', logged: true };
  } catch (error) {
    console.error('Email error:', error.message);
    return { success: false, error: error.message };
  }
}

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://toshav.vercel.app',
    'https://toshav-4an0bb0fe-mohamed-sawaeds-projects.vercel.app',
    /\.vercel\.app$/,
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create uploads directory
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Admin auth middleware
const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader === 'Bearer admin-secret-token') {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// ===== DOCUMENT AUTHENTICATION =====
app.post('/api/document-auth', upload.array('documents', 5), async (req, res) => {
  try {
    // Upload files to Cloudinary
    const uploadedFiles = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const cloudFile = await uploadToCloudinary(file.path, file.originalname);
        uploadedFiles.push(cloudFile);
      }
    }

    const submission = new Submission({
      type: 'documentAuth',
      data: JSON.parse(req.body.formData),
      files: uploadedFiles,
      status: 'pending',
      emailSentTo: process.env.NOTIFICATION_EMAIL || 'sawaedmohamed.20@gmail.com'
    });

    await submission.save();
    console.log(`Document auth request from: ${submission.data.ownerName}`);

    // Send notification to admin
    await sendEmail({
      to: process.env.NOTIFICATION_EMAIL || 'sawaedmohamed.20@gmail.com',
      subject: 'طلب مصادقة مستند جديد',
      html: `<div dir="rtl"><h2>طلب جديد #${submission._id}</h2><p>من: ${submission.data.ownerName}</p></div>`
    });

    // Send confirmation email to user with tracking number
    if (submission.data.ownerEmail) {
      await sendEmail({
        to: submission.data.ownerEmail,
        subject: 'تأكيد استلام طلبك - اللجنة المحلية حسينية',
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1e3a5f 0%, #1a365d 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: #fff; margin: 0;">اللجنة المحلية - حسينية</h1>
            </div>
            <div style="background: #fff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1a365d;">تم استلام طلبك بنجاح!</h2>
              <p style="color: #718096; font-size: 16px;">عزيزي/عزيزتي ${submission.data.ownerName}،</p>
              <p style="color: #718096; font-size: 16px;">نود إعلامك بأنه تم استلام طلب مصادقة المستند الخاص بك وسيتم معالجته خلال 3-5 أيام عمل.</p>

              <div style="background: #f0fff4; border: 2px solid #c6f6d5; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center;">
                <p style="color: #276749; margin: 0 0 10px; font-size: 14px;">رقم التتبع الخاص بك:</p>
                <p style="color: #276749; font-size: 20px; font-weight: bold; margin: 0; font-family: monospace; word-break: break-all;">${submission._id}</p>
              </div>

              <p style="color: #718096; font-size: 14px;">يمكنك استخدام هذا الرقم لتتبع حالة طلبك من خلال صفحة تتبع الطلبات.</p>

              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
              <p style="color: #a0aec0; font-size: 12px; text-align: center;">هذه رسالة آلية، يرجى عدم الرد عليها</p>
            </div>
          </div>
        `
      });
      console.log(`Confirmation email sent to: ${submission.data.ownerEmail}`);
    }

    res.json({ success: true, submissionId: submission._id, message: 'تم إرسال الطلب بنجاح' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process submission' });
  }
});

// ===== OFFICIAL DOCUMENT =====
app.post('/api/official-doc', upload.array('documents', 5), async (req, res) => {
  try {
    // Upload files to Cloudinary
    const uploadedFiles = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const cloudFile = await uploadToCloudinary(file.path, file.originalname);
        uploadedFiles.push(cloudFile);
      }
    }

    const submission = new Submission({
      type: 'officialDoc',
      data: JSON.parse(req.body.formData),
      files: uploadedFiles,
      status: 'pending',
      emailSentTo: process.env.NOTIFICATION_EMAIL || 'sawaedmohamed.20@gmail.com'
    });

    await submission.save();
    console.log(`Official doc request from: ${submission.data.fullName}`);

    // Send notification to admin
    await sendEmail({
      to: process.env.NOTIFICATION_EMAIL || 'sawaedmohamed.20@gmail.com',
      subject: 'طلب إعداد مستند رسمي جديد',
      html: `<div dir="rtl"><h2>طلب جديد #${submission._id}</h2><p>من: ${submission.data.fullName}</p></div>`
    });

    // Send confirmation email to user with tracking number
    if (submission.data.email) {
      await sendEmail({
        to: submission.data.email,
        subject: 'تأكيد استلام طلبك - اللجنة المحلية حسينية',
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1e3a5f 0%, #1a365d 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: #fff; margin: 0;">اللجنة المحلية - حسينية</h1>
            </div>
            <div style="background: #fff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1a365d;">تم استلام طلبك بنجاح!</h2>
              <p style="color: #718096; font-size: 16px;">عزيزي/عزيزتي ${submission.data.fullName}،</p>
              <p style="color: #718096; font-size: 16px;">نود إعلامك بأنه تم استلام طلب إعداد المستند الرسمي الخاص بك وسيتم معالجته خلال 3-5 أيام عمل.</p>

              <div style="background: #f0fff4; border: 2px solid #c6f6d5; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center;">
                <p style="color: #276749; margin: 0 0 10px; font-size: 14px;">رقم التتبع الخاص بك:</p>
                <p style="color: #276749; font-size: 20px; font-weight: bold; margin: 0; font-family: monospace; word-break: break-all;">${submission._id}</p>
              </div>

              <p style="color: #718096; font-size: 14px;">يمكنك استخدام هذا الرقم لتتبع حالة طلبك من خلال صفحة تتبع الطلبات.</p>

              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
              <p style="color: #a0aec0; font-size: 12px; text-align: center;">هذه رسالة آلية، يرجى عدم الرد عليها</p>
            </div>
          </div>
        `
      });
      console.log(`Confirmation email sent to: ${submission.data.email}`);
    }

    res.json({ success: true, submissionId: submission._id, message: 'تم إرسال الطلب بنجاح' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process submission' });
  }
});

// ===== TENDER SUBMISSIONS =====
app.post('/api/tenders', upload.array('documents', 10), async (req, res) => {
  try {
    // Upload files to Cloudinary
    const uploadedFiles = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const cloudFile = await uploadToCloudinary(file.path, file.originalname);
        uploadedFiles.push(cloudFile);
      }
    }

    const submission = new Submission({
      type: 'tender',
      data: JSON.parse(req.body.formData),
      files: uploadedFiles,
      status: 'pending'
    });

    await submission.save();
    res.json({ success: true, submissionId: submission._id, message: 'تم إرسال العرض بنجاح' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process submission' });
  }
});

// ===== CERTIFICATE LOOKUP =====
app.post('/api/certificate-lookup', async (req, res) => {
  try {
    const { idNumber } = req.body;

    const lookup = new Submission({
      type: 'certificateLookup',
      data: { idNumber },
      status: 'completed'
    });
    await lookup.save();

    res.json({
      found: true,
      fullName: 'اسم المواطن',
      idNumber: idNumber,
      address: 'الحسينية',
      issueDate: new Date().toISOString().split('T')[0],
      certificateNumber: `CERT-${Date.now()}`
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process lookup' });
  }
});

// ===== TRACK REQUEST =====
app.get('/api/track/:referenceNumber', async (req, res) => {
  try {
    const { referenceNumber } = req.params;
    const submission = await Submission.findById(referenceNumber);

    if (submission) {
      res.json({
        found: true,
        request: {
          id: submission._id,
          type: submission.type,
          status: submission.status,
          submittedAt: submission.submittedAt,
          notes: submission.notes || null,
          data: { fullName: submission.data?.fullName || submission.data?.ownerName || null },
          adminResponseFile: submission.adminResponseFile || null
        }
      });
    } else {
      res.json({ found: false });
    }
  } catch (error) {
    res.json({ found: false });
  }
});

// ===== TRACK BY ID NUMBER =====
app.get('/api/track-by-id/:idNumber', async (req, res) => {
  try {
    const { idNumber } = req.params;

    // Search for submissions where data.idNumber or data.ownerId matches
    const submissions = await Submission.find({
      $or: [
        { 'data.idNumber': idNumber },
        { 'data.ownerId': idNumber }
      ],
      type: { $in: ['documentAuth', 'officialDoc'] }
    }).sort({ submittedAt: -1 });

    if (submissions.length > 0) {
      res.json({
        found: true,
        requests: submissions.map(s => ({
          id: s._id,
          type: s.type,
          status: s.status,
          submittedAt: s.submittedAt,
          notes: s.notes || null,
          data: { fullName: s.data?.fullName || s.data?.ownerName || null },
          adminResponseFile: s.adminResponseFile || null
        }))
      });
    } else {
      res.json({ found: false, requests: [] });
    }
  } catch (error) {
    console.error('Error tracking by ID:', error);
    res.json({ found: false, requests: [] });
  }
});

// ===== ADMIN: GET SUBMISSIONS =====
app.get('/api/admin/submissions/:type', adminAuth, async (req, res) => {
  try {
    const { type } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    let query = { type };
    if (status) query.status = status;

    const submissions = await Submission.find(query)
      .sort({ submittedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Submission.countDocuments(query);

    res.json({
      submissions: submissions.map(s => ({ id: s._id, ...s.toObject() })),
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// ===== ADMIN: UPDATE SUBMISSION =====
app.patch('/api/admin/submission/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const submission = await Submission.findByIdAndUpdate(
      id,
      { status, notes, updatedAt: new Date() },
      { new: true }
    );

    if (submission) {
      res.json({ success: true, submission });
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update' });
  }
});

// ===== ADMIN: UPLOAD RESPONSE FILE =====
app.post('/api/admin/submission/:id/upload-response', adminAuth, upload.single('responseFile'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const cloudFile = await uploadToCloudinary(req.file.path, req.file.originalname);
    console.log('Cloudinary upload result:', JSON.stringify(cloudFile, null, 2));

    const adminResponseFile = {
      filename: cloudFile.public_id,
      originalname: cloudFile.originalname,
      size: cloudFile.size,
      url: cloudFile.url,
      public_id: cloudFile.public_id,
      uploadedAt: new Date()
    };
    console.log('Saving adminResponseFile:', JSON.stringify(adminResponseFile, null, 2));

    const submission = await Submission.findByIdAndUpdate(
      id,
      {
        adminResponseFile: adminResponseFile,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (submission) {
      console.log(`Admin response file uploaded for submission ${id}: ${req.file.originalname}`);
      console.log('Saved submission.adminResponseFile:', JSON.stringify(submission.adminResponseFile, null, 2));
      res.json({ success: true, submission, file: submission.adminResponseFile });
    } else {
      res.status(404).json({ error: 'Submission not found' });
    }
  } catch (error) {
    console.error('Error uploading response file:', error);
    res.status(500).json({ error: 'Failed to upload response file' });
  }
});

// ===== ADMIN: DELETE RESPONSE FILE =====
app.delete('/api/admin/submission/:id/response-file', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await Submission.findById(id);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Delete the file from Cloudinary
    if (submission.adminResponseFile && submission.adminResponseFile.public_id) {
      try {
        await cloudinary.uploader.destroy(submission.adminResponseFile.public_id);
      } catch (cloudError) {
        console.error('Cloudinary delete error:', cloudError);
      }
    }

    // Remove from database
    submission.adminResponseFile = undefined;
    submission.updatedAt = new Date();
    await submission.save();

    res.json({ success: true, message: 'Response file deleted' });
  } catch (error) {
    console.error('Error deleting response file:', error);
    res.status(500).json({ error: 'Failed to delete response file' });
  }
});

// ===== ADMIN: DELETE SUBMISSION =====
app.delete('/api/admin/submission/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await Submission.findByIdAndDelete(id);

    if (submission) {
      // Delete files
      submission.files?.forEach(file => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

// ===== ADMIN: STATS =====
app.get('/api/admin/stats', adminAuth, async (req, res) => {
  try {
    const [docAuth, officialDoc, tenders, certificates] = await Promise.all([
      Submission.aggregate([
        { $match: { type: 'documentAuth' } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Submission.aggregate([
        { $match: { type: 'officialDoc' } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Submission.aggregate([
        { $match: { type: 'tender' } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Submission.countDocuments({ type: 'certificateLookup' })
    ]);

    const formatStats = (arr) => {
      const stats = { total: 0, pending: 0, approved: 0, rejected: 0 };
      arr.forEach(item => {
        stats[item._id] = item.count;
        stats.total += item.count;
      });
      return stats;
    };

    res.json({
      documentAuth: formatStats(docAuth),
      officialDoc: formatStats(officialDoc),
      tenders: formatStats(tenders),
      certificates: { total: certificates }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// ===== TENDERS MANAGEMENT =====
app.get('/api/tenders/published', async (req, res) => {
  try {
    const tenders = await Tender.find({ status: 'active' });
    res.json(tenders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tenders' });
  }
});

app.get('/api/admin/tenders/all', adminAuth, async (req, res) => {
  try {
    const tenders = await Tender.find().sort({ publishedAt: -1 });
    res.json(tenders.map(t => ({ id: t._id, ...t.toObject() })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tenders' });
  }
});

app.post('/api/admin/tenders/publish', adminAuth, upload.array('documents', 5), async (req, res) => {
  try {
    const tenderData = JSON.parse(req.body.tenderData);
    const tender = new Tender({
      ...tenderData,
      documents: req.files?.map(f => ({
        filename: f.filename,
        originalname: f.originalname,
        path: f.path
      })) || []
    });

    await tender.save();
    res.json({ success: true, tender: { id: tender._id, ...tender.toObject() } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to publish tender' });
  }
});

app.delete('/api/admin/tenders/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await Tender.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete tender' });
  }
});

// ===== DOWNLOADS LOG =====
app.post('/api/certificate/download-log', async (req, res) => {
  try {
    const { idNumber, pageNumber, timestamp } = req.body;
    const log = new DownloadLog({
      idNumber,
      pageNumber,
      downloadedAt: timestamp || new Date(),
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown'
    });
    await log.save();
    res.json({ success: true, logId: log._id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log download' });
  }
});

app.get('/api/admin/downloads', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const downloads = await DownloadLog.find()
      .sort({ downloadedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await DownloadLog.countDocuments();

    res.json({
      downloads: downloads.map(d => ({ id: d._id, ...d.toObject() })),
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch downloads' });
  }
});

app.get('/api/admin/downloads/stats', adminAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [total, todayCount, weekCount, monthCount, uniqueIds] = await Promise.all([
      DownloadLog.countDocuments(),
      DownloadLog.countDocuments({ downloadedAt: { $gte: today } }),
      DownloadLog.countDocuments({ downloadedAt: { $gte: thisWeek } }),
      DownloadLog.countDocuments({ downloadedAt: { $gte: thisMonth } }),
      DownloadLog.distinct('idNumber')
    ]);

    res.json({
      total,
      today: todayCount,
      thisWeek: weekCount,
      thisMonth: monthCount,
      uniqueIds: uniqueIds.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// ===== VISITS LOG =====
app.post('/api/visit/log', async (req, res) => {
  try {
    const { page, userAgent } = req.body;
    const log = new VisitLog({
      page: page || 'home',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      userAgent: userAgent || req.headers['user-agent'] || 'unknown'
    });
    await log.save();
    res.json({ success: true, logId: log._id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log visit' });
  }
});

app.get('/api/admin/visits', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50, filterPage } = req.query;
    let query = {};
    if (filterPage) query.page = filterPage;

    const visits = await VisitLog.find(query)
      .sort({ visitedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await VisitLog.countDocuments(query);

    res.json({
      visits: visits.map(v => ({ id: v._id, ...v.toObject() })),
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch visits' });
  }
});

app.get('/api/admin/visits/stats', adminAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [total, todayCount, weekCount, monthCount, uniqueIPs, pageStats] = await Promise.all([
      VisitLog.countDocuments(),
      VisitLog.countDocuments({ visitedAt: { $gte: today } }),
      VisitLog.countDocuments({ visitedAt: { $gte: thisWeek } }),
      VisitLog.countDocuments({ visitedAt: { $gte: thisMonth } }),
      VisitLog.distinct('ipAddress'),
      VisitLog.aggregate([
        { $group: { _id: '$page', count: { $sum: 1 } } }
      ])
    ]);

    const pageStatsObj = {};
    pageStats.forEach(p => { pageStatsObj[p._id] = p.count; });

    res.json({
      total,
      today: todayCount,
      thisWeek: weekCount,
      thisMonth: monthCount,
      uniqueIPs: uniqueIPs.length,
      pageStats: pageStatsObj
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// ===== PROTOCOLS MANAGEMENT =====
// Get published protocols (public)
app.get('/api/protocols/published', async (req, res) => {
  try {
    const protocols = await Protocol.find({ status: 'published' })
      .sort({ meetingDate: -1 });
    res.json(protocols.map(p => ({ id: p._id, ...p.toObject() })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch protocols' });
  }
});

// Get all protocols (admin)
app.get('/api/admin/protocols/all', adminAuth, async (req, res) => {
  try {
    const protocols = await Protocol.find().sort({ meetingDate: -1 });
    res.json(protocols.map(p => ({ id: p._id, ...p.toObject() })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch protocols' });
  }
});

// Add new protocol (admin)
app.post('/api/admin/protocols/add', adminAuth, upload.single('file'), async (req, res) => {
  try {
    const protocolData = JSON.parse(req.body.protocolData);

    let fileData = null;
    if (req.file) {
      const cloudFile = await uploadToCloudinary(req.file.path, req.file.originalname);
      fileData = {
        filename: cloudFile.public_id,
        originalname: cloudFile.originalname,
        size: cloudFile.size,
        url: cloudFile.url,
        public_id: cloudFile.public_id
      };
    }

    const protocol = new Protocol({
      title: protocolData.title,
      titleHe: protocolData.titleHe,
      meetingDate: protocolData.meetingDate,
      meetingNumber: protocolData.meetingNumber,
      description: protocolData.description,
      descriptionHe: protocolData.descriptionHe,
      status: protocolData.status || 'published',
      file: fileData
    });

    await protocol.save();
    console.log(`Protocol added: ${protocol.title}`);
    res.json({ success: true, protocol: { id: protocol._id, ...protocol.toObject() } });
  } catch (error) {
    console.error('Error adding protocol:', error);
    res.status(500).json({ error: 'Failed to add protocol' });
  }
});

// Update protocol (admin)
app.put('/api/admin/protocols/:id', adminAuth, upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const protocolData = JSON.parse(req.body.protocolData);

    const protocol = await Protocol.findById(id);
    if (!protocol) {
      return res.status(404).json({ error: 'Protocol not found' });
    }

    // Update file if new one uploaded
    if (req.file) {
      // Delete old file from Cloudinary
      if (protocol.file?.public_id) {
        try {
          await cloudinary.uploader.destroy(protocol.file.public_id);
        } catch (e) {
          console.log('Could not delete old file from Cloudinary');
        }
      }

      const cloudFile = await uploadToCloudinary(req.file.path, req.file.originalname);
      protocol.file = {
        filename: cloudFile.public_id,
        originalname: cloudFile.originalname,
        size: cloudFile.size,
        url: cloudFile.url,
        public_id: cloudFile.public_id
      };
    }

    protocol.title = protocolData.title;
    protocol.titleHe = protocolData.titleHe;
    protocol.meetingDate = protocolData.meetingDate;
    protocol.meetingNumber = protocolData.meetingNumber;
    protocol.description = protocolData.description;
    protocol.descriptionHe = protocolData.descriptionHe;
    protocol.status = protocolData.status;
    protocol.updatedAt = new Date();

    await protocol.save();
    res.json({ success: true, protocol: { id: protocol._id, ...protocol.toObject() } });
  } catch (error) {
    console.error('Error updating protocol:', error);
    res.status(500).json({ error: 'Failed to update protocol' });
  }
});

// Delete protocol (admin)
app.delete('/api/admin/protocols/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const protocol = await Protocol.findById(id);

    if (!protocol) {
      return res.status(404).json({ error: 'Protocol not found' });
    }

    // Delete file from Cloudinary
    if (protocol.file?.public_id) {
      try {
        await cloudinary.uploader.destroy(protocol.file.public_id);
      } catch (e) {
        console.log('Could not delete file from Cloudinary');
      }
    }

    await Protocol.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting protocol:', error);
    res.status(500).json({ error: 'Failed to delete protocol' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Admin: Bearer admin-secret-token`);
});
