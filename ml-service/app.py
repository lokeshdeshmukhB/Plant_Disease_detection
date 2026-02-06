from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import numpy as np
from PIL import Image
import torch
import torch.nn as nn
from torchvision import transforms
import traceback

app = Flask(__name__)
CORS(app)

# All classes (for model prediction - same order as model was trained)
ALL_CLASSES = [
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

# Disease classes (only actual diseases - excluding healthy)
DISEASE_CLASSES = [
    'Tomato___Bacterial_spot',
    'Tomato___Early_blight',
    'Tomato___Late_blight',
    'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot',
    'Tomato___Spider_mites Two-spotted_spider_mite',
    'Tomato___Target_Spot',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
    'Tomato___Tomato_mosaic_virus'
]

# Healthy classes
HEALTHY_CLASSES = [
    'Tomato___healthy'
]

# Global variable to store the model
model = None
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
# Load directly from the zip file - PyTorch can handle zip files natively
MODEL_PATH = 'E:\\mernstack\\plantdi\\ml-service\\checkpoint_epoch_16.pth'

def create_model(num_classes=10):
    """Create a ResNet50 model for plant disease classification matching the checkpoint"""
    from torchvision import models
    
    # Load ResNet50 (matching checkpoint architecture)
    model = models.resnet50(pretrained=False)
    
    # Modify the final layer (fc) to match checkpoint structure:
    # fc.1.weight (512, 2048) -> Linear(2048, 512)
    # fc.4.weight (10, 512)   -> Linear(512, 10)
    # Implies: 0:?, 1:Linear, 2:?, 3:?, 4:Linear
    
    num_features = model.fc.in_features # Should be 2048 for ResNet50
    
    model.fc = nn.Sequential(
        nn.Dropout(0.25),         # 0 (Guessing dropout)
        nn.Linear(num_features, 512), # 1
        nn.ReLU(),                # 2
        nn.Dropout(0.25),         # 3 (Guessing dropout)
        nn.Linear(512, num_classes)   # 4
    )
    
    return model

def load_model():
    """Load the trained PyTorch model from checkpoint"""
    global model
    try:
        if os.path.exists(MODEL_PATH):
            print(f"Loading model from {MODEL_PATH}")
            
            # Load PyTorch checkpoint
            if device.type == 'cpu':
                checkpoint = torch.load(MODEL_PATH, map_location=torch.device('cpu'), weights_only=False)
            else:
                checkpoint = torch.load(MODEL_PATH, map_location=device, weights_only=False)
            
            print(f"Checkpoint type: {type(checkpoint)}")
            
            state_dict = None
            
            # Handle different checkpoint formats
            if isinstance(checkpoint, dict):
                if 'state_dict' in checkpoint:
                    state_dict = checkpoint['state_dict']
                elif 'model_state_dict' in checkpoint:
                    state_dict = checkpoint['model_state_dict']
                elif 'model' in checkpoint:
                    if isinstance(checkpoint['model'], dict):
                        state_dict = checkpoint['model']
                    else:
                        model = checkpoint['model']
                else:
                    # Assume dict is state_dict
                    state_dict = checkpoint
            else:
                model = checkpoint
            
            # If we found a state_dict, we need to inspect it and create the model
            if state_dict is not None:
                print("Found state_dict")
                
                # Fix keys: remove 'resnet.' prefix if present
                new_state_dict = {}
                for k, v in state_dict.items():
                    if k.startswith('resnet.'):
                        new_state_dict[k[7:]] = v
                    else:
                        new_state_dict[k] = v
                state_dict = new_state_dict
                
                # Detect number of classes from the final layer (fc.4.weight or fc.4.bias)
                # Check for fc.4.weight (final layer in our custom Sequential)
                fc_final_key = 'fc.4.weight'
                if fc_final_key in state_dict:
                    detected_classes = state_dict[fc_final_key].shape[0]
                    print(f"Detected {detected_classes} output classes in checkpoint (fc.4)")
                    num_classes = detected_classes
                
                # Check for standard fc.weight if custom structure not found
                elif 'fc.weight' in state_dict:
                    detected_classes = state_dict['fc.weight'].shape[0]
                    print(f"Detected {detected_classes} output classes in checkpoint (standard fc)")
                    num_classes = detected_classes

                print(f"Creating ResNet50 model with {num_classes} classes...")
                model = create_model(num_classes=num_classes)
                
                # specific strict=False to handle potential missing keys or extra keys
                keys = model.load_state_dict(state_dict, strict=False)
                print(f"Model keys loaded (missing: {len(keys.missing_keys)}, unexpected: {len(keys.unexpected_keys)})")
                
                if len(keys.missing_keys) > 0:
                    print(f"WARNING: Missing keys: {keys.missing_keys[:5]}...")
                if len(keys.unexpected_keys) > 0:
                    print(f"WARNING: Unexpected keys: {keys.unexpected_keys[:5]}...")
            
            # Verify model has eval method
            if not hasattr(model, 'eval'):
                print(f"ERROR: Loaded object doesn't have eval() method. Type: {type(model)}")
                return False
            
            # Set model to evaluation mode
            model.eval()
            model.to(device)
            
            print(f"✓ Model loaded successfully from {MODEL_PATH}")
            if hasattr(model, 'fc'):
                # Handle Sequential head (ResNet50) or Linear head (ResNet18)
                if isinstance(model.fc, nn.Sequential):
                    out_features = model.fc[-1].out_features
                    print(f"✓ Model info: ResNet50 with {out_features} output classes")
                else:
                    print(f"✓ Model info: ResNet18 with {model.fc.out_features} output classes")
            
            return True
        else:
            print(f"Model file not found at {MODEL_PATH}")
            print("Please place your trained model at this location")
            return False
    except Exception as e:
        print(f"Error loading model: {str(e)}")
        traceback.print_exc()
        return False

def preprocess_image(image_path, target_size=(224, 224)):
    """Preprocess image for prediction using PyTorch"""
    try:
        # Load image
        img = Image.open(image_path)
        img = img.convert('RGB')
        
        # Define transforms
        transform = transforms.Compose([
            transforms.Resize(target_size),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        
        # Apply transforms and add batch dimension
        img_tensor = transform(img).unsqueeze(0)
        
        return img_tensor
    except Exception as e:
        print(f"Error preprocessing image: {str(e)}")
        raise

def is_healthy_class(class_name):
    """Check if a class represents a healthy plant"""
    return class_name in HEALTHY_CLASSES

def get_disease_info(class_name):
    """Extract disease information from class name"""
    if is_healthy_class(class_name):
        return {
            'plant': 'Tomato',
            'condition': 'Healthy',
            'diseaseType': None,
            'isHealthy': True
        }
    
    # Parse disease class name (format: Plant___Disease_name)
    parts = class_name.split('___')
    if len(parts) == 2:
        plant = parts[0]
        disease = parts[1].replace('_', ' ')
        
        return {
            'plant': plant,
            'condition': disease,
            'diseaseType': 'Disease',
            'isHealthy': False
        }
    
    return {
        'plant': 'Unknown',
        'condition': class_name,
        'diseaseType': 'Disease',
        'isHealthy': False
    }

def predict_image(image_path):
    """Make prediction for a single image using PyTorch"""
    try:
        # Preprocess image
        img_tensor = preprocess_image(image_path)
        
        # Make prediction
        if model is not None:
            with torch.no_grad():
                img_tensor = img_tensor.to(device)
                outputs = model(img_tensor)
                
                # Apply softmax to get probabilities
                probabilities = torch.nn.functional.softmax(outputs, dim=1)
                predictions = probabilities.cpu().numpy()[0]
            
            predicted_class_idx = np.argmax(predictions)
            confidence = float(predictions[predicted_class_idx])
            predicted_class = ALL_CLASSES[predicted_class_idx]
            
            # Get disease information
            disease_info = get_disease_info(predicted_class)
            
            # Get all predictions with confidence scores and categorization
            all_predictions = [
                {
                    'class': ALL_CLASSES[i],
                    'confidence': float(predictions[i]),
                    'isHealthy': is_healthy_class(ALL_CLASSES[i]),
                    'diseaseInfo': get_disease_info(ALL_CLASSES[i])
                }
                for i in range(len(ALL_CLASSES))
            ]
            
            # Sort by confidence
            all_predictions.sort(key=lambda x: x['confidence'], reverse=True)
            
            # Separate diseases from healthy predictions
            disease_predictions = [p for p in all_predictions if not p['isHealthy']]
            healthy_predictions = [p for p in all_predictions if p['isHealthy']]
            
            return {
                'predictedClass': predicted_class,
                'confidence': confidence,
                'isHealthy': disease_info['isHealthy'],
                'diseaseInfo': disease_info,
                'allPredictions': all_predictions[:5],  # Top 5 predictions
                'diseasePredictions': disease_predictions[:5],  # Top 5 disease predictions
                'healthyPredictions': healthy_predictions  # All healthy predictions
            }
        else:
            # Return dummy prediction if model is not loaded
            return {
                'predictedClass': 'MODEL_NOT_LOADED',
                'confidence': 0.0,
                'isHealthy': False,
                'diseaseInfo': None,
                'allPredictions': [],
                'diseasePredictions': [],
                'healthyPredictions': []
            }
    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        traceback.print_exc()
        raise

@app.route('/', methods=['GET'])
def home():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'message': 'Plant Disease Prediction ML Service',
        'version': '1.0.0',
        'modelLoaded': model is not None,
        'allClasses': ALL_CLASSES,
        'diseaseClasses': DISEASE_CLASSES,
        'healthyClasses': HEALTHY_CLASSES
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
        'allClasses': ALL_CLASSES,
        'diseaseClasses': DISEASE_CLASSES,
        'healthyClasses': HEALTHY_CLASSES,
        'totalCount': len(ALL_CLASSES),
        'diseaseCount': len(DISEASE_CLASSES),
        'healthyCount': len(HEALTHY_CLASSES)
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
