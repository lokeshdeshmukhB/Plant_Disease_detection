import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaEnvelope, FaLock, FaLeaf, FaUser, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    address: '',
    role: 'farmer'
  });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { confirmPassword, ...signupData } = formData;
    const result = await signup(signupData);

    if (result.success) {
      toast.success('Account created successfully!');
      navigate('/farmer/dashboard');
    } else {
      toast.error(result.message || 'Signup failed');
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <FaLeaf />
          </div>
          <h1>Create Account</h1>
          <p>Join PlantDI as {formData.role === 'farmer' ? 'a Farmer' : 'an Admin'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label">
              <FaUser /> Select Role
            </label>
            <select
              name="role"
              className="select"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="farmer">Farmer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">
              <FaUser /> Full Name
            </label>
            <input
              type="text"
              name="name"
              className="input"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              <FaEnvelope /> Email
            </label>
            <input
              type="email"
              name="email"
              className="input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              <FaPhone /> Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              className="input"
              placeholder="Enter your phone number"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              <FaMapMarkerAlt /> Address
            </label>
            <input
              type="text"
              name="address"
              className="input"
              placeholder="Enter your address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              <FaLock /> Password
            </label>
            <input
              type="password"
              name="password"
              className="input"
              placeholder="Create a password (min 6 characters)"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              <FaLock /> Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              className="input"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
                Creating account...
              </>
            ) : (
              <>
                <FaUser /> Create Account
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Login here
            </Link>
          </p>
        </div>
      </div>

      <div className="auth-info">
        <h2>Why Join PlantDI?</h2>
        <p>
          Get access to AI-powered plant disease detection and protect your tomato crops
          with cutting-edge technology.
        </p>
        <div className="info-features">
          <div className="feature-item">
            <FaLeaf className="feature-icon" />
            <div>
              <h4>Early Detection</h4>
              <p>Identify diseases before they spread</p>
            </div>
          </div>
          <div className="feature-item">
            <FaUser className="feature-icon" />
            <div>
              <h4>Track History</h4>
              <p>Monitor your farm's health over time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
