import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaImage, FaTimes, FaChartLine } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Navbar from '../../components/Navbar';
import './DiseaseDetection.css';

const DiseaseDetection = () => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      const response = await api.get('/farms');
      setFarms(response.data.farms || []);
    } catch (error) {
      console.error('Error fetching farms:', error);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + selectedImages.length > 10) {
      toast.warning('Maximum 10 images allowed');
      return;
    }

    setSelectedImages([...selectedImages, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedImages.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      selectedImages.forEach(image => {
        formData.append('images', image);
      });
      formData.append('farmId', selectedFarm);
      formData.append('notes', notes);

      const response = await api.post('/predictions/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setPrediction(response.data.prediction);
      toast.success('Prediction completed successfully!');
    } catch (error) {
      console.error('Error during prediction:', error);
      toast.error(error.response?.data?.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedImages([]);
    setPreviews([]);
    setSelectedFarm('');
    setNotes('');
    setPrediction(null);
  };

  return (
    <>
      <Navbar />
      <div className="detection-container">
        <div className="container">
          <div className="detection-header">
            <h1>Plant Disease Detection</h1>
            <p>Upload tomato plant images for AI-powered disease analysis</p>
          </div>

          {!prediction ? (
            <div className="detection-form-wrapper">
              <form onSubmit={handleSubmit} className="detection-form">
                <div className="upload-section">
                  <label className="upload-area">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      style={{ display: 'none' }}
                    />
                    <FaUpload className="upload-icon" />
                    <h3>Click to upload images</h3>
                    <p>or drag and drop</p>
                    <span className="upload-hint">PNG, JPG, WEBP (max 10 images)</span>
                  </label>

                  {previews.length > 0 && (
                    <div className="preview-grid">
                      {previews.map((preview, index) => (
                        <div key={index} className="preview-item">
                          <img src={preview} alt={`Preview ${index + 1}`} />
                          <button
                            type="button"
                            className="remove-btn"
                            onClick={() => removeImage(index)}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-fields">
                  <div className="input-group">
                    <label className="input-label">Select Farm (Optional)</label>
                    <select
                      className="select"
                      value={selectedFarm}
                      onChange={(e) => setSelectedFarm(e.target.value)}
                    >
                      <option value="">No farm selected</option>
                      {farms.map(farm => (
                        <option key={farm._id} value={farm._id}>
                          {farm.farmName} - {farm.location}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Notes (Optional)</label>
                    <textarea
                      className="input"
                      rows="3"
                      placeholder="Add any notes about these plants..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || selectedImages.length === 0}
                  >
                    {loading ? (
                      <>
                        <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <FaChartLine /> Analyze Images
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="results-section">
              <div className="results-header">
                <h2>Prediction Results</h2>
                <div className="results-summary">
                  <div className="summary-item">
                    <span className="summary-label">Images Analyzed:</span>
                    <span className="summary-value">{prediction.images.length}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Overall Status:</span>
                    <span className={`badge badge-${prediction.overallStatus === 'healthy' ? 'success' : 'warning'}`}>
                      {prediction.overallStatus}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Healthy:</span>
                    <span className="summary-value">{prediction.healthyCount}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Diseased:</span>
                    <span className="summary-value">{prediction.diseasedCount}</span>
                  </div>
                </div>
              </div>

              <div className="results-grid">
                {prediction.predictions.map((pred, index) => (
                  <div key={index} className="result-card">
                    <div className="result-image">
                      <img src={previews[index]} alt={`Result ${index + 1}`} />
                    </div>
                    <div className="result-details">
                      <h4>Image {index + 1}</h4>
                      <div className="result-prediction">
                        <span className="prediction-label">Prediction:</span>
                        <span className={`prediction-class ${pred.predictedClass.includes('healthy') ? 'healthy' : 'diseased'}`}>
                          {pred.predictedClass.replace('Tomato___', '').replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="result-confidence">
                        <span className="confidence-label">Confidence:</span>
                        <div className="confidence-bar">
                          <div
                            className="confidence-fill"
                            style={{ width: `${pred.confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="confidence-value">{(pred.confidence * 100).toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="results-actions">
                <button onClick={resetForm} className="btn btn-primary">
                  <FaImage /> New Prediction
                </button>
                <button onClick={() => navigate('/farmer/history')} className="btn btn-outline">
                  View History
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DiseaseDetection;
