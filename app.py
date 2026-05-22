import os
import re
import io
import sqlite3
import numpy as np
import tensorflow as tf
import streamlit as st
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from tensorflow.keras.preprocessing.image import img_to_array
from werkzeug.security import generate_password_hash, check_password_hash

# Suppress TF Logging
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

app = Flask(__name__)
CORS(app) # Enable CORS for React frontend

# --- Initialize SQLite Database for Users ---
def init_db():
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# --- AUTHENTICATION ROUTES ---
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    
    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400
        
    hashed_pw = generate_password_hash(password)
    
    conn = None
    try:
        conn = sqlite3.connect('users.db', timeout=10)
        c = conn.cursor()
        c.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", (name, email, hashed_pw))
        conn.commit()
        return jsonify({"message": "User created successfully!"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "An account with this email already exists."}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
        
    conn = None
    try:
        conn = sqlite3.connect('users.db', timeout=10)
        c = conn.cursor()
        c.execute("SELECT * FROM users WHERE email=?", (email,))
        user = c.fetchone()
        
        if user and check_password_hash(user[3], password):
            return jsonify({
                "message": "Login successful!",
                "user": {
                    "id": user[0],
                    "name": user[1],
                    "email": user[2]
                }
            }), 200
        else:
            return jsonify({"error": "Invalid email or password"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

# Load the trained model safely
try:
    print("Loading model...")
    model = tf.keras.models.load_model("leaf_model.h5")
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Class names exactly as they appear in the original sorted dataset folders
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

disease_dict = get_disease_info()

def preprocess_image(image_bytes):
    """Loads image from bytes, resizes to 128x128, and normalizes it."""
    # Open image using PIL
    img = Image.open(io.BytesIO(image_bytes))
    
    # Ensure image has RGB channels
    if img.mode != 'RGB':
        img = img.convert('RGB')
        
    # Resize to match model input
    img = img.resize((128, 128))
    
    # Convert to numpy array and normalize
    img_array = img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0) / 255.0
    
    return img_array

@app.route('/predict', methods=['POST'])
def predict():
    # 1. Check if model is loaded
    if model is None:
        return jsonify({"error": "Model not loaded on the server."}), 500
        
    # 2. Extract image from request
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    try:
        # 3. Preprocess the image safely
        img_bytes = file.read()
        processed_image = preprocess_image(img_bytes)
        
        # --- HEURISTIC CHECK FOR NON-LEAF IMAGES ---
        # Reject the image instantly if it doesn't contain at least 4% distinctly green pixels
        try:
            r = processed_image[0, :, :, 0]
            g = processed_image[0, :, :, 1]
            b = processed_image[0, :, :, 2]
            
            # 1. Reject images that are excessively dark (e.g. covered camera or pure black)
            if np.mean(processed_image) < 0.15:
                return jsonify({
                    "crop": "Unknown",
                    "disease": "Image Too Dark",
                    "confidence": 0.0,
                    "description": "The image is too dark or black to analyze safely. Please use good lighting.",
                    "treatment": "Ensure the leaf is well lit and not in deep shadow."
                }), 200
                
            # 2. Reject solid colors or blank images (very low variance)
            if np.std(processed_image) < 0.04:
                return jsonify({
                    "crop": "Unknown",
                    "disease": "Blank Image",
                    "confidence": 0.0,
                    "description": "This appears to be a blank or solid-color image.",
                    "treatment": "Please upload a clear, focused photo of a leaf."
                }), 200

            # 3. Reject synthetic green objects (Plastic, Toys, Smooth Surfaces)
            # Compute Edge Density (Texture). Biological leaves have veins and lighting variance. 
            diff_x = np.abs(np.diff(processed_image[0], axis=1))
            diff_y = np.abs(np.diff(processed_image[0], axis=0))
            edge_density = np.mean(diff_x) + np.mean(diff_y)
            
            if edge_density < 0.015:
                return jsonify({
                    "crop": "Unknown",
                    "disease": "Not a Leaf",
                    "confidence": 0.0,
                    "description": "This appears to be a smooth or synthetic object. Leaves have physical texture and veins.",
                    "treatment": "Please provide a real biological leaf."
                }), 200

            # 4. Chlorophyll Biological Check
            # Prevent white/grey walls and cyan/teal clothing from mimicking leaves.
            # We use a normalized Green Ratio to ensure it works accurately in both bright and dark shadows.
            g_ratio = g / (r + g + b + 0.0001)
            # - g > r + 0.02: Green is visually dominant over Red.
            # - r > b - 0.05: Blocks Teal/Cyan shirts where Blue massively dominates Red.
            # - g_ratio > 0.38: Pixel light must be > 38% pure green. (Grey walls are mathematically 33.3%)
            is_chlorophyll = (g > r + 0.02) & (r > b - 0.05) & (g_ratio > 0.38)
            leaf_pixels = np.sum(is_chlorophyll)
            leaf_ratio = leaf_pixels / (128 * 128)
            
            # Require at least 1.5% of the image to be confident biological chlorophyll
            if leaf_ratio < 0.015:
                return jsonify({
                    "crop": "Unknown",
                    "disease": "Not a Leaf",
                    "confidence": 0.0,
                    "description": "I cannot detect enough green foliage in this image! Please ensure the leaf is clearly visible, well-lit, and fills the camera.",
                    "treatment": "Try bringing the leaf closer to the camera lens or improving lighting."
                }), 200
        except Exception as e:
            pass
        
        # 4. Predict
        prediction = model.predict(processed_image, verbose=0)
        class_idx = np.argmax(prediction[0])
        confidence = float(np.max(prediction[0]) * 100) # Convert np.float32 to standard float for JSON
        
        # --- VALIDATION CHECK: Filter out invalid/random images ---
        if confidence < 60.0:
            return jsonify({
                "crop": "Unknown",
                "disease": "Invalid Image",
                "confidence": round(confidence, 2),
                "description": "Please upload a clear tomato leaf image",
                "treatment": "Try again with a proper leaf image"
            }), 200
            
        raw_disease = classes[class_idx]
        
        # 5. Clean and format the name
        clean_name = raw_disease.replace("Tomato_", "").replace("Tomato", "").replace("_", " ")
        clean_name = re.sub(' +', ' ', clean_name).strip()
        if clean_name.lower() == "healthy":
            clean_name = "Healthy"
            
        # 6. Fetch description and treatment
        info = disease_dict.get(raw_disease, {
            "description": "Unknown disease. Please consult an expert.",
            "treatment": "Isolate the plant to prevent potential spread."
        })
        
        # --- NEW: CALCULATE SEVERITY SCORE ---
        severity_percentage = 0
        severity_level = "None"
        
        if clean_name != "Healthy" and raw_disease != "Not a Leaf" and raw_disease != "Invalid Image":
            try:
                # Count healthy green tissue
                # Fallback extraction in case local variables went out of scope
                r_c = processed_image[0, :, :, 0]
                g_c = processed_image[0, :, :, 1]
                b_c = processed_image[0, :, :, 2]
                
                is_healthy = (g_c > r_c) & (g_c > b_c + 0.05) & (g_c > 0.1)
                healthy_count = np.sum(is_healthy)
                
                # Count sick tissue (yellow, brown, necrotic spots) distinct from background
                is_sick = (r_c >= g_c) & (r_c > b_c) & (g_c + r_c > 0.15) 
                sick_count = np.sum(is_sick)
                
                total_leaf = healthy_count + sick_count
                if total_leaf > 0:
                    severity_ratio = sick_count / total_leaf
                    # Scale severity so visual spotting registers impactfully
                    severity_percentage = min(int(severity_ratio * 100 * 1.2), 99)
                
                if severity_percentage < 20:
                    severity_level = "Early Stage (Low Risk)"
                elif severity_percentage < 55:
                    severity_level = "Moderate Risk (Action Required)"
                else:
                    severity_level = "Critical (High Damage)"
            except Exception:
                pass
        
        # 7. Return consistent JSON response
        return jsonify({
            "crop": "Tomato",
            "disease": clean_name,
            "confidence": round(confidence, 2),
            "description": info["description"],
            "treatment": info["treatment"],
            "severity": severity_percentage,
            "severity_level": severity_level
        }), 200

    except Exception as e:
        return jsonify({"error": f"Error processing the image: {str(e)}"}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Simple endpoint to verify server is running."""
    return jsonify({"status": "API is running"}), 200

if __name__ == '__main__':
    # Run the Flask app on localhost, port 5000
    app.run(debug=True, host='0.0.0.0', port=5000)
