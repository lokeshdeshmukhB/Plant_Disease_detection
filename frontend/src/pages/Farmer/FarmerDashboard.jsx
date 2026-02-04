import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaTractor, FaChartLine, FaLeaf, FaHistory } from 'react-icons/fa';
import api from '../../utils/api';
import Navbar from '../../components/Navbar';
import './FarmerDashboard.css';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalFarms: 0,
    totalPredictions: 0,
    healthyPredictions: 0,
    diseasedPredictions: 0
  });
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [farmsRes, predictionsRes] = await Promise.all([
        api.get('/farms'),
        api.get('/predictions')
      ]);

      const farms = farmsRes.data.farms || [];
      const predictions = predictionsRes.data.predictions || [];

      setStats({
        totalFarms: farms.length,
        totalPredictions: predictions.length,
        healthyPredictions: predictions.filter(p => p.overallStatus === 'healthy').length,
        diseasedPredictions: predictions.filter(p => p.overallStatus === 'diseased').length
      });

      setRecentPredictions(predictions.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="container">
          <div className="dashboard-header">
            <div>
              <h1>Welcome back, {user?.name}!</h1>
              <p>Monitor your farms and track plant health</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
              <div className="spinner"></div>
            </div>
          ) : (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #228B22 0%, #32CD32 100%)' }}>
                    <FaTractor />
                  </div>
                  <div className="stat-content">
                    <h3>{stats.totalFarms}</h3>
                    <p>Total Farms</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #7CB342 0%, #9DC183 100%)' }}>
                    <FaChartLine />
                  </div>
                  <div className="stat-content">
                    <h3>{stats.totalPredictions}</h3>
                    <p>Total Predictions</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)' }}>
                    <FaLeaf />
                  </div>
                  <div className="stat-content">
                    <h3>{stats.healthyPredictions}</h3>
                    <p>Healthy Plants</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)' }}>
                    <FaHistory />
                  </div>
                  <div className="stat-content">
                    <h3>{stats.diseasedPredictions}</h3>
                    <p>Diseased Plants</p>
                  </div>
                </div>
              </div>

              <div className="dashboard-actions">
                <Link to="/farmer/detect" className="action-card">
                  <FaChartLine className="action-icon" />
                  <h3>Disease Detection</h3>
                  <p>Upload plant images for AI-powered disease detection</p>
                </Link>

                <Link to="/farmer/farms" className="action-card">
                  <FaTractor className="action-icon" />
                  <h3>Manage Farms</h3>
                  <p>Add or update your farm information</p>
                </Link>

                <Link to="/farmer/history" className="action-card">
                  <FaHistory className="action-icon" />
                  <h3>Prediction History</h3>
                  <p>View all your past disease predictions</p>
                </Link>
              </div>

              {recentPredictions.length > 0 && (
                <div className="recent-section">
                  <h2>Recent Predictions</h2>
                  <div className="predictions-list">
                    {recentPredictions.map((prediction) => (
                      <div key={prediction._id} className="prediction-item">
                        <div className="prediction-info">
                          <h4>Prediction from {new Date(prediction.createdAt).toLocaleDateString()}</h4>
                          <p>{prediction.images.length} images analyzed</p>
                        </div>
                        <div className="prediction-status">
                          <span className={`badge badge-${prediction.overallStatus === 'healthy' ? 'success' : 'warning'}`}>
                            {prediction.overallStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default FarmerDashboard;
