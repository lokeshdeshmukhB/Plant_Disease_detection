# PlantDI - Plant Disease Detection Platform

A MERN stack web application for AI-powered tomato plant disease detection with farmer and admin roles.

## Features

### For Farmers
- 🌱 Register and manage farm information
- 📸 Upload multiple plant images for disease detection
- 🤖 AI-powered prediction for 10 tomato disease categories
- 📊 View prediction history and farm statistics
- 🎯 Track healthy vs diseased plant ratios

### For Admins
- 👥 View all registered farmers
- 📈 Monitor platform statistics
- 📊 Track prediction analytics
- 👀 View detailed farmer information and their predictions

### Disease Categories
1. Tomato Bacterial Spot
2. Tomato Early Blight
3. Tomato Late Blight
4. Tomato Leaf Mold
5. Tomato Septoria Leaf Spot
6. Tomato Spider Mites (Two-spotted Spider Mite)
7. Tomato Target Spot
8. Tomato Yellow Leaf Curl Virus
9. Tomato Mosaic Virus
10. Tomato Healthy

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Multer (File uploads)
- bcryptjs (Password hashing)

### ML Service
- Python Flask
- TensorFlow/Keras
- Pillow (Image processing)
- NumPy

### Frontend
- React 18
- Vite
- React Router v6
- Axios
- React Icons
- React Toastify
- Green-themed responsive UI

## Installation

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- MongoDB Atlas account or local MongoDB

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file (already created with your MongoDB URI):
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
ML_SERVICE_URL=http://localhost:5001
```

Start the backend:
```bash
npm run dev
```

### ML Service Setup

```bash
cd ml-service
pip install -r requirements.txt
```

Place your trained `.pkl` model file in `ml-service/model/plant_disease_model.pkl`

Start the ML service:
```bash
python app.py
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

### Farmer Workflow
1. Sign up as a farmer
2. Login with your credentials
3. Add farm information (optional)
4. Navigate to Disease Detection
5. Upload 1-10 tomato plant images
6. View AI predictions with confidence scores
7. Check prediction history

### Admin Workflow
1. Login with admin credentials (admin accounts must be created directly in database)
2. View platform statistics
3. Browse registered farmers
4. View detailed farmer information and their prediction history

## Creating an Admin Account

Since admin accounts cannot be registered through the UI for security, you need to create one directly in MongoDB:

```javascript
// Connect to your MongoDB and run:
db.users.insertOne({
  name: "Admin Name",
  email: "admin@plantdi.com",
  password: "$2a$10$...", // Use bcrypt to hash your password
  role: "admin",
  createdAt: new Date()
})
```

Or use the signup endpoint with role parameter (for development only):
```bash
POST /api/auth/signup
{
  "name": "Admin Name",
  "email": "admin@plantdi.com",
  "password": "your_password",
  "role": "admin"
}
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register farmer
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile

### Farmer Endpoints
- `POST /api/farms` - Create farm
- `GET /api/farms` - Get user's farms
- `POST /api/predictions/predict` - Upload images and predict
- `GET /api/predictions` - Get prediction history

### Admin Endpoints
- `GET /api/admin/farmers` - Get all farmers
- `GET /api/admin/farmers/:id` - Get farmer details
- `GET /api/admin/stats` - Get platform statistics

## Project Structure

```
plantdi/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── ml-service/
│   ├── model/
│   ├── app.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── utils/
    │   └── App.jsx
    └── package.json
```

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
# Plant-Disease-Detection
# Plant_Disease_detection
