import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm'
  },
  images: [{
    filename: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  predictions: [{
    imageIndex: Number,
    predictedClass: String,
    confidence: Number,
    allPredictions: [{
      class: String,
      confidence: Number
    }]
  }],
  overallStatus: {
    type: String,
    enum: ['healthy', 'diseased', 'mixed'],
    default: 'mixed'
  },
  healthyCount: {
    type: Number,
    default: 0
  },
  diseasedCount: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Calculate overall status before saving
predictionSchema.pre('save', function(next) {
  if (this.predictions && this.predictions.length > 0) {
    this.healthyCount = this.predictions.filter(p => 
      p.predictedClass.toLowerCase().includes('healthy')
    ).length;
    this.diseasedCount = this.predictions.length - this.healthyCount;
    
    if (this.healthyCount === this.predictions.length) {
      this.overallStatus = 'healthy';
    } else if (this.diseasedCount === this.predictions.length) {
      this.overallStatus = 'diseased';
    } else {
      this.overallStatus = 'mixed';
    }
  }
  next();
});

const Prediction = mongoose.model('Prediction', predictionSchema);

export default Prediction;
