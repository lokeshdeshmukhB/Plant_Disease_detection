import mongoose from 'mongoose';

const farmSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmName: {
    type: String,
    required: [true, 'Please provide a farm name'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Please provide farm location'],
    trim: true
  },
  area: {
    type: Number,
    required: [true, 'Please provide farm area'],
    min: 0
  },
  areaUnit: {
    type: String,
    enum: ['acres', 'hectares', 'square meters'],
    default: 'acres'
  },
  cropType: {
    type: String,
    default: 'Tomato',
    trim: true
  },
  soilType: {
    type: String,
    trim: true
  },
  irrigationType: {
    type: String,
    enum: ['drip', 'sprinkler', 'flood', 'manual', 'other'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const Farm = mongoose.model('Farm', farmSchema);

export default Farm;
