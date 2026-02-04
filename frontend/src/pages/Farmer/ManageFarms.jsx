import { useState, useEffect } from 'react';
import { FaTractor, FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaRuler } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Navbar from '../../components/Navbar';
import './ManageFarms.css';

const ManageFarms = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  const [formData, setFormData] = useState({
    farmName: '',
    location: '',
    area: '',
    areaUnit: 'acres',
    cropType: 'tomato',
    description: ''
  });

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      const response = await api.get('/farms');
      setFarms(response.data.farms || []);
    } catch (error) {
      console.error('Error fetching farms:', error);
      toast.error('Failed to load farms');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingFarm) {
        await api.put(`/farms/${editingFarm._id}`, formData);
        toast.success('Farm updated successfully!');
      } else {
        await api.post('/farms', formData);
        toast.success('Farm added successfully!');
      }

      setShowForm(false);
      setEditingFarm(null);
      setFormData({
        name: '',
        location: '',
        area: '',
        cropType: 'tomato',
        notes: ''
      });
      fetchFarms();
    } catch (error) {
      console.error('Error saving farm:', error);
      toast.error(error.response?.data?.message || 'Failed to save farm');
    }
  };

  const handleEdit = (farm) => {
    setEditingFarm(farm);
    setFormData({
      farmName: farm.farmName,
      location: farm.location,
      area: farm.area.toString(),
      areaUnit: farm.areaUnit || 'acres',
      cropType: farm.cropType || 'tomato',
      description: farm.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (farmId) => {
    if (!window.confirm('Are you sure you want to delete this farm?')) {
      return;
    }

    try {
      await api.delete(`/farms/${farmId}`);
      toast.success('Farm deleted successfully!');
      fetchFarms();
    } catch (error) {
      console.error('Error deleting farm:', error);
      toast.error('Failed to delete farm');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingFarm(null);
    setFormData({
      farmName: '',
      location: '',
      area: '',
      areaUnit: 'acres',
      cropType: 'tomato',
      description: ''
    });
  };

  return (
    <>
      <Navbar />
      <div className="manage-farms-container">
        <div className="container">
          <div className="farms-header">
            <div>
              <h1>Manage Farms</h1>
              <p>Add and manage your farm information</p>
            </div>
            {!showForm && (
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                <FaPlus /> Add New Farm
              </button>
            )}
          </div>

          {showForm && (
            <div className="farm-form-card">
              <h2>{editingFarm ? 'Edit Farm' : 'Add New Farm'}</h2>
              <form onSubmit={handleSubmit} className="farm-form">
                <div className="form-row">
                  <div className="input-group">
                    <label className="input-label">
                      <FaTractor /> Farm Name
                    </label>
                    <input
                      type="text"
                      name="farmName"
                      className="input"
                      placeholder="e.g., Green Valley Farm"
                      value={formData.farmName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">
                      <FaMapMarkerAlt /> Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      className="input"
                      placeholder="e.g., Pune, Maharashtra"
                      value={formData.location}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label className="input-label">
                      <FaRuler /> Area (acres)
                    </label>
                    <input
                      type="number"
                      name="area"
                      className="input"
                      placeholder="e.g., 10"
                      value={formData.area}
                      onChange={handleChange}
                      min="0"
                      step="0.1"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">
                      <FaTractor /> Crop Type
                    </label>
                    <select
                      name="cropType"
                      className="select"
                      value={formData.cropType}
                      onChange={handleChange}
                      required
                    >
                      <option value="tomato">Tomato</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Description (Optional)</label>
                  <textarea
                    name="description"
                    className="textarea"
                    placeholder="Additional information about your farm..."
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                  ></textarea>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingFarm ? 'Update Farm' : 'Add Farm'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
              <div className="spinner"></div>
            </div>
          ) : farms.length > 0 ? (
            <div className="farms-grid">
              {farms.map((farm) => (
                <div key={farm._id} className="farm-card">
                  <div className="farm-header">
                    <div className="farm-icon">
                      <FaTractor />
                    </div>
                    <h3>{farm.farmName}</h3>
                  </div>
                  <div className="farm-details">
                    <div className="farm-detail">
                      <FaMapMarkerAlt className="detail-icon" />
                      <span>{farm.location}</span>
                    </div>
                    <div className="farm-detail">
                      <FaRuler className="detail-icon" />
                      <span>{farm.area} {farm.areaUnit || 'acres'}</span>
                    </div>
                    <div className="farm-detail">
                      <FaTractor className="detail-icon" />
                      <span className="capitalize">{farm.cropType}</span>
                    </div>
                  </div>
                  {farm.description && (
                    <p className="farm-notes">{farm.description}</p>
                  )}
                  <div className="farm-actions">
                    <button className="btn-icon btn-edit" onClick={() => handleEdit(farm)}>
                      <FaEdit /> Edit
                    </button>
                    <button className="btn-icon btn-delete" onClick={() => handleDelete(farm._id)}>
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !showForm && (
              <div className="empty-state">
                <FaTractor className="empty-icon" />
                <h3>No farms yet</h3>
                <p>Click "Add New Farm" to get started</p>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default ManageFarms;
