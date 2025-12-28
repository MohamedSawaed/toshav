const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Define Schemas
const submissionSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ['documentAuth', 'officialDoc', 'tender', 'certificateLookup'] },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  files: [{
    filename: String,
    originalname: String,
    size: Number,
    path: String
  }],
  adminResponseFile: {
    filename: String,
    originalname: String,
    size: Number,
    path: String,
    uploadedAt: Date
  },
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected', 'completed'] },
  notes: { type: String, default: '' },
  emailSentTo: String,
  submittedAt: { type: Date, default: Date.now },
  updatedAt: Date
});

const tenderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleHe: String,
  description: String,
  descriptionHe: String,
  category: { type: String, default: 'construction' },
  deadline: Date,
  budget: String,
  requirements: String,
  contactEmail: String,
  contactPhone: String,
  status: { type: String, default: 'active', enum: ['active', 'closed', 'draft'] },
  documents: [{
    filename: String,
    originalname: String,
    path: String
  }],
  publishedAt: { type: Date, default: Date.now },
  updatedAt: Date
});

const downloadLogSchema = new mongoose.Schema({
  idNumber: { type: String, required: true },
  pageNumber: Number,
  downloadedAt: { type: Date, default: Date.now },
  ipAddress: String
});

const visitLogSchema = new mongoose.Schema({
  page: { type: String, required: true },
  visitedAt: { type: Date, default: Date.now },
  ipAddress: String,
  userAgent: String
});

const protocolSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleHe: String,
  meetingDate: { type: Date, required: true },
  meetingNumber: String,
  description: String,
  descriptionHe: String,
  file: {
    filename: String,
    originalname: String,
    size: Number,
    url: String,
    public_id: String
  },
  status: { type: String, default: 'published', enum: ['published', 'draft'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

// Create Models
const Submission = mongoose.model('Submission', submissionSchema);
const Tender = mongoose.model('Tender', tenderSchema);
const DownloadLog = mongoose.model('DownloadLog', downloadLogSchema);
const VisitLog = mongoose.model('VisitLog', visitLogSchema);
const Protocol = mongoose.model('Protocol', protocolSchema);

module.exports = {
  connectDB,
  Submission,
  Tender,
  DownloadLog,
  VisitLog,
  Protocol
};
