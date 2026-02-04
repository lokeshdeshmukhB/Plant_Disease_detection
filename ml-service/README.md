# Plant Disease Prediction ML Service

This directory contains the Python Flask service for loading and serving predictions from the trained plant disease detection model.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Place your trained model file:
   - Put your `.pkl` model file in the `model/` directory
   - Rename it to `plant_disease_model.pkl`
   - Or update the `MODEL_PATH` in `app.py`

3. Run the service:
```bash
python app.py
```

The service will run on `http://localhost:5001`

## Model Requirements

The model should:
- Accept input images of size 224x224x3 (RGB)
- Output predictions for 10 classes (tomato diseases)
- Be saved as a pickle file (.pkl)

## API Endpoints

### GET /
Health check and service info

### GET /health
Service health status

### POST /predict
Predict disease for multiple images

Request body:
```json
{
  "images": [
    {
      "filename": "image1.jpg",
      "path": "/path/to/image1.jpg"
    }
  ]
}
```

### GET /classes
Get list of disease classes

## Disease Classes

1. Tomato___Bacterial_spot
2. Tomato___Early_blight
3. Tomato___Late_blight
4. Tomato___Leaf_Mold
5. Tomato___Septoria_leaf_spot
6. Tomato___Spider_mites Two-spotted_spider_mite
7. Tomato___Target_Spot
8. Tomato___Tomato_Yellow_Leaf_Curl_Virus
9. Tomato___Tomato_mosaic_virus
10. Tomato___healthy
