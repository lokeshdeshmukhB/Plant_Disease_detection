from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import numpy as np
from PIL import Image
import pickle
import traceback

app = Flask(__name__)
CORS(app)

# Disease classes
DISEASE_CLASSES = [
    'Tomato___Bacterial_spot',
    'Tomato___Early_blight',
    'Tomato___Late_blight',
    'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot',
    'Tomato___Spider_mites Two-spotted_spider_mite',
    'Tomato___Target_Spot',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
    'Tomato___Tomato_mosaic_virus',
    'Tomato___healthy'
]

# Global variable to store the model
model = None
MODEL_PATH = 'model/plant_disease_model.pkl'

def load_model():
    """Load the trained model from pickle file"""
    global model
    try:
        if os.path.exists(MODEL_PATH):
            with open(MODEL_PATH, 'rb') as f:
                model = pickle.load(f)
            print(f"Model loaded successfully from {MODEL_PATH}")
            return True
        else:
            print(f"Model file not found at {MODEL_PATH}")
            print("Please place your trained model file at this location")
            return False
    except Exception as e:
        print(f"Error loading model: {str(e)}")
        traceback.print_exc()
        return False

def preprocess_image(image_path, target_size=(224, 224)):
    """Preprocess image for prediction"""
    try:
        # Load and resize image
        img = Image.open(image_path)
        img = img.convert('RGB')
        img = img.resize(target_size)
        
        # Convert to array and normalize
        img_array = np.array(img)
        img_array = img_array / 255.0  # Normalize to [0, 1]
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    except Exception as e:
        print(f"Error preprocessing image: {str(e)}")
        raise

def predict_image(image_path):
    """Make prediction for a single image"""
    try:
        # Preprocess image
        img_array = preprocess_image(image_path)
        
        # Make prediction
        if model is not None:
            predictions = model.predict(img_array)
            predicted_class_idx = np.argmax(predictions[0])
            confidence = float(predictions[0][predicted_class_idx])
            
            # Get all predictions with confidence scores
            all_predictions = [
                {
                    'class': DISEASE_CLASSES[i],
                    'confidence': float(predictions[0][i])
                }
                for i in range(len(DISEASE_CLASSES))
            ]
            
            # Sort by confidence
            all_predictions.sort(key=lambda x: x['confidence'], reverse=True)
            
            return {
                'predictedClass': DISEASE_CLASSES[predicted_class_idx],
                'confidence': confidence,
                'allPredictions': all_predictions[:5]  # Top 5 predictions
            }
        else:
            # Return dummy prediction if model is not loaded
            return {
                'predictedClass': 'MODEL_NOT_LOADED',
                'confidence': 0.0,
                'allPredictions': []
            }
    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        raise

@app.route('/', methods=['GET'])
def home():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'message': 'Plant Disease Prediction ML Service',
        'version': '1.0.0',
        'modelLoaded': model is not None,
        'classes': DISEASE_CLASSES
    })

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'status': 'healthy',
        'modelLoaded': model is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Predict disease for multiple images"""
    try:
        data = request.get_json()
        
        if not data or 'images' not in data:
            return jsonify({
                'success': False,
                'message': 'No images provided'
            }), 400
        
        images = data['images']
        predictions = []
        
        for idx, image_info in enumerate(images):
            image_path = image_info.get('path')
            
            if not image_path or not os.path.exists(image_path):
                predictions.append({
                    'imageIndex': idx,
                    'predictedClass': 'IMAGE_NOT_FOUND',
                    'confidence': 0.0,
                    'allPredictions': []
                })
                continue
            
            try:
                prediction = predict_image(image_path)
                predictions.append({
                    'imageIndex': idx,
                    **prediction
                })
            except Exception as e:
                print(f"Error predicting image {idx}: {str(e)}")
                predictions.append({
                    'imageIndex': idx,
                    'predictedClass': 'PREDICTION_ERROR',
                    'confidence': 0.0,
                    'allPredictions': [],
                    'error': str(e)
                })
        
        return jsonify({
            'success': True,
            'predictions': predictions
        })
    
    except Exception as e:
        print(f"Error in predict endpoint: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': 'Error during prediction',
            'error': str(e)
        }), 500

@app.route('/classes', methods=['GET'])
def get_classes():
    """Get list of disease classes"""
    return jsonify({
        'success': True,
        'classes': DISEASE_CLASSES,
        'count': len(DISEASE_CLASSES)
    })

if __name__ == '__main__':
    print("Starting Plant Disease Prediction ML Service...")
    print(f"Looking for model at: {os.path.abspath(MODEL_PATH)}")
    
    # Try to load the model
    load_model()
    
    if model is None:
        print("\n" + "="*60)
        print("WARNING: Model not loaded!")
        print("Please place your trained .pkl model file at:")
        print(f"  {os.path.abspath(MODEL_PATH)}")
        print("The service will start but predictions will not work")
        print("until the model is loaded.")
        print("="*60 + "\n")
    
    # Start Flask server
    app.run(host='0.0.0.0', port=5001, debug=True)
