# Rice Grain Classifier — Project Summary

> **Source**: [Rice_Grain_Classifier_Project_Plan.pdf](file:///C:/Users/Parth/Downloads/Rice_Grain_Classifier_Project_Plan.pdf) (12 pages)
> **Type**: Semester Project Plan — Computer Vision & Machine Learning
> **Team**: 5 members | 14-week semester | 2nd Year Project

---

## 🎯 What You're Building

A **"Shazam for rice"** — a smart web app where a user uploads a photo of a rice grain and gets:

1. **Variety prediction** (Basmati, Jasmine, Arborio, Ipsala, or Karacadag)
2. **Confidence score** (e.g. "96% sure it's Basmati")
3. **Physical analysis** — size, shape, and color measurements

---

## 📊 Dataset

| Attribute | Details |
|---|---|
| **Name** | Rice Image Dataset (by Murat Koklu) |
| **Source** | Kaggle (`muratkokludataset/rice-image-dataset`) |
| **Total Images** | 75,000 (15,000 per variety, perfectly balanced) |
| **Varieties** | Arborio, Basmati, Ipsala, Jasmine, Karacadag |
| **Image Size** | 250 × 250 px, white background |
| **Bonus** | 106 pre-calculated features (size/shape/color) |

---

## 🔬 3 Parameters Analyzed

| Parameter | What's Measured | Why It Matters |
|---|---|---|
| **Size** | Length, Width, Area (in px) | Basmati = long; Arborio = short & fat |
| **Shape** | L/W ratio → label (Long Slender / Medium / Bold / Round) | Distinguishes varieties by geometry |
| **Color** | Average RGB values → label (White, Creamy, Brown, etc.) | Varieties have different shades |

---

## 🤖 Models to Build (5 total)

### Group A: Deep Learning (image-based)
| Model | Description | Expected Accuracy |
|---|---|---|
| **Custom CNN** | Designed from scratch | ~95–97% |
| **MobileNetV2** | Transfer learning (pre-trained, fine-tuned) | ~99% |

### Group B: Classical ML (feature-based, using 106 features)
| Model | How It Works |
|---|---|
| **SVM** | Mathematical boundaries between classes |
| **Random Forest** | Ensemble of decision trees, majority vote |
| **KNN** | Nearest-neighbor similarity matching |

> [!IMPORTANT]
> **Core contribution of the paper**: Comparing deep learning vs. classical ML for rice classification.

---

## 🧪 Ablation Study (Key Research Contribution)

Train the best ML model with different feature subsets to answer: *"Which physical property matters most?"*

| Experiment | Features Used | # Features |
|---|---|---|
| Size only | Area, perimeter, axis lengths… | 12 |
| Shape only | Eccentricity, extent, roundness… | 4 |
| Color only | RGB, HSV values… | 90 |
| Size + Shape | Combined | 16 |
| Size + Color | Combined | 102 |
| Shape + Color | Combined | 94 |
| **ALL THREE** | Everything | 106 |

---

## 🛠️ Tech Stack

| Tool | Purpose |
|---|---|
| **Python** | Core language |
| **Google Colab** | Free GPU for training |
| **TensorFlow** | Deep learning models |
| **Scikit-learn** | SVM, Random Forest, KNN |
| **OpenCV** | Image measurement (size, shape, color) |
| **Streamlit** | Web app UI |
| **NumPy / Pandas** | Data handling |
| **Matplotlib** | Charts & graphs |

---

## 👥 Team Roles

| Member | Role | Responsibility |
|---|---|---|
| Person 1 | **Data & Preprocessing** | Download, explore, split, clean |
| Person 2 | **Deep Learning Engineer** | Custom CNN + MobileNetV2 |
| Person 3 | **Classical ML Engineer** | SVM, RF, KNN + ablation study |
| Person 4 | **App Developer** | Streamlit app + OpenCV integration |
| Person 5 | **Paper Writer & Integrator** | Paper from Week 1, literature review, presentations |

---

## 📅 14-Week Timeline

| Weeks | Phase | Key Tasks |
|---|---|---|
| 1–2 | Research & Setup | Read papers, set up Colab, download dataset, create GitHub repo |
| 3–4 | Data Exploration | Charts, statistics, train/val/test split (70/15/15) |
| 5–7 | Model Building | CNN + MobileNetV2 + SVM/RF/KNN + start paper |
| 8–9 | Ablation Study | Feature subset experiments + Grad-CAM + methodology section |
| 10–11 | App Development | Streamlit app + OpenCV measurements |
| 12–13 | Evaluation & Paper | Confusion matrices, accuracy tables, Results + Conclusion |
| 14 | Final Polish | Test everything, clean GitHub, finalize paper, prep demo |

---

## 📝 Research Paper Outline

**Suggested Title**: *"Automated Rice Grain Classification Using Deep Learning: A Comparative Study of CNN and Classical Machine Learning Approaches Based on Shape, Size, and Color Features"*

| Section | Length | Content |
|---|---|---|
| Abstract | ~200 words | Summary (write LAST) |
| Introduction | 1–1.5 pages | Problem, motivation, contributions |
| Related Work | 1 page | Literature gap analysis |
| Methodology | 2–3 pages | Dataset, preprocessing, models, ablation design |
| Results & Discussion | 2 pages | Comparison table, ablation, confusion matrices, Grad-CAM |
| Web Application | 0.5 page | Streamlit screenshot + user flow |
| Conclusion & Future Work | 0.5 page | Limitations + future directions |
| References | — | 15–25 sources (Google Scholar, IEEE Xplore) |

---

## ✅ Final Deliverables

- [ ] **5 Trained Models** — Custom CNN, MobileNetV2, SVM, Random Forest, KNN
- [ ] **Working Streamlit Web App** — Upload → classify → display result card
- [ ] **Ablation Study Table** — Which parameters matter most
- [ ] **Research Paper** — 6–8 pages, academic format
- [ ] **Presentation** — 10–12 slides with live demo
- [ ] **GitHub Repository** — Clean code with README

---

## 💡 What Will Impress the Professor

| What | Why |
|---|---|
| Compare 5 different models | Shows breadth of understanding |
| Ablation study | Scientific thinking |
| Working web app | Goes beyond notebooks → real product |
| Grad-CAM heatmaps | Explainable AI |
| Paper written throughout | Discipline & methodology |
| Honest about limitations | Intellectual honesty |
