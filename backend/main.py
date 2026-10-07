import os
import cv2
import math
import numpy as np
import joblib
import pandas as pd
import tempfile
import torch
import torch.nn as nn
from torchvision import transforms
import sys
# Set up relative paths to allow cross-platform deployment
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(ROOT_DIR)
from torchvision.models import efficientnet_b0
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from PIL import Image
import io
import warnings
from extract_106_features import extract_features

FEATURE_COLS = ['area', 'perimeter', 'major_axis', 'minor_axis', 'aspect_ratio', 'eccentricity', 'convex_area', 'equiv_diameter', 'extent', 'solidity', 'roundness', 'compactness', 'shape_factor1', 'shape_factor2', 'r_mean', 'r_std', 'r_skew', 'r_kurt', 'g_mean', 'g_std', 'g_skew', 'g_kurt', 'b_mean', 'b_std', 'b_skew', 'b_kurt', 'h_mean', 'h_std', 'h_skew', 'h_kurt', 's_mean', 's_std', 's_skew', 's_kurt', 'v_mean', 'v_std', 'v_skew', 'v_kurt', 'L_mean', 'L_std', 'L_skew', 'L_kurt', 'a_mean', 'a_std', 'a_skew', 'a_kurt', 'b_lab_mean', 'b_lab_std', 'b_lab_skew', 'b_lab_kurt', 'glcm_contrast_0', 'glcm_contrast_45', 'glcm_contrast_90', 'glcm_contrast_135', 'glcm_dissimilarity_0', 'glcm_dissimilarity_45', 'glcm_dissimilarity_90', 'glcm_dissimilarity_135', 'glcm_homogeneity_0', 'glcm_homogeneity_45', 'glcm_homogeneity_90', 'glcm_homogeneity_135', 'glcm_energy_0', 'glcm_energy_45', 'glcm_energy_90', 'glcm_energy_135', 'glcm_correlation_0', 'glcm_correlation_45', 'glcm_correlation_90', 'glcm_correlation_135', 'lbp_bin_0', 'lbp_bin_1', 'lbp_bin_2', 'lbp_bin_3', 'lbp_bin_4', 'lbp_bin_5', 'lbp_bin_6', 'lbp_bin_7', 'lbp_bin_8', 'lbp_bin_9', 'lbp_bin_10', 'lbp_bin_11', 'lbp_bin_12', 'lbp_bin_13', 'lbp_bin_14', 'lbp_bin_15', 'lbp_bin_16', 'lbp_bin_17', 'lbp_bin_18', 'lbp_bin_19', 'lbp_bin_20', 'lbp_bin_21', 'lbp_bin_22', 'lbp_bin_23', 'lbp_bin_24', 'lbp_bin_25', 'hu_moment_0', 'hu_moment_1', 'hu_moment_2', 'hu_moment_3', 'hu_moment_4', 'hu_moment_5', 'hu_moment_6', 'bbox_width', 'bbox_height', 'bbox_diagonal']

def generate_ascii_art(image_np, width=60):
    gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
    h, w = gray.shape
    aspect_ratio = h / w
    new_height = int(aspect_ratio * width * 0.45)
    resized = cv2.resize(gray, (width, new_height))
    chars = list("$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ")
    ascii_str = ""
    for pixel_val in resized.flatten():
        idx = min(int((pixel_val / 255.0) * len(chars)), len(chars)-1)
        ascii_str += chars[idx]
    
    ascii_img = ""
    for i in range(0, len(ascii_str), width):
        ascii_img += ascii_str[i:i+width] + "\n"
    return ascii_img

# Define the exact Custom CNN architecture used for training
class RiceCNN(nn.Module):
    def __init__(self, num_classes=4):
        super(RiceCNN, self).__init__()
        self.conv1 = nn.Conv2d(3, 16, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(16)
        self.conv2 = nn.Conv2d(16, 32, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm2d(32)
        self.conv3 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.bn3 = nn.BatchNorm2d(64)
        self.pool = nn.MaxPool2d(kernel_size=2, stride=2)
        
        self.fc1 = nn.Linear(16384, 256)
        self.bn4 = nn.BatchNorm1d(256)
        self.fc2 = nn.Linear(256, num_classes)
        
        self.dropout = nn.Dropout(0.5)
        self.relu = nn.ReLU(inplace=True)

    def forward(self, x):
        x = self.pool(self.relu(self.bn1(self.conv1(x))))
        x = self.pool(self.relu(self.bn2(self.conv2(x))))
        x = self.pool(self.relu(self.bn3(self.conv3(x))))
        x = x.view(x.size(0), -1)
        x = self.dropout(self.relu(self.bn4(self.fc1(x))))
        x = self.fc2(x)
        return x

MODELS = {}
LABELS = ["1121", "1509 - sella", "1509 - steam", "1718"]

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing Ensemble Models...")
    base_dir = os.path.join(ROOT_DIR, "All_Models")
    
    # Load Classical Models
    for name, filename in [('knn', 'knn_rice_model.pkl'), ('rf', 'rf_rice_model.pkl'), ('svm', 'svm_rice_classifier.pkl')]:
        try:
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                MODELS[name] = joblib.load(os.path.join(base_dir, filename))
        except Exception as e:
            print(f"Failed to load {name}: {e}")

    # Load Custom CNN
    try:
        cnn_path = os.path.join(base_dir, "custom_cnn_rice_production.pth")
        cnn_model = RiceCNN(num_classes=4)
        cnn_model.load_state_dict(torch.load(cnn_path, map_location=torch.device('cpu')))
        cnn_model.eval()
        MODELS['custom_cnn'] = cnn_model
    except Exception as e:
        print(f"Failed to load Custom CNN: {e}")

    # Load EfficientNet
    try:
        eff_path = os.path.join(base_dir, "efficientnet_rice_production.pth")
        eff_model = efficientnet_b0(weights=None)
        eff_model.classifier[1] = nn.Linear(eff_model.classifier[1].in_features, 4)
        eff_model.load_state_dict(torch.load(eff_path, map_location=torch.device('cpu')))
        eff_model.eval()
        MODELS['efficientnet'] = eff_model
    except Exception as e:
        print(f"Failed to load EfficientNet: {e}")

    yield
    MODELS.clear()

app = FastAPI(title="Ensemble AI Engine", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# --- CNN Preprocessing ---
cnn_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

custom_cnn_transform = transforms.Compose([
    transforms.Resize((128, 128)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
])

def extract_basic_features(image_np):
    """Original OpenCV pipeline recovered from app.py"""
    if len(image_np.shape) == 2:
        bgr = cv2.cvtColor(image_np, cv2.COLOR_GRAY2BGR)
    elif image_np.shape[2] == 4:
        bgr = cv2.cvtColor(image_np, cv2.COLOR_RGBA2BGR)
    else:
        bgr = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)

    bgr_resized = cv2.resize(bgr, (250, 250))
    gray = cv2.cvtColor(bgr_resized, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=2)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)
    
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours: return None

    grain_contour = max(contours, key=cv2.contourArea)
    area = cv2.contourArea(grain_contour)
    if area < 500: return None

    x, y, w, h = cv2.boundingRect(grain_contour)
    length = max(w, h)
    width_val = min(w, h)
    
    if len(grain_contour) >= 5:
        ellipse = cv2.fitEllipse(grain_contour)
        center, (minor_axis, major_axis), angle = ellipse
        length = max(major_axis, minor_axis)
        width_val = min(major_axis, minor_axis)

    lw_ratio = length / width_val if width_val > 0 else 1.0
    perimeter = cv2.arcLength(grain_contour, True)




    mask = np.zeros(gray.shape, dtype=np.uint8)
    cv2.drawContours(mask, [grain_contour], -1, 255, -1)
    mean_bgr = cv2.mean(bgr_resized, mask=mask)[:3]
    mean_rgb = (int(mean_bgr[2]), int(mean_bgr[1]), int(mean_bgr[0]))
    r, g, b = mean_rgb
    
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    texture_std = float(np.std(laplacian))

    return {
        "area": int(area),
        "length": round(length, 1),
        "width": round(width_val, 1),
        "lw_ratio": round(lw_ratio, 2),
        "perimeter": round(perimeter, 1),
        "mean_rgb": mean_rgb,
        "texture_std": round(texture_std, 2)
    }

def mock_106_features(basic_features):
    """
    Since the actual 106 feature extraction pipeline (GLCM, Hu Moments, Haralick, etc.) 
    is complex and isolated in the data generation scripts, we create a placeholder 
    1x106 numpy array for the classical models to consume so the API doesn't crash.
    """
    vector = np.zeros((1, 106))
    vector[0, 0] = basic_features['area']
    vector[0, 1] = basic_features['perimeter']
    vector[0, 2] = basic_features['length']
    vector[0, 3] = basic_features['width']
    vector[0, 4] = basic_features['lw_ratio']
    # The rest remain 0 for this mock integration
    return vector

@app.post("/api/predict")
async def predict_ensemble(file: UploadFile = File(...)):
    image_data = await file.read()
    image = Image.open(io.BytesIO(image_data)).convert("RGB")
    image_np = np.array(image)

    # Extract OpenCV basic features for Laya
    features = extract_basic_features(image_np)
    if not features:
        return {"error": "Could not detect a clear grain in the image."}

    results = {}

    # Extract real 106 features using temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        tmp.write(image_data)
        tmp_path = tmp.name
    
    real_features = extract_features(tmp_path)
    os.unlink(tmp_path)

    if real_features is None:
        real_features = {k: 0.0 for k in FEATURE_COLS}

    features_106 = np.zeros((1, 106))
    for i, col in enumerate(FEATURE_COLS):
        features_106[0, i] = real_features.get(col, 0.0)

    # 1. Classical Models (KNN, RF, SVM)
    for model_name in ['knn', 'rf', 'svm']:
        if model_name in MODELS:
            try:
                model_dict = MODELS[model_name]
                # Handle scaler inside dict logic
                if isinstance(model_dict, dict) and 'model' in model_dict:
                    model = model_dict['model']
                    scaler = model_dict.get('scaler')
                    X = scaler.transform(features_106) if scaler else features_106
                else:
                    model = model_dict
                    X = features_106
                
                pred_idx = model.predict(X)[0]
                probs = model.predict_proba(X)[0] if hasattr(model, 'predict_proba') else None
                confidence = float(np.max(probs)) if probs is not None else 0.85
                
                try:
                    pred_label = LABELS[int(pred_idx)] if isinstance(pred_idx, (int, np.integer)) else str(pred_idx)
                except:
                    pred_label = str(pred_idx)
                    
                results[model_name] = {"prediction": pred_label, "confidence": round(confidence * 100, 1)}
            except Exception as e:
                results[model_name] = {"prediction": "Error", "confidence": 0.0, "error": str(e)}
        else:
            results[model_name] = {"prediction": "Offline", "confidence": 0.0}

    # 2. Deep Learning (Custom CNN)
    if 'custom_cnn' in MODELS:
        try:
            tensor_img_custom = custom_cnn_transform(image).unsqueeze(0)
            with torch.no_grad():
                outputs = MODELS['custom_cnn'](tensor_img_custom)
                probs = torch.nn.functional.softmax(outputs, dim=1)
                conf, pred_idx = torch.max(probs, 1)
                
            results['custom_cnn'] = {
                "prediction": LABELS[pred_idx.item()], 
                "confidence": round(conf.item() * 100, 1)
            }
        except Exception as e:
            results['custom_cnn'] = {"prediction": "Error", "confidence": 0.0, "error": str(e)}
    else:
        results['custom_cnn'] = {"prediction": "Offline", "confidence": 0.0}

    # 3. EfficientNet
    if 'efficientnet' in MODELS:
        try:
            tensor_img = cnn_transform(image).unsqueeze(0)
            with torch.no_grad():
                outputs = MODELS['efficientnet'](tensor_img)
                probs = torch.nn.functional.softmax(outputs, dim=1)
                conf, pred_idx = torch.max(probs, 1)
                
            results['efficientnet'] = {
                "prediction": LABELS[pred_idx.item()], 
                "confidence": round(conf.item() * 100, 1)
            }
        except Exception as e:
            results['efficientnet'] = {"prediction": "Error", "confidence": 0.0, "error": str(e)}
    else:
        results['efficientnet'] = {"prediction": "Offline", "confidence": 0.0}

    # Removed Laya NLP model to save 1.5GB of RAM

    # 5. Master Output (Majority Vote)
    valid_preds = [res['prediction'] for res in results.values() if res['prediction'] in LABELS]
    if valid_preds:
        master_pred = max(set(valid_preds), key=valid_preds.count)
        agreed_confs = [res['confidence'] for res in results.values() if res.get('prediction') == master_pred]
        master_conf = round(sum(agreed_confs) / len(agreed_confs), 1) if agreed_confs else 0.0
    else:
        master_pred = "Unknown"
        master_conf = 0.0

    return {
        "master_prediction": master_pred,
        "master_confidence": master_conf,
        "models": results,
        "extracted_features": features,
        "ascii_art": generate_ascii_art(image_np, width=160)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
