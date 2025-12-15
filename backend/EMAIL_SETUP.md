# Email Setup Guide

## Current Configuration

All document authentication requests are configured to send to:
**husniua.committe@gmail.com**

## Status

Currently, the system logs email notifications to the console but doesn't actually send them.

**Why Gmail doesn't work:** Gmail requires App Passwords which need 2-Step Verification. If you don't have access to App Passwords, use SendGrid instead (recommended below).

To enable real email sending, follow the steps below.

## Enable Real Email Sending (Production)

### Option 1: Using Brevo (Easiest - No App Password Needed!) ⭐ RECOMMENDED

Brevo (formerly Sendinblue) is completely free for up to 300 emails/day and very easy to set up:

1. **Sign up for free:** https://www.brevo.com/
   - Click "Sign up free"
   - Enter your email and create password
   - Verify your email

2. **Get your SMTP credentials:**
   - Log in to Brevo
   - Go to "Settings" (top right)
   - Click "SMTP & API"
   - You'll see your SMTP credentials

3. **Update your `.env` file:**
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-brevo-smtp-key
```

4. **Update `server.js`** - Replace the transporter configuration:
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,  // Your login email
    pass: process.env.EMAIL_PASSWORD  // Your SMTP key from Brevo
  }
});
```

5. **Restart the server** - Emails will now be sent!

### Option 2: Using Gmail (Requires App Password)

1. Install nodemailer:
```bash
npm install nodemailer
```

2. Add this code to the top of `server.js`:

```javascript
const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// Email sending function
async function sendEmail({ to, subject, html, attachments = [] }) {
  try {
    const info = await transporter.sendMail({
      from: '"اللجنة المحلية - الحسينية" <your-email@gmail.com>',
      to: to,
      subject: subject,
      html: html,
      attachments: attachments
    });
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
```

3. Update the document-auth endpoint:

```javascript
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

    // Send email notification
    const emailSent = await sendEmail({
      to: 'husniua.committe@gmail.com',
      subject: 'طلب مصادقة مستند جديد - اللجنة المحلية الحسينية',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif;">
          <h2>طلب مصادقة مستند جديد</h2>
          <p><strong>رقم الطلب:</strong> ${submission.id}</p>
          <p><strong>اسم صاحب المستند:</strong> ${submission.data.ownerName}</p>
          <p><strong>رقم الهوية:</strong> ${submission.data.ownerId}</p>
          <p><strong>رقم الهاتف:</strong> ${submission.data.ownerPhone}</p>
          <p><strong>نوع المستند:</strong> ${submission.data.documentType}</p>
          <p><strong>تاريخ التقديم:</strong> ${new Date().toLocaleString('ar')}</p>
          ${submission.data.notes ? `<p><strong>ملاحظات:</strong> ${submission.data.notes}</p>` : ''}
          <hr>
          <p><small>يرجى مراجعة الطلب من خلال لوحة التحكم</small></p>
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
      emailSent: emailSent
    });
  } catch (error) {
    console.error('Error processing document auth:', error);
    res.status(500).json({ error: 'Failed to process submission' });
  }
});
```

4. Create a `.env` file in the backend folder:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

5. Install dotenv:
```bash
npm install dotenv
```

6. Add to top of `server.js`:
```javascript
require('dotenv').config();
```

### Getting Gmail App Password:

1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Go to Security → App Passwords
4. Generate a new app password for "Mail"
5. Copy the 16-character password
6. Use this in your `.env` file

### Option 2: Using SendGrid (Recommended for production)

1. Install SendGrid:
```bash
npm install @sendgrid/mail
```

2. Sign up at https://sendgrid.com (free tier: 100 emails/day)

3. Get your API key from SendGrid dashboard

4. Add to `server.js`:

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail({ to, subject, html }) {
  try {
    await sgMail.send({
      to: to,
      from: 'no-reply@husniyya.local',
      subject: subject,
      html: html,
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
```

5. Add to `.env`:
```env
SENDGRID_API_KEY=your-sendgrid-api-key
```

## Email Templates

The system sends emails for:
1. ✉️ New document authentication requests
2. ✉️ Status updates (approved/rejected)
3. ✉️ Official document requests
4. ✉️ New tender submissions

## Testing Emails

For testing without sending real emails, you can use:

### Ethereal Email (Free fake SMTP)
```javascript
// Create test account
const testAccount = await nodemailer.createTestAccount();

const transporter = nodemailer.createTransporter({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: testAccount.user,
    pass: testAccount.pass,
  },
});

// Get preview URL
console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
```

## Current Email Destination

All document authentication requests go to:
📧 **husniua.committe@gmail.com**

This email address is:
- Shown to users after successful submission
- Logged in the server console
- Stored in the submission record
- (Not actually sent until you enable one of the options above)

## Next Steps

1. Choose an email service (Gmail for testing, SendGrid for production)
2. Follow the setup instructions above
3. Test email sending with a dummy submission
4. Monitor email delivery in the admin dashboard
5. Add email notifications for status updates

## Security Notes

⚠️ **Important:**
- Never commit `.env` file to git
- Use app-specific passwords, not your main password
- Rotate API keys regularly
- Use environment variables in production
- Consider rate limiting to prevent spam
