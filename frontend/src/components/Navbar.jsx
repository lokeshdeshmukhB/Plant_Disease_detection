import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaLeaf, FaUser, FaSignOutAlt, FaHome, FaTractor, FaChartLine, FaUsers } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isFarmer, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            <FaLeaf className="brand-icon" />
            <span>PlantDI</span>
          </Link>

          {user && (
            <div className="navbar-menu">
              <Link to="/" className="nav-link">
                <FaHome /> Home
              </Link>

              {isFarmer && (
                <>
                  <Link to="/farmer/farms" className="nav-link">
                    <FaTractor /> My Farms
                  </Link>
                  <Link to="/farmer/detect" className="nav-link">
                    <FaChartLine /> Disease Detection
                  </Link>
                </>
              )}

              {isAdmin && (
                <>
                  <Link to="/admin/farmers" className="nav-link">
                    <FaUsers /> Farmers
                  </Link>
                  <Link to="/admin/stats" className="nav-link">
                    <FaChartLine /> Statistics
                  </Link>
                </>
              )}

              <div className="navbar-user">
                <div className="user-info">
                  <FaUser />
                  <span>{user.name}</span>
                  <span className="user-role">{user.role}</span>
                </div>
                <button onClick={handleLogout} className="btn-logout">
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
