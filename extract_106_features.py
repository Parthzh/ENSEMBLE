import os
import cv2
import numpy as np
import pandas as pd
from scipy.stats import skew, kurtosis
from skimage.feature import graycomatrix, graycoprops, local_binary_pattern
import glob
from tqdm import tqdm

def extract_features(img_path):
    # Load image
    bgr = cv2.imread(img_path)
    if bgr is None:
        return None
    
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB)
    
    # Create mask (ignore black padding which is near 0)
    _, mask = cv2.threshold(gray, 10, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if not contours:
        return None
        
    cnt = max(contours, key=cv2.contourArea)
    
    features = {}
    
    # 1-14: Shape Features
    area = cv2.contourArea(cnt)
    perimeter = cv2.arcLength(cnt, True)
    x, y, w, h = cv2.boundingRect(cnt)
    
    if len(cnt) >= 5:
        (cx, cy), (minor_axis, major_axis), angle = cv2.fitEllipse(cnt)
        if major_axis < minor_axis:
            major_axis, minor_axis = minor_axis, major_axis
    else:
        major_axis, minor_axis = max(w, h), min(w, h)
        
    features['area'] = area
    features['perimeter'] = perimeter
    features['major_axis'] = major_axis
    features['minor_axis'] = minor_axis
    features['aspect_ratio'] = major_axis / minor_axis if minor_axis > 0 else 0
    features['eccentricity'] = np.sqrt(1 - (minor_axis/major_axis)**2) if major_axis > 0 and minor_axis <= major_axis else 0
    
    hull = cv2.convexHull(cnt)
    convex_area = cv2.contourArea(hull)
    features['convex_area'] = convex_area
    features['equiv_diameter'] = np.sqrt(4 * area / np.pi)
    features['extent'] = area / (w * h) if w * h > 0 else 0
    features['solidity'] = area / convex_area if convex_area > 0 else 0
    features['roundness'] = (4 * np.pi * area) / (perimeter ** 2) if perimeter > 0 else 0
    features['compactness'] = (perimeter ** 2) / area if area > 0 else 0
    features['shape_factor1'] = major_axis / area if area > 0 else 0
    features['shape_factor2'] = minor_axis / area if area > 0 else 0
    
    # 15-50: Color Features (4 stats x 9 channels)
    def color_stats(channel, prefix):
        pixels = channel[mask == 255]
        if len(pixels) == 0:
            return {f'{prefix}_mean': 0, f'{prefix}_std': 0, f'{prefix}_skew': 0, f'{prefix}_kurt': 0}
        return {
            f'{prefix}_mean': np.mean(pixels),
            f'{prefix}_std': np.std(pixels),
            f'{prefix}_skew': float(skew(pixels)),
            f'{prefix}_kurt': float(kurtosis(pixels))
        }
        
    channels = [
        (rgb[:,:,0], 'r'), (rgb[:,:,1], 'g'), (rgb[:,:,2], 'b'),
        (hsv[:,:,0], 'h'), (hsv[:,:,1], 's'), (hsv[:,:,2], 'v'),
        (lab[:,:,0], 'L'), (lab[:,:,1], 'a'), (lab[:,:,2], 'b_lab')
    ]
    for ch, prefix in channels:
        features.update(color_stats(ch, prefix))
        
    # 51-70: GLCM Texture Features (5 props x 4 angles)
    grain_gray = gray[y:y+h, x:x+w]
    glcm = graycomatrix(grain_gray, distances=[1], angles=[0, np.pi/4, np.pi/2, 3*np.pi/4], levels=256, symmetric=True, normed=True)
    props = ['contrast', 'dissimilarity', 'homogeneity', 'energy', 'correlation']
    for prop in props:
        vals = graycoprops(glcm, prop)[0]
        for i, angle in enumerate(['0', '45', '90', '135']):
            features[f'glcm_{prop}_{angle}'] = vals[i]
            
    # 71-96: LBP Texture (26 bins)
    lbp = local_binary_pattern(gray, P=8, R=1, method='uniform')
    lbp_pixels = lbp[mask == 255]
    hist, _ = np.histogram(lbp_pixels, bins=26, range=(0, 26))
    hist = hist.astype("float")
    hist /= (hist.sum() + 1e-7)
    for i in range(26):
        features[f'lbp_bin_{i}'] = hist[i]
        
    # 97-103: Hu Moments (7 features)
    moments = cv2.moments(cnt)
    hu = cv2.HuMoments(moments).flatten()
    for i in range(7):
        features[f'hu_moment_{i}'] = hu[i]
        
    # 104-106: Bounding Box Features
    features['bbox_width'] = w
    features['bbox_height'] = h
    features['bbox_diagonal'] = np.sqrt(w**2 + h**2)
    
    return features

def main():
    dataset_dir = 'Dataset_Augmented'
    if not os.path.exists(dataset_dir):
        print(f"Directory {dataset_dir} not found.")
        return
        
    classes = ['1121', '1509 - sella', '1509 - steam', '1718']
    
    all_features = []
    
    for cls in classes:
        cls_dir = os.path.join(dataset_dir, cls)
        if not os.path.exists(cls_dir):
            continue
            
        print(f"Processing {cls}...")
        img_paths = glob.glob(os.path.join(cls_dir, '*.jpg')) + glob.glob(os.path.join(cls_dir, '*.png'))
        
        for img_path in tqdm(img_paths):
            feats = extract_features(img_path)
            if feats is not None:
                feats['filename'] = os.path.basename(img_path)
                feats['rice_type'] = cls
                all_features.append(feats)
                
    df = pd.DataFrame(all_features)
    cols = ['filename', 'rice_type'] + [c for c in df.columns if c not in ['filename', 'rice_type']]
    df = df[cols]
    
    out_file = os.path.join(dataset_dir, 'augmented_metadata_106_features.csv')
    df.to_csv(out_file, index=False)
    print(f"\\nExtracted {len(df.columns) - 2} features for {len(df)} images.")
    print(f"Saved to {out_file}")

if __name__ == '__main__':
    main()
