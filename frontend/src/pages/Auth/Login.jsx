import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaEnvelope, FaLock, FaLeaf, FaUser } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      toast.success('Login successful!');
      // Navigate based on role
      if (result.user.role === 'admin') {
        navigate('/admin/stats');
      } else {
        navigate('/farmer/dashboard');
      }
    } else {
      toast.error(result.message || 'Login failed');
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
          <h1>Welcome Back</h1>
          <p>Login to your PlantDI account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
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
              <FaLock /> Password
            </label>
            <input
              type="password"
              name="password"
              className="input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
                Logging in...
              </>
            ) : (
              <>
                <FaUser /> Login
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="auth-link">
              Sign up here
            </Link>
          </p>
        </div>
      </div>

      <div className="auth-info">
        <h2>Plant Disease Detection System</h2>
        <p>
          AI-powered tomato disease prediction to help farmers protect their crops
          and maximize yields.
        </p>
        <div className="info-features">
          <div className="feature-item">
            <FaLeaf className="feature-icon" />
            <div>
              <h4>Accurate Detection</h4>
              <p>10 tomato disease categories</p>
            </div>
          </div>
          <div className="feature-item">
            <FaUser className="feature-icon" />
            <div>
              <h4>Easy to Use</h4>
              <p>Upload images and get instant results</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
