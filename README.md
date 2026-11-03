# Leaf Detection System — Deep Learning Plant Pathology Diagnosis

[![Python](https://img.shields.io/badge/Python-3.8+-3776AB.svg?logo=python&logoColor=white)](https://www.python.org/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-FF6F00.svg?logo=tensorflow&logoColor=white)](https://tensorflow.org/)
[![OpenCV](https://img.shields.io/badge/OpenCV-Computer%20Vision-5C3EE8.svg?logo=opencv&logoColor=white)](https://opencv.org/)
[![Flask](https://img.shields.io/badge/Flask-Web%20API-000000.svg?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An end-to-end Computer Vision and Deep Learning system designed to diagnose plant foliar diseases from photographic imagery. Combines convolutional neural network classification with a responsive Flask web application for rapid agricultural disease identification and treatment advisory.

---

## Overview

Agricultural yield loss due to preventable plant foliage infections threatens global food security. Traditional agricultural diagnostic practices demand specialized botanists or pathologists, leaving smallholder farmers vulnerable to rapid contagion outbreaks.

The **Leaf Detection System** automates the visual inspection of plant leaves. By passing leaf imagery through a trained convolutional neural network (`leaf_model.h5`), the system classifies botanical pathologies with high precision and outputs actionable fertilizer, fungicide, or containment recommendations.

---

## Key Features

- **Deep Convolutional Architecture**: Trained neural network (`leaf_model.h5`) optimized for feature extraction across plant vein patterns, necrosis, and discoloration lesions.
- **Multi-Class Disease Classification**: Identifies bacterial spots, powdery mildew, early blight, late blight, and healthy foliage across multiple plant species.
- **RESTful Flask Backend**: Asynchronous inference endpoints accepting image uploads and returning predicted classifications, confidence scores, and remediation steps.
- **Interactive Web Interface**: Clean web dashboard allowing farmers and researchers to drag-and-drop leaf photos for immediate diagnosis.
- **User Authentication & Session Management**: Built-in credential management and historical diagnosis tracking powered by SQLite.

---

## System Architecture

```
[Leaf Image Upload (JPEG/PNG)]
             │
             ▼
[Computer Vision Preprocessing]
  ├── Color Space Normalization
  ├── OpenCV Resize & Aspect Scaling (224x224 / 256x256)
  └── Tensor Normalization (1.0 / 255.0)
             │
             ▼
[CNN Model Inference Core (leaf_model.h5)]
  ├── Convolutional + MaxPooling Feature Extractors
  ├── Dropout Layers for Regularization
  └── Softmax Probability Distribution
             │
             ▼
[Flask Diagnostic Engine (app.py)]
  ├── Pathological Condition Label Mapping
  ├── Confidence Score Verification
  └── Actionable Agronomic Treatment Advisories
             │
             ▼
[User Frontend Dashboard]
  ├── Visual Disease Diagnosis Card
  └── Recommended Treatment Steps
```

---

## Project Structure

```
Leaf-Detection-System/
├── app.py                  # Flask web backend and REST API routes
├── predict.py              # Standalone model inference and image scoring module
├── train_model.py          # CNN model training and validation pipeline
├── leaf_model.h5           # Pretrained Deep Learning Keras/TensorFlow model weights
├── DATASET/                # Botanical training and validation image sets
├── test images/            # Sample test photos for offline verification
├── frontend/               # Web client templates and styling assets
├── requirements.txt        # Python dependency manifest
├── runtime.txt             # Python runtime declaration
├── .gitignore              # Build and environment exclusions
└── README.md               # Technical project documentation
```

---

## Installation & Setup

### Prerequisites

- Python 3.8, 3.9, or 3.10
- GPU acceleration recommended for retraining (`train_model.py`), CPU is sufficient for inference (`app.py` / `predict.py`).

### Step-by-Step Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pratapashanmukhi/Leaf-Detection-System.git
   cd Leaf-Detection-System
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Web Application:**
   ```bash
   python app.py
   ```

5. **Access the application:**
   Navigate to `http://127.0.0.1:5000` in your web browser.

---

## Offline Image Prediction

You can also run predictions directly from the command line on any sample image:

```bash
python predict.py --image "test images/sample_leaf.jpg"
```

---

## Future Roadmap

- Mobile edge deployment via TensorFlow Lite (`.tflite`) for offline field use in rural areas without internet access.
- Expanded species support across greenhouse cash crops (tomatoes, bell peppers, corn).
- Integration with local weather telemetry to predict humidity-driven fungal disease outbreaks.

---

## Author

**Shanmukhi Pratapa**  
B.Tech CSE (AI & ML) — VIT-AP University  
GitHub: [@pratapashanmukhi](https://github.com/pratapashanmukhi)
