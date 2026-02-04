# Quick Start Guide

## 🚀 Starting the Application

### 1. Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```
Backend runs on: http://localhost:5000

### 2. Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:5173 (or 5174 if 5173 is busy)

### 3. Start ML Service (Terminal 3) - Optional
```bash
cd ml-service
python app.py
```
ML Service runs on: http://localhost:5001

## 👤 Admin Login

**Create Admin Account:**

Option 1: Using PowerShell/Command Prompt
```powershell
curl -X POST http://localhost:5000/api/auth/signup `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Admin User\",\"email\":\"admin@plantdi.com\",\"password\":\"admin123\",\"role\":\"admin\"}'
```

Option 2: Using a REST client (Postman, Thunder Client, etc.)
```
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@plantdi.com",
  "password": "admin123",
  "role": "admin"
}
```

**Admin Login Credentials:**
- Email: `admin@plantdi.com`
- Password: `admin123`

## 🌱 Farmer Registration

Farmers can register directly through the UI:
1. Go to http://localhost:5173/signup
2. Fill in the registration form
3. Login with your credentials

## 🔧 Troubleshooting

**Backend not connecting?**
- Make sure MongoDB URI in `backend/.env` is correct
- Check if port 5000 is available
- Restart the backend server

**Frontend shows connection error?**
- Make sure backend is running on port 5000
- Check browser console for errors
- Clear browser cache and reload

**ML predictions not working?**
- Place your `.pkl` model file at `ml-service/model/plant_disease_model.pkl`
- Make sure ML service is running on port 5001
- The app will work without ML service, but predictions won't be accurate

## 📱 Access URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **ML Service:** http://localhost:5001
- **API Docs:** http://localhost:5000 (shows API info)

## 🎯 Testing Flow

1. **Create Admin** (using curl command above)
2. **Login as Admin** at http://localhost:5173/login
3. **Register as Farmer** at http://localhost:5173/signup
4. **Login as Farmer** and test disease detection
5. **Switch to Admin** to view farmer statistics
