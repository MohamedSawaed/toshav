const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3001;

// Configure email transporter - For now, log emails to console
// To enable real email sending, see EMAIL_SETUP.md for SendGrid or other services
let transporter = null;

// Email sending function
async function sendEmail({ to, subject, html, attachments = [] }) {
  try {
    // For now, just log the email details
    console.log('\n📧 ===== EMAIL NOTIFICATION =====');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Attachments:', attachments.length);
    console.log('================================\n');

    // If Gmail credentials are configured, try to send
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      try {
        console.log('🔄 Attempting to send email via Gmail...');

        if (!transporter) {
          transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASSWORD
            },
            tls: {
              rejectUnauthorized: false
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000
          });
        }

        // Add timeout to sendMail
        const sendPromise = transporter.sendMail({
          from: `"اللجنة المحلية - الحسينية" <${process.env.EMAIL_USER}>`,
          to: to,
          subject: subject,
          html: html,
          attachments: attachments
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Email sending timeout after 15 seconds')), 15000)
        );

        const info = await Promise.race([sendPromise, timeoutPromise]);

        console.log('✅ Email sent successfully via Gmail:', info.messageId);
        return { success: true, messageId: info.messageId };
      } catch (emailError) {
        console.log('⚠️  Gmail sending failed:', emailError.message);
        console.log('💡 Email logged to console instead. Check your Gmail App Password or use Brevo.');
        return { success: true, messageId: 'logged-to-console', logged: true };
      }
    }

    console.log('ℹ️  No email credentials configured. Email logged to console only.');
    return { success: true, messageId: 'logged-to-console', logged: true };
  } catch (error) {
    console.error('❌ Error processing email:', error.message);
    return { success: false, error: error.message };
  }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Data storage paths
const DATA_DIR = path.join(__dirname, 'data');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');
const TENDERS_FILE = path.join(DATA_DIR, 'tenders.json');
const DOWNLOADS_LOG_FILE = path.join(DATA_DIR, 'downloads.json');
const VISITS_LOG_FILE = path.join(DATA_DIR, 'visits.json');

// Create data directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper functions to save/load data
function loadData(filePath, defaultValue) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error loading data from ${filePath}:`, error.message);
  }
  return defaultValue;
}

function saveData(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error saving data to ${filePath}:`, error.message);
  }
}

// Load existing data on startup
let submissions = loadData(SUBMISSIONS_FILE, {
  documentAuth: [],
  officialDoc: [],
  tenders: [],
  certificates: []
});

// Simple authentication middleware (replace with proper auth in production)
const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader === 'Bearer admin-secret-token') {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// ===== DOCUMENT AUTHENTICATION REQUESTS =====
app.post('/api/document-auth', upload.array('documents', 5), async (req, res) => {
  try {
    const submission = {
      id: Date.now().toString(),
      type: 'documentAuth',
      data: JSON.parse(req.body.formData),
      files: req.files?.map(f => ({
        filename: f.filename,
        originalname: f.originalname,
        size: f.size,
        path: f.path
      })) || [],
      status: 'pending',
      submittedAt: new Date().toISOString(),
      notes: '',
      emailSentTo: 'husniua.committe@gmail.com'
    };

    submissions.documentAuth.push(submission);
    saveData(SUBMISSIONS_FILE, submissions); // Save to file

    console.log(`📬 Document authentication request received from: ${submission.data.ownerName}`);

    // Send email notification
    const emailResult = await sendEmail({
      to: 'husniua.committe@gmail.com',
      subject: 'طلب مصادقة مستند جديد - اللجنة المحلية الحسينية',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🏛️ طلب مصادقة مستند جديد</h1>
          </div>

          <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #1e40af; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">معلومات الطلب</h2>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr style="background-color: #f3f4f6;">
                <td style="padding: 12px; font-weight: bold; border: 1px solid #e5e7eb;">رقم الطلب:</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">${submission.id}</td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: bold; border: 1px solid #e5e7eb;">اسم صاحب المستند:</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">${submission.data.ownerName}</td>
              </tr>
              <tr style="background-color: #f3f4f6;">
                <td style="padding: 12px; font-weight: bold; border: 1px solid #e5e7eb;">رقم الهوية:</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">${submission.data.ownerId}</td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: bold; border: 1px solid #e5e7eb;">رقم الهاتف:</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">${submission.data.ownerPhone}</td>
              </tr>
              <tr style="background-color: #f3f4f6;">
                <td style="padding: 12px; font-weight: bold; border: 1px solid #e5e7eb;">نوع المستند:</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">${submission.data.documentType}</td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: bold; border: 1px solid #e5e7eb;">تاريخ التقديم:</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">${new Date(submission.submittedAt).toLocaleString('ar')}</td>
              </tr>
              ${submission.data.notes ? `
              <tr style="background-color: #fef3c7;">
                <td style="padding: 12px; font-weight: bold; border: 1px solid #e5e7eb;">ملاحظات:</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">${submission.data.notes}</td>
              </tr>
              ` : ''}
            </table>

            ${submission.files.length > 0 ? `
            <div style="margin-top: 20px; padding: 15px; background-color: #eff6ff; border-radius: 6px; border-right: 4px solid #3b82f6;">
              <h3 style="color: #1e40af; margin-top: 0;">📎 المرفقات (${submission.files.length}):</h3>
              <ul style="list-style: none; padding: 0;">
                ${submission.files.map(f => `<li style="padding: 5px 0;">📄 ${f.originalname}</li>`).join('')}
              </ul>
            </div>
            ` : ''}

            <div style="margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-radius: 6px; border-right: 4px solid #16a34a;">
              <p style="margin: 0; color: #15803d; font-size: 14px;">
                <strong>⏭️ الخطوة التالية:</strong><br>
                يرجى مراجعة الطلب من خلال لوحة التحكم الإدارية
              </p>
            </div>
          </div>

          <div style="text-align: center; margin-top: 20px; padding: 15px; color: #6b7280; font-size: 12px;">
            <p style="margin: 5px 0;">اللجنة المحلية - الحسينية</p>
            <p style="margin: 5px 0;">هذا البريد الإلكتروني تم إنشاؤه تلقائياً، يرجى عدم الرد عليه</p>
          </div>
        </div>
      `,
      attachments: req.files?.map(file => ({
        filename: file.originalname,
        path: file.path
      })) || []
    });

    res.json({
      success: true,
      submissionId: submission.id,
      message: 'تم إرسال الطلب بنجاح',
      emailSent: emailResult.success
    });
  } catch (error) {
    console.error('Error processing document auth:', error);
    res.status(500).json({ error: 'Failed to process submission' });
  }
});

// ===== OFFICIAL DOCUMENT REQUESTS =====
app.post('/api/official-doc', upload.array('documents', 5), async (req, res) => {
  try {
    const submission = {
      id: Date.now().toString(),
      type: 'officialDoc',
      data: JSON.parse(req.body.formData),
      files: req.files?.map(f => ({
        filename: f.filename,
        originalname: f.originalname,
        size: f.size,
        path: f.path
      })) || [],
      status: 'pending',
      submittedAt: new Date().toISOString(),
      notes: '',
      emailSentTo: 'husniua.committe@gmail.com'
    };

    submissions.officialDoc.push(submission);
    saveData(SUBMISSIONS_FILE, submissions); // Save to file

    console.log(`📋 Official document request received from: ${submission.data.fullName}`);

    // Send email notification
    const emailResult = await sendEmail({
      to: 'husniua.committe@gmail.com',
      subject: 'طلب إعداد مستند رسمي جديد - اللجنة المحلية الحسينية',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📋 طلب إعداد مستند رسمي جديد</h1>
          </div>

          <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #1e40af; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">معلومات الطلب</h2>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr style="background-color: #f3f4f6;">
                <td style="padding: 12px; font-weight: bold; border: 1px solid #e5e7eb;">رقم الطلب:</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">${submission.id}</td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: bold; border: 1px solid #e5e7eb;">نوع المستند:</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">${submission.data.documentTypeLabel || submission.data.documentType}</td>
              </tr>
              <tr style="background-color: #f3f4f6;">
                <td style="padding: 12px; font-weight: bold; border: 1px solid #e5e7eb;">الجهة المستفيدة:</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">${submission.data.recipientEntityLabel || submission.data.recipientEntity}</td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: bold; border: 1px solid #e5e7eb;">الاسم الكامل:</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">${submission.data.fullName}</td>
              </tr>
              <tr style="background-color: #f3f4f6;">
                <td style="padding: 12px; font-weight: bold; border: 1px solid #e5e7eb;">رقم الهوية:</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">${submission.data.idNumber}</td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: bold; border: 1px solid #e5e7eb;">العنوان:</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">${submission.data.address}</td>
              </tr>
              <tr style="background-color: #f3f4f6;">
                <td style="padding: 12px; font-weight: bold; border: 1px solid #e5e7eb;">رقم الهاتف:</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">${submission.data.phone}</td>
              </tr>
              ${submission.data.email ? `
              <tr>
                <td style="padding: 12px; font-weight: bold; border: 1px solid #e5e7eb;">البريد الإلكتروني:</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">${submission.data.email}</td>
              </tr>
              ` : ''}
              <tr style="background-color: #f3f4f6;">
                <td style="padding: 12px; font-weight: bold; border: 1px solid #e5e7eb;">تاريخ التقديم:</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">${new Date(submission.submittedAt).toLocaleString('ar')}</td>
              </tr>
            </table>

            <div style="margin: 20px 0; padding: 15px; background-color: #fef3c7; border-radius: 6px; border-right: 4px solid #f59e0b;">
              <h3 style="color: #92400e; margin-top: 0;">📝 تفاصيل الطلب:</h3>
              <p style="color: #78350f; margin: 0; white-space: pre-wrap;">${submission.data.subjectDescription}</p>
            </div>

            ${submission.files.length > 0 ? `
            <div style="margin-top: 20px; padding: 15px; background-color: #eff6ff; border-radius: 6px; border-right: 4px solid #3b82f6;">
              <h3 style="color: #1e40af; margin-top: 0;">📎 المرفقات (${submission.files.length}):</h3>
              <ul style="list-style: none; padding: 0;">
                ${submission.files.map(f => `<li style="padding: 5px 0;">📄 ${f.originalname}</li>`).join('')}
              </ul>
            </div>
            ` : ''}

            <div style="margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-radius: 6px; border-right: 4px solid #16a34a;">
              <p style="margin: 0; color: #15803d; font-size: 14px;">
                <strong>⏭️ الخطوة التالية:</strong><br>
                يرجى مراجعة الطلب من خلال لوحة التحكم الإدارية وإعداد المستند المطلوب
              </p>
            </div>
          </div>

          <div style="text-align: center; margin-top: 20px; padding: 15px; color: #6b7280; font-size: 12px;">
            <p style="margin: 5px 0;">اللجنة المحلية - الحسينية</p>
            <p style="margin: 5px 0;">هذا البريد الإلكتروني تم إنشاؤه تلقائياً، يرجى عدم الرد عليه</p>
          </div>
        </div>
      `,
      attachments: req.files?.map(file => ({
        filename: file.originalname,
        path: file.path
      })) || []
    });

    res.json({
      success: true,
      submissionId: submission.id,
      message: 'تم إرسال الطلب بنجاح',
      emailSent: emailResult.success
    });
  } catch (error) {
    console.error('Error processing official doc:', error);
    res.status(500).json({ error: 'Failed to process submission' });
  }
});

// ===== TENDER SUBMISSIONS =====
app.post('/api/tenders', upload.array('documents', 10), (req, res) => {
  try {
    const submission = {
      id: Date.now().toString(),
      type: 'tender',
      data: JSON.parse(req.body.formData),
      files: req.files?.map(f => ({
        filename: f.filename,
        originalname: f.originalname,
        size: f.size,
        path: f.path
      })) || [],
      status: 'pending',
      submittedAt: new Date().toISOString(),
      notes: ''
    };

    submissions.tenders.push(submission);
    saveData(SUBMISSIONS_FILE, submissions); // Save to file

    res.json({
      success: true,
      submissionId: submission.id,
      message: 'تم إرسال العرض بنجاح'
    });
  } catch (error) {
    console.error('Error processing tender:', error);
    res.status(500).json({ error: 'Failed to process submission' });
  }
});

// ===== CERTIFICATE LOOKUP =====
app.post('/api/certificate-lookup', (req, res) => {
  try {
    const { idNumber } = req.body;

    // Store the lookup request
    const lookup = {
      id: Date.now().toString(),
      type: 'certificateLookup',
      idNumber,
      requestedAt: new Date().toISOString(),
      status: 'completed'
    };

    submissions.certificates.push(lookup);
    saveData(SUBMISSIONS_FILE, submissions); // Save to file

    // In production, check against a real database
    // For now, return mock data
    const mockCertificate = {
      found: true,
      fullName: 'اسم المواطن',
      idNumber: idNumber,
      address: 'الحسينية',
      issueDate: new Date().toISOString().split('T')[0],
      certificateNumber: `CERT-${Date.now()}`
    };

    res.json(mockCertificate);
  } catch (error) {
    console.error('Error processing certificate lookup:', error);
    res.status(500).json({ error: 'Failed to process lookup' });
  }
});

// ===== ADMIN ENDPOINTS =====

// Get all submissions by type
app.get('/api/admin/submissions/:type', adminAuth, (req, res) => {
  const { type } = req.params;
  const { status, page = 1, limit = 20 } = req.query;

  let data = [];
  switch(type) {
    case 'documentAuth':
      data = submissions.documentAuth;
      break;
    case 'officialDoc':
      data = submissions.officialDoc;
      break;
    case 'tenders':
      data = submissions.tenders;
      break;
    case 'certificates':
      data = submissions.certificates;
      break;
    default:
      return res.status(400).json({ error: 'Invalid type' });
  }

  // Filter by status if provided
  if (status) {
    data = data.filter(item => item.status === status);
  }

  // Sort by date (newest first)
  data = data.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedData = data.slice(startIndex, endIndex);

  res.json({
    submissions: paginatedData,
    total: data.length,
    page: parseInt(page),
    totalPages: Math.ceil(data.length / limit)
  });
});

// Get submission by ID
app.get('/api/admin/submission/:id', adminAuth, (req, res) => {
  const { id } = req.params;

  const allSubmissions = [
    ...submissions.documentAuth,
    ...submissions.officialDoc,
    ...submissions.tenders,
    ...submissions.certificates
  ];

  const submission = allSubmissions.find(s => s.id === id);

  if (submission) {
    res.json(submission);
  } else {
    res.status(404).json({ error: 'Submission not found' });
  }
});

// Update submission status
app.patch('/api/admin/submission/:id', adminAuth, (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  let found = false;

  for (const category in submissions) {
    const submission = submissions[category].find(s => s.id === id);
    if (submission) {
      if (status) submission.status = status;
      if (notes !== undefined) submission.notes = notes;
      submission.updatedAt = new Date().toISOString();
      saveData(SUBMISSIONS_FILE, submissions); // Save to file
      found = true;
      res.json({ success: true, submission });
      break;
    }
  }

  if (!found) {
    res.status(404).json({ error: 'Submission not found' });
  }
});

// Delete submission
app.delete('/api/admin/submission/:id', adminAuth, (req, res) => {
  const { id } = req.params;

  let found = false;

  for (const category in submissions) {
    const index = submissions[category].findIndex(s => s.id === id);
    if (index !== -1) {
      // Delete associated files
      const submission = submissions[category][index];
      if (submission.files) {
        submission.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }

      submissions[category].splice(index, 1);
      saveData(SUBMISSIONS_FILE, submissions); // Save to file
      found = true;
      res.json({ success: true });
      break;
    }
  }

  if (!found) {
    res.status(404).json({ error: 'Submission not found' });
  }
});

// Get dashboard statistics
app.get('/api/admin/stats', adminAuth, (req, res) => {
  const stats = {
    documentAuth: {
      total: submissions.documentAuth.length,
      pending: submissions.documentAuth.filter(s => s.status === 'pending').length,
      approved: submissions.documentAuth.filter(s => s.status === 'approved').length,
      rejected: submissions.documentAuth.filter(s => s.status === 'rejected').length
    },
    officialDoc: {
      total: submissions.officialDoc.length,
      pending: submissions.officialDoc.filter(s => s.status === 'pending').length,
      approved: submissions.officialDoc.filter(s => s.status === 'approved').length,
      rejected: submissions.officialDoc.filter(s => s.status === 'rejected').length
    },
    tenders: {
      total: submissions.tenders.length,
      pending: submissions.tenders.filter(s => s.status === 'pending').length,
      approved: submissions.tenders.filter(s => s.status === 'approved').length,
      rejected: submissions.tenders.filter(s => s.status === 'rejected').length
    },
    certificates: {
      total: submissions.certificates.length
    }
  };

  res.json(stats);
});

// ===== TENDER PUBLISHING ENDPOINTS =====
// Load existing tenders or create default one
let publishedTenders = loadData(TENDERS_FILE, [
  {
    id: '1',
    title: 'مناقصة لتوريد مواد بناء',
    titleHe: 'מכרז לאספקת חומרי בניין',
    description: 'مناقصة لتوريد مواد بناء للمشاريع العامة في القرية',
    descriptionHe: 'מכרז לאספקת חומרי בניין לפרויקטים ציבוריים בכפר',
    category: 'supply',
    deadline: '2025-02-01',
    budget: '500000',
    requirements: 'رخصة تجارية سارية، خبرة لا تقل عن 3 سنوات',
    contactEmail: 'tenders@husniyya.gov',
    contactPhone: '04-1234567',
    status: 'active',
    publishedAt: new Date().toISOString(),
    documents: []
  }
]);

// Track request by reference number (public endpoint)
app.get('/api/track/:referenceNumber', (req, res) => {
  const { referenceNumber } = req.params;

  // Search in all submission types
  const allSubmissions = [];

  // Document Authentication submissions
  if (submissions.documentAuth) {
    submissions.documentAuth.forEach(sub => {
      allSubmissions.push({ ...sub, type: 'documentAuth' });
    });
  }

  // Official Document submissions
  if (submissions.officialDoc) {
    submissions.officialDoc.forEach(sub => {
      allSubmissions.push({ ...sub, type: 'officialDoc' });
    });
  }

  // Tender submissions
  if (submissions.tenders) {
    submissions.tenders.forEach(sub => {
      allSubmissions.push({ ...sub, type: 'tenders' });
    });
  }

  // Certificate submissions
  if (submissions.certificates) {
    submissions.certificates.forEach(sub => {
      allSubmissions.push({ ...sub, type: 'certificates' });
    });
  }

  // Find the request
  const request = allSubmissions.find(sub =>
    sub.id === referenceNumber ||
    sub.id.toLowerCase() === referenceNumber.toLowerCase()
  );

  if (request) {
    // Return limited info for privacy
    res.json({
      found: true,
      request: {
        id: request.id,
        type: request.type,
        status: request.status,
        submittedAt: request.submittedAt,
        notes: request.notes || null,
        data: {
          fullName: request.data?.fullName || request.data?.name || null
        }
      }
    });
  } else {
    res.json({ found: false });
  }
});

// Get published tenders (public endpoint)
app.get('/api/tenders/published', (req, res) => {
  const activeTenders = publishedTenders.filter(t => t.status === 'active');
  res.json(activeTenders);
});

// Admin: Get all tenders (including drafts)
app.get('/api/admin/tenders/all', adminAuth, (req, res) => {
  res.json(publishedTenders);
});

// Admin: Create/Publish tender
app.post('/api/admin/tenders/publish', adminAuth, upload.array('documents', 5), (req, res) => {
  try {
    const tender = {
      id: Date.now().toString(),
      ...JSON.parse(req.body.tenderData),
      documents: req.files?.map(f => ({
        filename: f.filename,
        originalname: f.originalname,
        path: f.path
      })) || [],
      publishedAt: new Date().toISOString()
    };

    publishedTenders.push(tender);
    saveData(TENDERS_FILE, publishedTenders); // Save to file
    console.log('✅ Tender published and saved:', tender.title);
    res.json({ success: true, tender });
  } catch (error) {
    console.error('Error publishing tender:', error);
    res.status(500).json({ error: 'Failed to publish tender' });
  }
});

// Admin: Update tender
app.patch('/api/admin/tenders/:id', adminAuth, (req, res) => {
  const { id } = req.params;
  const tender = publishedTenders.find(t => t.id === id);

  if (tender) {
    Object.assign(tender, req.body);
    tender.updatedAt = new Date().toISOString();
    saveData(TENDERS_FILE, publishedTenders); // Save to file
    res.json({ success: true, tender });
  } else {
    res.status(404).json({ error: 'Tender not found' });
  }
});

// Admin: Delete tender
app.delete('/api/admin/tenders/:id', adminAuth, (req, res) => {
  const { id } = req.params;
  const index = publishedTenders.findIndex(t => t.id === id);

  if (index !== -1) {
    publishedTenders.splice(index, 1);
    saveData(TENDERS_FILE, publishedTenders); // Save to file
    console.log('🗑️ Tender deleted and saved');
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Tender not found' });
  }
});

// ===== CERTIFICATE DOWNLOADS LOGGING =====
// Load existing downloads log
let downloadsLog = loadData(DOWNLOADS_LOG_FILE, []);
let visitsLog = loadData(VISITS_LOG_FILE, []);

// Log a page visit (public endpoint)
app.post('/api/visit/log', (req, res) => {
  try {
    const { page, userAgent } = req.body;

    const logEntry = {
      id: Date.now().toString(),
      page: page || 'home',
      visitedAt: new Date().toISOString(),
      ipAddress: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown',
      userAgent: userAgent || req.headers['user-agent'] || 'unknown'
    };

    visitsLog.push(logEntry);
    saveData(VISITS_LOG_FILE, visitsLog);

    console.log(`👁️ زيارة صفحة: ${logEntry.page} - ${logEntry.visitedAt}`);

    res.json({ success: true, logId: logEntry.id });
  } catch (error) {
    console.error('Error logging visit:', error);
    res.status(500).json({ error: 'Failed to log visit' });
  }
});

// Get all visits (admin endpoint)
app.get('/api/admin/visits', adminAuth, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const filterPage = req.query.filterPage || null;

  let filteredLogs = [...visitsLog];

  if (filterPage) {
    filteredLogs = filteredLogs.filter(v => v.page === filterPage);
  }

  const sortedLogs = filteredLogs.sort((a, b) =>
    new Date(b.visitedAt) - new Date(a.visitedAt)
  );

  const startIndex = (page - 1) * limit;
  const paginatedLogs = sortedLogs.slice(startIndex, startIndex + limit);

  res.json({
    visits: paginatedLogs,
    total: filteredLogs.length,
    page,
    totalPages: Math.ceil(filteredLogs.length / limit)
  });
});

// Get visits statistics (admin endpoint)
app.get('/api/admin/visits/stats', adminAuth, (req, res) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Count visits by page
  const pageStats = {};
  visitsLog.forEach(v => {
    pageStats[v.page] = (pageStats[v.page] || 0) + 1;
  });

  // Count today's visits by hour
  const todayVisits = visitsLog.filter(v => new Date(v.visitedAt) >= today);
  const hourlyStats = {};
  todayVisits.forEach(v => {
    const hour = new Date(v.visitedAt).getHours();
    hourlyStats[hour] = (hourlyStats[hour] || 0) + 1;
  });

  res.json({
    total: visitsLog.length,
    today: todayVisits.length,
    thisWeek: visitsLog.filter(v => new Date(v.visitedAt) >= thisWeek).length,
    thisMonth: visitsLog.filter(v => new Date(v.visitedAt) >= thisMonth).length,
    uniqueIPs: [...new Set(visitsLog.map(v => v.ipAddress))].length,
    pageStats,
    hourlyStats,
    recentVisits: [...visitsLog]
      .sort((a, b) => new Date(b.visitedAt) - new Date(a.visitedAt))
      .slice(0, 10)
  });
});

// Log a certificate download (public endpoint)
app.post('/api/certificate/download-log', (req, res) => {
  try {
    const { idNumber, pageNumber, timestamp } = req.body;

    const logEntry = {
      id: Date.now().toString(),
      idNumber: idNumber,
      pageNumber: pageNumber,
      downloadedAt: timestamp || new Date().toISOString(),
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown'
    };

    downloadsLog.push(logEntry);
    saveData(DOWNLOADS_LOG_FILE, downloadsLog);

    console.log(`📥 אישור תושב הורד - ת.ז: ${idNumber}, עמוד: ${pageNumber}, זמן: ${logEntry.downloadedAt}`);

    res.json({ success: true, logId: logEntry.id });
  } catch (error) {
    console.error('Error logging download:', error);
    res.status(500).json({ error: 'Failed to log download' });
  }
});

// Admin: Get all download logs
app.get('/api/admin/downloads', adminAuth, (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);

  // Sort by date descending (newest first)
  const sortedLogs = [...downloadsLog].sort((a, b) =>
    new Date(b.downloadedAt) - new Date(a.downloadedAt)
  );

  const paginatedLogs = sortedLogs.slice(startIndex, endIndex);

  res.json({
    downloads: paginatedLogs,
    total: downloadsLog.length,
    page: parseInt(page),
    totalPages: Math.ceil(downloadsLog.length / limit)
  });
});

// Admin: Get download statistics
app.get('/api/admin/downloads/stats', adminAuth, (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thisWeek = new Date();
  thisWeek.setDate(thisWeek.getDate() - 7);

  const thisMonth = new Date();
  thisMonth.setMonth(thisMonth.getMonth() - 1);

  const stats = {
    total: downloadsLog.length,
    today: downloadsLog.filter(d => new Date(d.downloadedAt) >= today).length,
    thisWeek: downloadsLog.filter(d => new Date(d.downloadedAt) >= thisWeek).length,
    thisMonth: downloadsLog.filter(d => new Date(d.downloadedAt) >= thisMonth).length,
    uniqueIds: [...new Set(downloadsLog.map(d => d.idNumber))].length,
    recentDownloads: [...downloadsLog]
      .sort((a, b) => new Date(b.downloadedAt) - new Date(a.downloadedAt))
      .slice(0, 10)
  };

  res.json(stats);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Admin access: Use Authorization header with "Bearer admin-secret-token"`);
});
