import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaChartLine, FaLeaf, FaTractor } from 'react-icons/fa';
import api from '../../utils/api';
import Navbar from '../../components/Navbar';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <div className="spinner"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="admin-container">
        <div className="container">
          <div className="admin-header">
            <h1>Admin Dashboard</h1>
            <p>Monitor platform statistics and farmer activity</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #228B22 0%, #32CD32 100%)' }}>
                <FaUsers />
              </div>
              <div className="stat-content">
                <h3>{stats?.totalFarmers || 0}</h3>
                <p>Total Farmers</p>
                <span className="stat-meta">+{stats?.recentFarmers || 0} this week</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #7CB342 0%, #9DC183 100%)' }}>
                <FaTractor />
              </div>
              <div className="stat-content">
                <h3>{stats?.totalFarms || 0}</h3>
                <p>Total Farms</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)' }}>
                <FaChartLine />
              </div>
              <div className="stat-content">
                <h3>{stats?.totalPredictions || 0}</h3>
                <p>Total Predictions</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)' }}>
                <FaLeaf />
              </div>
              <div className="stat-content">
                <h3>{stats?.predictionStats?.healthy || 0}</h3>
                <p>Healthy Predictions</p>
              </div>
            </div>
          </div>

          <div className="admin-grid">
            <div className="admin-card">
              <h2>Prediction Statistics</h2>
              <div className="prediction-stats">
                <div className="stat-item">
                  <span className="stat-label">Healthy</span>
                  <div className="stat-bar">
                    <div
                      className="stat-bar-fill healthy"
                      style={{
                        width: `${(stats?.predictionStats?.healthy / stats?.totalPredictions * 100) || 0}%`
                      }}
                    ></div>
                  </div>
                  <span className="stat-value">{stats?.predictionStats?.healthy || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Diseased</span>
                  <div className="stat-bar">
                    <div
                      className="stat-bar-fill diseased"
                      style={{
                        width: `${(stats?.predictionStats?.diseased / stats?.totalPredictions * 100) || 0}%`
                      }}
                    ></div>
                  </div>
                  <span className="stat-value">{stats?.predictionStats?.diseased || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Mixed</span>
                  <div className="stat-bar">
                    <div
                      className="stat-bar-fill mixed"
                      style={{
                        width: `${(stats?.predictionStats?.mixed / stats?.totalPredictions * 100) || 0}%`
                      }}
                    ></div>
                  </div>
                  <span className="stat-value">{stats?.predictionStats?.mixed || 0}</span>
                </div>
              </div>
            </div>

            <div className="admin-card">
              <h2>Quick Actions</h2>
              <div className="action-buttons">
                <Link to="/admin/farmers" className="action-btn">
                  <FaUsers />
                  <span>View All Farmers</span>
                </Link>
                <Link to="/admin/farmers" className="action-btn">
                  <FaChartLine />
                  <span>Detailed Analytics</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
