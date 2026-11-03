# Leaf Detection System - Deep Learning Plant Pathology Diagnosis

[![Python](https://img.shields.io/badge/Python-3.9%20%7C%203.10%20%7C%203.11-3776AB.svg?logo=python&logoColor=white)](https://www.python.org/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.15-FF6F00.svg?logo=tensorflow&logoColor=white)](https://tensorflow.org/)
[![OpenCV](https://img.shields.io/badge/OpenCV-Computer%20Vision-5C3EE8.svg?logo=opencv&logoColor=white)](https://opencv.org/)
[![Flask](https://img.shields.io/badge/Flask-3.x-000000.svg?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg?logo=vite&logoColor=white)](https://vite.dev/)

An end-to-end Computer Vision and Deep Learning system designed to diagnose plant foliar pathologies from photographic imagery. Combines a convolutional neural network classification engine (`leaf_model.h5`), a Flask REST API backend, and an interactive React frontend for rapid agricultural disease identification and remediation advisory.

---

## Project Overview

Agricultural yield loss due to preventable plant foliage infections threatens food security and causes significant financial damage to farmers. Traditional diagnostic practices demand on-site plant pathologists, leaving growers vulnerable to rapid contagion spread.

The **Leaf Detection System** automates the visual inspection of plant leaves. By processing leaf imagery through a trained convolutional neural network, the system classifies botanical pathologies with high precision and outputs actionable fertilizer, fungicide, and containment recommendations.

### Problem Statement
- **Delayed Intervention**: Pathogen symptoms often remain unaddressed until crop necrosis spreads across entire fields.
- **Access Inequality**: Specialized botanical laboratories are distant, expensive, and unavailable to smallholder farmers.
- **Misdiagnosis**: Visual confusion between bacterial spots, mold, and viral infections leads to incorrect chemical applications.

---

## Key Features

- **Deep Convolutional Architecture**: Trained neural network (`leaf_model.h5`) optimized for feature extraction across foliar vein patterns, necrosis lesions, and chlorosis discoloration.
- **10-Class Tomato Pathology Diagnostic Suite**: Categorizes tomato foliage into 10 distinct health and pathological classes.
- **Actionable Remediation Guidance**: Returns tailored agronomic treatment steps (bactericides, fungicide schedules, ventilation advisories) alongside classification confidences.
- **Full-Stack REST Architecture**: Flask backend with asynchronous endpoints (`/signup`, `/login`, `/predict`) consumed by a modern React + Vite client dashboard.
- **Secure Authentication**: Salted and scrypt-hashed password storage with dynamic SQLite database provisioning.

---

## Diagnosed Plant Pathologies

| Class Label | Pathogen Type | Diagnostic Characteristics |
| :--- | :--- | :--- |
| **Tomato Bacterial Spot** | *Xanthomonas spp.* | Dark, water-soaked circular lesions on foliar tissue |
| **Tomato Early Blight** | *Alternaria solani* | Dark concentric ring spots initiating on lower canopy |
| **Tomato Late Blight** | *Phytophthora infestans* | Aggressive water-soaked lesions spreading rapidly in cool humidity |
| **Tomato Leaf Mold** | *Passalora fulva* | Pale greenish-yellow spots transitioning to velvety olive mold |
| **Tomato Septoria Leaf Spot** | *Septoria lycopersici* | Small circular lesions with dark brown margins and gray centers |
| **Spider Mites (Two-Spotted)** | *Tetranychus urticae* | Fine webbing, stippling, and chlorotic mottling |
| **Tomato Target Spot** | *Corynespora cassiicola* | Distinct bullseye lesions with yellow haloes |
| **Tomato Yellow Leaf Curl Virus** | *TYLCV (Begomovirus)* | Upward leaf curling, stunting, and interveinal chlorosis |
| **Tomato Mosaic Virus** | *ToMV (Tobamovirus)* | Mottled light/dark green mosaic patterns with leaf distortion |
| **Tomato Healthy** | *None* | Vigorous, unblemished foliage with standard chlorophyll pigmentation |

---

## Architecture & Workflow

```
[ User Browser / React Frontend ]
               │  (Multipart Form Image Upload)
               ▼
   [ Flask REST API (app.py) ]
               │
      ├── Authentication Verification (users.db / Werkzeug Scrypt)
      └── Image Tensor Preprocessing (Pillow / OpenCV)
               │
               ▼
 [ CNN Model Core (leaf_model.h5) ]
      ├── Feature Extraction Layers (Conv2D + MaxPool2D)
      └── Softmax Probability Distribution (10 classes)
               │
               ▼
 [ Treatment Engine & Response ]
      └── JSON Payload (Disease Label, Confidence %, Agronomic Advice)
```

---

## Project Structure

```
Leaf-Detection-System/
├── DATASET/                 # Botanical training and validation image sets
├── frontend/                # Interactive React + Vite client web interface
│   ├── src/                 # React UI components & view controllers
│   ├── package.json         # Node.js dependencies
│   └── vite.config.js       # Vite configuration
├── test images/             # Sample foliar test photos for offline evaluation
├── app.py                   # Flask REST backend and inference endpoints
├── predict.py               # Command-line single-image prediction utility
├── train_model.py           # CNN model training and validation pipeline
├── leaf_model.h5            # Pretrained Deep Learning Keras/TensorFlow model weights
├── requirements.txt         # Pinned Python dependencies
├── runtime.txt              # Deployment runtime specification
├── .gitignore               # Environment, database, and cache exclusions
└── README.md                # Comprehensive documentation
```

---

## Getting Started

### Prerequisites

- Python 3.9, 3.10, or 3.11
- Node.js (`v18.x` or `v20.x`) and `npm` (for the frontend)

### 1. Backend Setup (Flask API)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pratapashanmukhi/Leaf-Detection-System.git
   cd Leaf-Detection-System
   ```

2. **Create and activate a virtual environment:**
   ```bash
   # Windows:
   python -m venv venv
   .\venv\Scripts\activate

   # Linux / macOS:
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Launch the Flask API server:**
   ```bash
   python app.py
   ```
   *The API will start on `http://127.0.0.1:5000` and automatically initialize the user database schema if needed.*

### 2. Frontend Setup (React Client)

In a separate terminal window:

```bash
cd frontend
npm install
npm run dev
```
*Access the user interface at `http://localhost:5173`.*

---

## Offline CLI Evaluation

To test inference directly on a local leaf photograph without launching the web server:

```bash
python predict.py
```

---

## Security & Data Integrity

- **Database Privacy**: Database instances (`users.db`) containing user authentication records are ignored by `.gitignore` and generated locally via `init_db()`.
- **Password Hashing**: User credentials are protected using salted scrypt hashing (`werkzeug.security`).
- **Path Resolution**: File references resolve dynamically relative to `BASE_DIR`, preventing execution failures across containerized and nested environments.

---

## Future Roadmap

- Mobile edge deployment via TensorFlow Lite (`.tflite`) for offline field use in rural areas without connectivity.
- Expanded multi-crop support covering bell peppers, potatoes, and corn.
- Real-time weather telemetry integration to forecast humidity-induced fungal disease outbreaks.

---

## Author

**Shanmukhi Pratapa**  
B.Tech Computer Science & Engineering (Artificial Intelligence & Machine Learning)  
VIT-AP University  
GitHub: [@pratapashanmukhi](https://github.com/pratapashanmukhi)
