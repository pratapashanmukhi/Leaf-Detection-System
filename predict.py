import os
import re
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image

# Suppress TensorFlow logging to keep output clean
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2' 

def get_disease_info():
    """Returns a dictionary containing descriptions and treatments for each class."""
    return {
        "Tomato_Bacterial_spot": {
            "description": "Bacterial disease causing dark, water-soaked spots on leaves and fruit.",
            "treatment": "Apply copper-based bactericides and ensure proper air circulation."
        },
        "Tomato_Early_blight": {
            "description": "Fungal disease causing dark concentric spots on leaves, starting from the bottom.",
            "treatment": "Apply fungicide spray and remove affected lower leaves."
        },
        "Tomato_Late_blight": {
            "description": "Destructive fungal disease causing large, dark, water-soaked lesions.",
            "treatment": "Apply protective fungicides immediately. Remove severely infected plants."
        },
        "Tomato_Leaf_Mold": {
            "description": "Fungal disease appearing as pale greenish-yellow spots and fuzzy mold.",
            "treatment": "Improve ventilation, reduce humidity, and apply appropriate fungicides."
        },
        "Tomato_Septoria_leaf_spot": {
            "description": "Fungal disease causing numerous small, circular spots with dark borders.",
            "treatment": "Use fungicidal sprays and avoid overhead watering."
        },
        "Tomato_Spider_mites_Two_spotted_spider_mite": {
            "description": "Tiny pests that suck plant sap, causing yellow stippling on leaves.",
            "treatment": "Use insecticidal soap, neem oil, or introduce predatory mites."
        },
        "Tomato__Target_Spot": {
            "description": "Fungal infection causing brown spots with target-like concentric rings.",
            "treatment": "Apply fungicides and ensure adequate spacing between plants."
        },
        "Tomato__Tomato_YellowLeaf__Curl_Virus": {
            "description": "Viral disease transmitted by whiteflies leading to upward curling and yellowing of leaves.",
            "treatment": "Control whitefly population and plant virus-resistant varieties."
        },
        "Tomato__Tomato_mosaic_virus": {
            "description": "Viral disease causing mottled, mosaic-like patterns on leaves.",
            "treatment": "Remove and destroy infected plants. Disinfect gardening tools."
        },
        "Tomato_healthy": {
            "description": "The plant is healthy with no visible signs of disease.",
            "treatment": "Continue regular care, watering, and monitoring."
        }
    }

def main():
    print("Loading model...")
    # 1. Load trained model
    try:
        model = tf.keras.models.load_model("leaf_model.h5")
        print("Model loaded successfully!\n")
    except Exception as e:
        print(f"Error loading model: {e}")
        return

    # 2. Class names sorted alphabetically matching the ImageDataGenerator directories
    classes = [
        "Tomato_Bacterial_spot",
        "Tomato_Early_blight",
        "Tomato_Late_blight",
        "Tomato_Leaf_Mold",
        "Tomato_Septoria_leaf_spot",
        "Tomato_Spider_mites_Two_spotted_spider_mite",
        "Tomato__Target_Spot",
        "Tomato__Tomato_YellowLeaf__Curl_Virus",
        "Tomato__Tomato_mosaic_virus",
        "Tomato_healthy"
    ]

    disease_dict = get_disease_info()
    folder = "test images"

    if not os.path.exists(folder):
        print(f"Error: The folder '{folder}' does not exist.")
        return

    # Keep multiple image prediction support
    valid_extensions = ('.jpg', '.jpeg', '.png', '.bmp')
    image_files = [f for f in os.listdir(folder) if f.lower().endswith(valid_extensions)]

    if not image_files:
        print(f"No images found in '{folder}'. Please add some images to test.")
        return

    for img_name in image_files:
        img_path = os.path.join(folder, img_name)

        try:
            # Prepare image
            img = image.load_img(img_path, target_size=(128, 128))
            img_array = image.img_to_array(img)
            img_array = np.expand_dims(img_array, axis=0) / 255.0

            # Predict
            prediction = model.predict(img_array, verbose=0)
            class_idx = np.argmax(prediction[0])
            confidence = np.max(prediction[0]) * 100
            
            raw_disease = classes[class_idx]
            
            # Clean disease name (Remove "Tomato_", "Tomato", underscores, and extra spaces)
            clean_name = raw_disease.replace("Tomato_", "").replace("Tomato", "").replace("_", " ")
            clean_name = re.sub(' +', ' ', clean_name).strip()
            if clean_name.lower() == "healthy":
                clean_name = "Healthy"
            
            # Use dictionary for description and treatment, with fallback
            info = disease_dict.get(raw_disease, {
                "description": "Unknown disease. Please consult an expert.",
                "treatment": "Isolate the plant to prevent potential spread."
            })

            # Print formatted output
            print(f"Image: {img_name}")
            print(f"Detected Crop: Tomato")
            print(f"Predicted Disease: {clean_name}")
            print(f"Confidence: {confidence:.2f}%")
            print(f"Description: {info['description']}")
            print(f"Recommended Treatment: {info['treatment']}")
            print("----------------------------")

        except Exception as e:
            print(f"Error processing image {img_name}: {e}")
            print("----------------------------")

if __name__ == "__main__":
    main()