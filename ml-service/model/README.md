# Model Directory

Place your trained plant disease detection model here.

## Instructions

1. Train your model on Google Colab
2. Save the model as a pickle file (.pkl)
3. Download the model file
4. Place it in this directory with the name: `plant_disease_model.pkl`

The model should:
- Accept input shape: (None, 224, 224, 3)
- Output 10 classes for tomato diseases
- Be compatible with TensorFlow/Keras or scikit-learn

## Example

```
ml-service/
  model/
    plant_disease_model.pkl  <- Your model file goes here
```
