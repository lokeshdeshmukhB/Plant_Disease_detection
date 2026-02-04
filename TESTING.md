# Testing Guide

## ✅ Changes Made to Fix Issues

### 1. **Added Role Selection to Signup**
- Signup page now has a dropdown to select between "Farmer" and "Admin"
- Both roles can register through the signup page
- Role determines which dashboard you see after login

### 2. **Fixed Backend Connection**
- Updated CORS configuration to allow connections from both localhost:5173 and localhost:5174
- Created `uploads` directory for image storage
- Verified Vite proxy configuration is correct

### 3. **Updated Login Navigation**
- Login page automatically redirects based on user role:
  - Farmers → `/farmer/dashboard`
  - Admins → `/admin/stats`

## 🧪 How to Test

### Test Signup with Role Selection

1. **Open the signup page**: http://localhost:5173/signup (or 5174)

2. **You'll see a new "Select Role" dropdown** at the top of the form

3. **Try creating both types of accounts**:

**Admin Account:**
- Select Role: Admin
- Name: Admin User
- Email: admin@test.com
- Password: admin123
- Fill in other optional fields
- Click "Create Account"

**Farmer Account:**
- Select Role: Farmer
- Name: Test Farmer
- Email: farmer@test.com
- Password: farmer123
- Fill in other fields
- Click "Create Account"

### Test Login

1. **Go to**: http://localhost:5173/login

2. **Login with Admin**:
   - Email: admin@test.com
   - Password: admin123
   - Should redirect to `/admin/stats` (Admin Dashboard)

3. **Logout and Login with Farmer**:
   - Email: farmer@test.com
   - Password: farmer123
   - Should redirect to `/farmer/dashboard` (Farmer Dashboard)

### Test Backend Connection

**Check if backend is running:**
```powershell
curl http://localhost:5000
```

Should return:
```json
{
  "success": true,
  "message": "Plant Disease Prediction API",
  "version": "1.0.0"
}
```

**Test signup API directly:**
```powershell
curl -X POST http://localhost:5000/api/auth/signup `
  -H "Content-Type: application/json" `
  -d '{"name":"Test User","email":"test@example.com","password":"test123","role":"farmer"}'
```

## 🎯 Quick Verification Checklist

- [ ] Can see "Select Role" dropdown on signup page
- [ ] Can select "Farmer" or "Admin" from dropdown
- [ ] Header text updates to show selected role
- [ ] Can create an admin account through signup
- [ ] Can create a farmer account through signup
- [ ] Admin login redirects to `/admin/stats`
- [ ] Farmer login redirects to `/farmer/dashboard`
- [ ] Backend responds on http://localhost:5000
- [ ] Frontend loads without errors

## 🔧 If Backend is Not Running

Make sure to start it:
```bash
cd backend
npm run dev
```

Check for errors in the terminal. Common issues:
- MongoDB connection timeout (check your internet connection)
- Port 5000 already in use (kill the other process)
- Missing dependencies (run `npm install` again)

## 📱 Access URLs

- **Frontend**: http://localhost:5173 (or 5174 if 5173 is busy)
- **Backend API**: http://localhost:5000
- **Signup Page**: http://localhost:5173/signup
- **Login Page**: http://localhost:5173/login
