const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const nodemailer = require('nodemailer');
const { connectDB, Submission, Tender, DownloadLog, VisitLog } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Configure email transporter
let transporter = null;

async function sendEmail({ to, subject, html, attachments = [] }) {
  try {
    console.log('\n===== EMAIL NOTIFICATION =====');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('================================\n');

    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      try {
        if (!transporter) {
          transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASSWORD
            },
            connectionTimeout: 30000,
            greetingTimeout: 30000,
            socketTimeout: 30000
          });
        }

        const sendPromise = transporter.sendMail({
          from: `"اللجنة المحلية - الحسينية" <${process.env.EMAIL_USER}>`,
          to, subject, html, attachments
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Email timeout')), 15000)
        );

        const info = await Promise.race([sendPromise, timeoutPromise]);
        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
      } catch (emailError) {
        console.log('Email failed:', emailError.message);
        return { success: true, messageId: 'logged', logged: true };
      }
    }

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
    const submission = new Submission({
      type: 'documentAuth',
      data: JSON.parse(req.body.formData),
      files: req.files?.map(f => ({
        filename: f.filename,
        originalname: f.originalname,
        size: f.size,
        path: f.path
      })) || [],
      status: 'pending',
      emailSentTo: 'husniua.committe@gmail.com'
    });

    await submission.save();
    console.log(`Document auth request from: ${submission.data.ownerName}`);

    await sendEmail({
      to: 'husniua.committe@gmail.com',
      subject: 'طلب مصادقة مستند جديد',
      html: `<div dir="rtl"><h2>طلب جديد #${submission._id}</h2><p>من: ${submission.data.ownerName}</p></div>`
    });

    res.json({ success: true, submissionId: submission._id, message: 'تم إرسال الطلب بنجاح' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process submission' });
  }
});

// ===== OFFICIAL DOCUMENT =====
app.post('/api/official-doc', upload.array('documents', 5), async (req, res) => {
  try {
    const submission = new Submission({
      type: 'officialDoc',
      data: JSON.parse(req.body.formData),
      files: req.files?.map(f => ({
        filename: f.filename,
        originalname: f.originalname,
        size: f.size,
        path: f.path
      })) || [],
      status: 'pending',
      emailSentTo: 'husniua.committe@gmail.com'
    });

    await submission.save();
    console.log(`Official doc request from: ${submission.data.fullName}`);

    await sendEmail({
      to: 'husniua.committe@gmail.com',
      subject: 'طلب إعداد مستند رسمي جديد',
      html: `<div dir="rtl"><h2>طلب جديد #${submission._id}</h2><p>من: ${submission.data.fullName}</p></div>`
    });

    res.json({ success: true, submissionId: submission._id, message: 'تم إرسال الطلب بنجاح' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process submission' });
  }
});

// ===== TENDER SUBMISSIONS =====
app.post('/api/tenders', upload.array('documents', 10), async (req, res) => {
  try {
    const submission = new Submission({
      type: 'tender',
      data: JSON.parse(req.body.formData),
      files: req.files?.map(f => ({
        filename: f.filename,
        originalname: f.originalname,
        size: f.size,
        path: f.path
      })) || [],
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
          data: { fullName: submission.data?.fullName || submission.data?.ownerName || null }
        }
      });
    } else {
      res.json({ found: false });
    }
  } catch (error) {
    res.json({ found: false });
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Admin: Bearer admin-secret-token`);
});
