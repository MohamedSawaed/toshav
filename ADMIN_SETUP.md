# Admin Panel Setup Guide

This guide will help you set up the backend server and admin dashboard for managing form submissions and publishing tenders.

## Architecture Overview

```
┌─────────────────┐         ┌──────────────┐         ┌──────────────┐
│  Frontend Apps  │  ────>  │   Backend    │  ────>  │   Database   │
│  (React Forms)  │         │   (Express)  │         │  (In-memory) │
└─────────────────┘         └──────────────┘         └──────────────┘
                                    │
                                    ▼
                            ┌──────────────┐
                            │    Admin     │
                            │  Dashboard   │
                            └──────────────┘
```

## Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

## Step 2: Start the Backend Server

```bash
# Development mode (with auto-restart)
npm run dev

# OR Production mode
npm start
```

The server will run on `http://localhost:3001`

## Step 3: Update Your Frontend Forms

Update each form component to send data to the backend API:

### For DocumentAuthenticationRequest.js:

```javascript
const handleSubmit = async () => {
  setIsSubmitting(true);

  try {
    const formDataObj = new FormData();
    formDataObj.append('formData', JSON.stringify(formData));

    // Add files
    formData.documents.forEach((file) => {
      formDataObj.append('documents', file);
    });

    const response = await fetch('http://localhost:3001/api/document-auth', {
      method: 'POST',
      body: formDataObj
    });

    const result = await response.json();

    if (result.success) {
      setIsSubmitted(true);
      setSubmissionId(result.submissionId);
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    alert('حدث خطأ أثناء إرسال الطلب');
  } finally {
    setIsSubmitting(false);
  }
};
```

### For OfficialDocumentRequest.js:

```javascript
const handleSubmit = async () => {
  setIsSubmitting(true);

  try {
    const formDataObj = new FormData();
    formDataObj.append('formData', JSON.stringify(formData));

    // Add files
    formData.attachments.forEach((file) => {
      formDataObj.append('attachments', file);
    });

    const response = await fetch('http://localhost:3001/api/official-doc', {
      method: 'POST',
      body: formDataObj
    });

    const result = await response.json();

    if (result.success) {
      setIsSubmitted(true);
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    alert('حدث خطأ أثناء إرسال الطلب');
  } finally {
    setIsSubmitting(false);
  }
};
```

### For TenderAnnouncements.js:

Update to fetch published tenders:

```javascript
useEffect(() => {
  fetch('http://localhost:3001/api/tenders/published')
    .then(res => res.json())
    .then(data => setTenders(data))
    .catch(err => console.error('Error fetching tenders:', err));
}, []);
```

And update tender submission:

```javascript
const handleSubmit = async () => {
  try {
    const formDataObj = new FormData();
    formDataObj.append('formData', JSON.stringify(formData));

    formData.documents.forEach((file) => {
      formDataObj.append('documents', file);
    });

    const response = await fetch('http://localhost:3001/api/tenders', {
      method: 'POST',
      body: formDataObj
    });

    const result = await response.json();

    if (result.success) {
      setIsSubmitted(true);
    }
  } catch (error) {
    console.error('Error submitting tender:', error);
  }
};
```

### For ResidentCertificateLookup.js:

```javascript
const handleLookup = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/certificate-lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idNumber })
    });

    const data = await response.json();

    if (data.found) {
      setCertificate(data);
    } else {
      alert('لم يتم العثور على شهادة');
    }
  } catch (error) {
    console.error('Error looking up certificate:', error);
  }
};
```

## Step 4: Add Admin Dashboard to Your App

Update [App.js](c:\projects\projectshere\toshav\toshab\src\App.js):

```javascript
import AdminDashboard from './AdminDashboard';

function App() {
  const [currentView, setCurrentView] = useState('home');

  // ... existing code ...

  // Add admin view
  if (currentView === 'admin') {
    return (
      <div style={{ position: 'relative' }}>
        <div style={styles.backBtnContainer}>
          <BackButton />
        </div>
        <AdminDashboard />
      </div>
    );
  }

  // In your home page, add an admin button (hidden or password-protected)
  // Add this card to your home page cards:
  {/* Admin Access - Hidden by default */}
  <div
    className="home-card"
    style={styles.card}
    onClick={() => {
      const password = prompt('أدخل كلمة المرور:');
      if (password === 'admin123') { // Change this!
        setCurrentView('admin');
      } else {
        alert('كلمة المرور غير صحيحة');
      }
    }}
  >
    {/* Admin card design */}
  </div>
}
```

## Step 5: Access the Admin Panel

1. Start your React app:
   ```bash
   npm start
   ```

2. Navigate to the admin section (password: `admin123`)

3. Default admin token is `admin-secret-token` (change in production!)

## API Endpoints

### Public Endpoints:
- `POST /api/document-auth` - Submit document authentication request
- `POST /api/official-doc` - Submit official document request
- `POST /api/tenders` - Submit tender bid
- `POST /api/certificate-lookup` - Lookup certificate
- `GET /api/tenders/published` - Get published tenders

### Admin Endpoints (require authentication):
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/submissions/:type` - Get submissions by type
- `GET /api/admin/submission/:id` - Get submission details
- `PATCH /api/admin/submission/:id` - Update submission status
- `DELETE /api/admin/submission/:id` - Delete submission
- `GET /api/admin/tenders/all` - Get all tenders
- `POST /api/admin/tenders/publish` - Publish new tender
- `PATCH /api/admin/tenders/:id` - Update tender
- `DELETE /api/admin/tenders/:id` - Delete tender

## Production Deployment

### Important Security Steps:

1. **Change the admin token:**
   - In `backend/server.js`, replace `admin-secret-token` with a strong secret
   - Use environment variables: `process.env.ADMIN_TOKEN`

2. **Use a real database:**
   - Replace in-memory storage with MongoDB, PostgreSQL, or MySQL
   - Install database package: `npm install mongoose` (for MongoDB)

3. **Add proper authentication:**
   - Implement JWT-based authentication
   - Add user roles and permissions
   - Use bcrypt for password hashing

4. **Configure CORS properly:**
   - Restrict to your domain only
   - Update `cors()` in server.js

5. **Add HTTPS:**
   - Use SSL certificates
   - Deploy behind a reverse proxy (nginx)

6. **File upload security:**
   - Validate file types
   - Scan for viruses
   - Store in cloud storage (AWS S3, Azure Blob)

### Database Migration Example (MongoDB):

```javascript
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Define schema
const SubmissionSchema = new mongoose.Schema({
  type: String,
  data: Object,
  files: Array,
  status: String,
  submittedAt: Date,
  notes: String
});

const Submission = mongoose.model('Submission', SubmissionSchema);

// Replace in-memory storage with database queries
app.post('/api/document-auth', async (req, res) => {
  const submission = new Submission({
    type: 'documentAuth',
    data: JSON.parse(req.body.formData),
    files: req.files.map(f => ({ ... })),
    status: 'pending',
    submittedAt: new Date()
  });

  await submission.save();
  res.json({ success: true, submissionId: submission._id });
});
```

## Troubleshooting

### CORS Errors:
Make sure your backend has CORS enabled and allows requests from your frontend URL.

### File Upload Errors:
Check that the `uploads` directory exists and has write permissions.

### Port Already in Use:
Change the PORT in server.js or stop the process using port 3001.

## Features

✅ View all form submissions in one place
✅ Filter by status (pending/approved/rejected)
✅ View submission details and attachments
✅ Approve, reject, or delete submissions
✅ Add notes to submissions
✅ Publish and manage tenders
✅ Dashboard with statistics
✅ File upload and download
✅ RTL support for Arabic

## Next Steps

1. Add email notifications when submissions are updated
2. Add SMS notifications via Twilio
3. Generate PDF certificates automatically
4. Add analytics and reporting
5. Implement user roles (admin, viewer, editor)
6. Add audit logs
7. Integrate with payment gateways
8. Add WhatsApp integration for notifications

## Support

For questions or issues, contact the development team.
