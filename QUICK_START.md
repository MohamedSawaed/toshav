# Quick Start Guide

## 🚀 Start the Backend Server

### Option 1: Using the batch file (Windows)
Double-click on `start-backend.bat`

### Option 2: Manual commands
```bash
cd toshab/backend
npm install
npm run dev
```

The server will start on `http://localhost:3001`

## ✅ Verify Backend is Running

Open your browser and go to:
```
http://localhost:3001/api/admin/stats
```

You should see authentication error (this is normal - it means the server is running!)

## 📱 Start the Frontend

In a new terminal:
```bash
cd toshab
npm start
```

Your React app will start on `http://localhost:3000`

## 🔐 Access Admin Panel

1. Go to your React app home page
2. Look for the admin access (you can add a hidden button or use a special URL)
3. Default password: `admin123` (change this!)
4. Default API token: `admin-secret-token` (change this!)

## 📝 Next Steps

1. Update your form components to send data to the API
   - See [ADMIN_SETUP.md](./ADMIN_SETUP.md) for code examples

2. Add admin route to App.js:
```javascript
import AdminDashboard from './AdminDashboard';

// In your App component:
if (currentView === 'admin') {
  return <AdminDashboard />;
}
```

3. Test the system:
   - Submit a form
   - Check the admin dashboard
   - Approve/reject submissions

## 🛠️ Troubleshooting

### Backend won't start
- Make sure you're in the correct directory: `toshab/backend`
- Check if port 3001 is already in use
- Run `npm install` again

### CORS errors
- Make sure backend is running on port 3001
- Check that frontend is making requests to `http://localhost:3001`

### Files not uploading
- Check that `uploads` folder exists in backend directory
- Check file size limits (default: 10MB)

## 📚 Full Documentation

See [ADMIN_SETUP.md](./ADMIN_SETUP.md) for:
- Complete API documentation
- Integration examples for all forms
- Production deployment guide
- Security best practices

## 🎯 Current Status

✅ Backend server created
✅ Admin dashboard created
✅ Dependencies installed
⏳ Forms need to be updated to use API
⏳ Admin route needs to be added to App.js
⏳ Test and deploy

---

**Project Structure:**
```
toshab/
├── backend/
│   ├── server.js         ← Backend API
│   ├── package.json
│   └── uploads/          ← File uploads stored here
├── src/
│   ├── AdminDashboard.js ← Admin panel
│   ├── App.js
│   └── [other components]
├── start-backend.bat     ← Quick start script
└── ADMIN_SETUP.md        ← Full documentation
```
