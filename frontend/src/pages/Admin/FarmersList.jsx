import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEye } from 'react-icons/fa';
import api from '../../utils/api';
import Navbar from '../../components/Navbar';
import './FarmersList.css';

const FarmersList = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      const response = await api.get('/admin/farmers');
      setFarmers(response.data.farmers || []);
    } catch (error) {
      console.error('Error fetching farmers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFarmers = farmers.filter(farmer =>
    farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="farmers-container">
        <div className="container">
          <div className="farmers-header">
            <h1>Registered Farmers</h1>
            <p>View and manage all registered farmers</p>
          </div>

          <div className="search-bar">
            <input
              type="text"
              className="input"
              placeholder="Search farmers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="farmers-grid">
              {filteredFarmers.length > 0 ? (
                filteredFarmers.map(farmer => (
                  <div key={farmer._id} className="farmer-card">
                    <div className="farmer-avatar">
                      <FaUser />
                    </div>
                    <div className="farmer-info">
                      <h3>{farmer.name}</h3>
                      <div className="info-item">
                        <FaEnvelope />
                        <span>{farmer.email}</span>
                      </div>
                      {farmer.phoneNumber && (
                        <div className="info-item">
                          <FaPhone />
                          <span>{farmer.phoneNumber}</span>
                        </div>
                      )}
                      {farmer.address && (
                        <div className="info-item">
                          <FaMapMarkerAlt />
                          <span>{farmer.address}</span>
                        </div>
                      )}
                      <div className="farmer-meta">
                        <span>Joined {new Date(farmer.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Link to={`/admin/farmers/${farmer._id}`} className="btn btn-primary">
                      <FaEye /> View Details
                    </Link>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <FaUser className="empty-icon" />
                  <h3>No farmers found</h3>
                  <p>No farmers match your search criteria</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FarmersList;
