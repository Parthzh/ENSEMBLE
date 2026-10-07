"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Cpu, Network, BookOpen, Layers, BarChart, Activity, ChevronRight, RefreshCcw, Camera, Menu, X } from "lucide-react";
import { CoverflowCarousel } from "@/components/ui/coverflow-carousel";
import { TopoBackground } from "@/components/ui/topo-background";
import { ModelDeepDive } from "@/components/ui/model-deep-dive";
import { BrandOrbs } from "@/shaders/brand-orbs/BrandOrbs";
import "@/shaders/threeui.css";

const SLIDES = [
  { src: "/model_images/knn.jpg", alt: "K-Nearest Neighbors", title: "K-Nearest Neighbors", subtitle: "Maps visual data into geometric space to classify grains by multi-dimensional feature proximity.", meta: [{ label: "Accuracy", value: "92.4%" }] },
  { src: "/model_images/rf.jpg", alt: "Random Forest", title: "Random Forest", subtitle: "Leverages an army of one hundred parallel decision trees to vote on complex spatial features.", meta: [{ label: "Accuracy", value: "96.8%" }] },
  { src: "/model_images/svm.jpg", alt: "Support Vector Machine", title: "Support Vector Machine", subtitle: "Slices high-dimensional feature spaces with mathematical precision to find the perfect grain boundaries.", meta: [{ label: "Accuracy", value: "98.1%" }] },
  { src: "/model_images/cnn.jpg", alt: "Custom CNN", title: "Custom CNN (3-Block)", subtitle: "Deep learning architecture extracting raw pixel hierarchies to identify microscopic surface grain patterns.", meta: [{ label: "Accuracy", value: "99.2%" }] },
  { src: "/model_images/enet.jpg", alt: "EfficientNet-B0", title: "EfficientNet-B0", subtitle: "State-of-the-art transfer learning model dynamically scaling depth and width for maximum feature extraction.", meta: [{ label: "Accuracy", value: "99.7%" }] },
];

// --- Types ---
type ModelResult = {
  prediction: string;
  confidence: number;
};

type BackendResponse = {
  master_prediction: string;
  master_confidence: number;
  models: Record<string, ModelResult>;
  extracted_features: any;
  ascii_art?: string;
};

// --- Dummy ASCII Generation ---
// In a real app, we'd calculate this on the canvas or backend.
// For the UI, we simulate a dense block of characters.
const generateAsciiPattern = () => {
  const chars = ["@", "%", "#", "*", "+", "=", "-", ":", ".", " "];
  let art = "";
  for (let i = 0; i < 30; i++) {
    for (let j = 0; j < 60; j++) {
      art += chars[Math.floor(Math.random() * chars.length)];
    }
    art += "\n";
  }
  return art;
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<BackendResponse | null>(null);
  
  const [activeView, setActiveView] = useState<string>("master");
  const [asciiArt, setAsciiArt] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setAsciiArt(generateAsciiPattern());
  }, [file]);

  const handleFileUpload = React.useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const uploaded = e.target.files[0];
      setFile(uploaded);
      setImageUri(URL.createObjectURL(uploaded));
      setIsProcessing(true);

      // Call the FastAPI Backend
      const formData = new FormData();
      formData.append("file", uploaded);

      try {
        const res = await fetch("https://ensemble-9acv.onrender.com/api/predict", {
          method: "POST",
          body: formData,
        });
        
        if (!res.ok) {
            throw new Error(`Server returned ${res.status}`);
        }
        
        const data = await res.json();
        
        if (data.error) {
            setErrorMessage(data.error);
            setResults(null);
            setFile(null); // Go back to welcome screen to show error
        } else {
            setResults(data);
            if (data.ascii_art) {
              setAsciiArt(data.ascii_art);
            }
        }
      } catch (err) {
        console.error("Backend offline or error", err);
        setErrorMessage("The server is currently unavailable or overloaded. Please try again in a few moments.");
        setResults(null);
        setFile(null); // Go back to welcome screen to show error
      }
      setIsProcessing(false);
    }
  }, []);

  const resetSession = () => {
    setFile(null);
    setImageUri(null);
    setResults(null);
    setErrorMessage(null);
    setActiveView("master");
  };

  // --- Components ---
  const WelcomeScreen = React.useMemo(() => () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-screen p-8 relative overflow-hidden"
    >
      
      {/* Decorative ASCII */}
      <div className="absolute top-10 left-10 text-[8px] font-mono leading-[8px] text-gray-400 opacity-50 z-0 whitespace-pre">
        {`  .::.\n.::::::.\n.::::::::.\n.::::::::::.\n:::::::SYSTEM\n:::::::ONLINE`}
      </div>

      {/* Social Links (BrandOrbs) */}
      <div className="absolute top-10 right-10 flex items-center gap-3 z-20 bg-white/90 backdrop-blur-sm border-2 border-gray-900 rounded-full px-4 py-2 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] hover:shadow-[6px_6px_0px_0px_rgba(17,24,39,1)] hover:-translate-y-0.5 transition-all">
        <a href="https://github.com/Parthzh/ENSEMBLE" target="_blank" rel="noreferrer" className="block w-12 h-12 hover:scale-110 transition-transform relative group">
          <BrandOrbs variant="github" size="medium" mode="light" speed={1.00} />
        </a>
        <div className="w-[2px] h-8 bg-gray-900/20 rounded-full"></div>
        <a href="https://www.linkedin.com/in/parthagarwalzh/" target="_blank" rel="noreferrer" className="block w-12 h-12 hover:scale-110 transition-transform relative group">
          <BrandOrbs variant="linkedin" size="medium" mode="light" speed={1.00} />
        </a>
      </div>

      <div className="z-10 max-w-4xl w-full">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-gray-900 mb-4">ENSEMBLE.AI</h1>
        <div className="border-l-4 border-gray-900 pl-4 mb-12">
          <p className="text-xl font-mono uppercase tracking-widest text-gray-600">Five-Model Neural Architecture</p>
          <p className="text-sm text-gray-500 mt-2 max-w-lg">Eliminate manual grain sorting. Processing 106 physical features in parallel using Classical ML and Deep Vision Nets.</p>
        </div>

        <div className="bg-white border-2 border-gray-900 p-8 shadow-[8px_8px_0px_0px_rgba(17,24,39,1)] transition-transform hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 font-mono text-6xl group-hover:opacity-20 transition-opacity">0101</div>
          <h2 className="text-2xl font-mono font-bold mb-6 border-b border-gray-200 pb-2 flex items-center gap-2">
            <Activity className="w-6 h-6" /> Initialize Sequence
          </h2>
          
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <label className="flex-1 flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-400 hover:border-gray-900 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group/drop">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-3 text-gray-400 group-hover/drop:text-gray-900 transition-colors" />
                <p className="mb-2 text-sm text-gray-500 font-mono"><span className="font-semibold text-gray-900">Upload Image</span></p>
                <p className="text-xs text-gray-500 uppercase tracking-widest">PNG, JPG</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>

            <label className="flex-1 flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-400 hover:border-gray-900 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group/drop relative overflow-hidden">
              {isProcessing && <div className="absolute inset-0 bg-gray-900/10 flex items-center justify-center backdrop-blur-sm"><RefreshCcw className="w-8 h-8 animate-spin text-gray-900" /></div>}
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Camera className="w-10 h-10 mb-3 text-gray-400 group-hover/drop:text-gray-900 transition-colors" />
                <p className="mb-2 text-sm text-gray-500 font-mono"><span className="font-semibold text-gray-900">Take Photo</span></p>
                <p className="text-xs text-gray-500 uppercase tracking-widest">Mobile/Web Camera</p>
              </div>
              <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFileUpload} disabled={isProcessing} />
            </label>
          </div>
          
          <AnimatePresence>
            {errorMessage && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-900 font-mono text-sm">
                <strong>[ERROR]</strong> {errorMessage}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="mt-12">
          <h3 className="text-xl font-mono font-bold tracking-widest text-gray-900 mb-6 text-center uppercase">Ensemble Architecture</h3>
          <div className="bg-white border-2 border-gray-900 shadow-[8px_8px_0px_0px_rgba(17,24,39,1)]">
            <CoverflowCarousel slides={SLIDES} showCaption showNavigation showPagination />
          </div>
        </div>
      </div>
    </motion.div>
  ), [isProcessing, errorMessage, handleFileUpload]);

  const Sidebar = () => (
    <motion.div 
      initial={{ x: -300 }} animate={{ x: 0 }}
      className={`w-80 h-screen border-r-2 border-gray-900 bg-white fixed left-0 top-0 flex flex-col z-50 shadow-[4px_0px_0px_0px_rgba(17,24,39,0.1)] transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="p-6 border-b-2 border-gray-900 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tighter">ENSEMBLE.AI</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="font-mono text-xs text-gray-500">SYSTEM ONLINE</span>
          </div>
        </div>
        <button className="md:hidden p-2 text-gray-500 hover:text-gray-900" onClick={() => setIsMobileMenuOpen(false)}>
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-6 mb-2 text-xs font-mono text-gray-400 uppercase tracking-widest">Core</div>
        <button onClick={() => { setActiveView("master"); setIsMobileMenuOpen(false); }} className={`w-full text-left px-6 py-3 font-mono text-sm border-l-4 transition-colors flex items-center justify-between ${activeView === "master" ? "border-gray-900 bg-gray-50 font-bold" : "border-transparent hover:bg-gray-50"}`}>
          <div className="flex items-center gap-3"><Layers className="w-4 h-4" /> Master Dashboard</div>
          {activeView === "master" && <ChevronRight className="w-4 h-4" />}
        </button>

        <div className="px-6 mt-6 mb-2 text-xs font-mono text-gray-400 uppercase tracking-widest">01 | Classical ML</div>
        {["KNN", "Random Forest", "SVM"].map(model => (
          <button key={model} onClick={() => { setActiveView(model); setIsMobileMenuOpen(false); }} className={`w-full text-left px-6 py-3 font-mono text-sm border-l-4 transition-colors flex items-center justify-between ${activeView === model ? "border-gray-900 bg-gray-50 font-bold" : "border-transparent hover:bg-gray-50"}`}>
            <div className="flex items-center gap-3"><BarChart className="w-4 h-4" /> {model}</div>
            {activeView === model && <ChevronRight className="w-4 h-4" />}
          </button>
        ))}

        <div className="px-6 mt-6 mb-2 text-xs font-mono text-gray-400 uppercase tracking-widest">02 | Deep Vision</div>
        {["Custom CNN", "EfficientNet-B0"].map(model => (
          <button key={model} onClick={() => { setActiveView(model); setIsMobileMenuOpen(false); }} className={`w-full text-left px-6 py-3 font-mono text-sm border-l-4 transition-colors flex items-center justify-between ${activeView === model ? "border-gray-900 bg-gray-50 font-bold" : "border-transparent hover:bg-gray-50"}`}>
            <div className="flex items-center gap-3"><Cpu className="w-4 h-4" /> {model}</div>
            {activeView === model && <ChevronRight className="w-4 h-4" />}
          </button>
        ))}


      </div>

      <div className="p-6 border-t-2 border-gray-900 bg-gray-50">
        <button onClick={resetSession} className="w-full flex items-center justify-center gap-2 py-2 px-4 border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-colors font-mono text-sm font-bold shadow-[2px_2px_0px_0px_rgba(17,24,39,1)] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px]">
          <RefreshCcw className="w-4 h-4" /> RESET SESSION
        </button>
      </div>
    </motion.div>
  );

  const MasterDashboard = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Animated ASCII Wave Reveal */}
        <div className="flex-1 bg-gray-900 border-2 border-gray-900 p-6 shadow-[8px_8px_0px_0px_rgba(200,200,200,1)] overflow-hidden relative">
          <motion.div 
            initial={{ clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)" }}
            animate={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="font-mono text-[6px] leading-[6px] text-green-400 whitespace-pre text-center"
          >
            {asciiArt}
          </motion.div>
          <div className="absolute bottom-4 left-4 font-mono text-xs text-gray-500">[ REALTIME ASCII MAP ]</div>
        </div>

        {/* Master Output */}
        <div className="w-full md:w-1/3 bg-white border-2 border-gray-900 p-8 shadow-[8px_8px_0px_0px_rgba(17,24,39,1)] flex flex-col justify-center min-h-[300px]">
          <h3 className="font-mono text-sm uppercase text-gray-500 mb-2 border-b border-gray-200 pb-2">Master Output</h3>
          <div className="text-6xl font-bold tracking-tighter my-4">{results?.master_prediction || "WAIT"}</div>
          <div className="font-mono text-sm">
            <span className="text-gray-500">CONFIDENCE:</span> 
            <span className="ml-2 font-bold">{results?.master_confidence || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 h-2 mt-4 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} animate={{ width: `${results?.master_confidence || 0}%` }} 
              transition={{ duration: 1, delay: 0.5 }}
              className="bg-gray-900 h-full"
            />
          </div>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="space-y-8">
        {[
          { title: "01 | CLASSICAL ML", models: [
            { id: "knn", name: "K-Nearest Neighbors", desc: "Distance-based spatial voting" },
            { id: "rf", name: "Random Forest", desc: "100+ decision trees" },
            { id: "svm", name: "Support Vector Machine", desc: "RBF kernel hyperplanes" }
          ]},
          { title: "02 | DEEP VISION", models: [
            { id: "custom_cnn", name: "Custom CNN (3-Block)", desc: "From-scratch architecture" },
            { id: "efficientnet", name: "EfficientNet-B0", desc: "Transfer learning" }
          ]}
        ].map(section => (
          <div key={section.title}>
            <h3 className="font-mono font-bold text-xl border-b-2 border-gray-900 pb-2 mb-6">{section.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.models.map(model => {
                const res = results?.models[model.id] || { prediction: "N/A", confidence: 0 };
                return (
                  <motion.div key={model.id} whileHover={{ y: -5, boxShadow: "6px 6px 0px 0px rgba(17,24,39,1)" }} className="bg-white border-2 border-gray-900 p-6 transition-all duration-200">
                    <div className="font-mono font-bold text-lg mb-1">{model.name}</div>
                    <div className="text-xs text-gray-500 mb-6 h-8">{model.desc}</div>
                    
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <div className="text-[10px] font-mono text-gray-400 uppercase">Prediction</div>
                        <div className="font-bold text-2xl">{res.prediction}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-mono text-gray-400 uppercase">Confidence</div>
                        <div className="font-mono font-bold">{res.confidence}%</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 h-1 mt-2">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${res.confidence}%` }} transition={{ duration: 1 }} className="bg-gray-900 h-full" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}


      </div>
    </motion.div>
  );

  // ModelDeepDive is imported from components/ui/model-deep-dive

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-gray-900 font-sans selection:bg-gray-900 selection:text-white">
      {/* Global Background Pattern (Grid + Topo) */}
      <TopoBackground className="opacity-30 fixed inset-0 z-[0] pointer-events-none" />
      <div className="fixed inset-0 z-[0] opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <AnimatePresence mode="wait">
        {!file ? (
          <WelcomeScreen key="welcome" />
        ) : (
          <div key="app" className="flex">
            <Sidebar />
            
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
              <div 
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
            )}

            <main className="relative z-10 md:ml-80 flex-1 p-4 md:p-12 overflow-y-auto min-h-screen w-full overflow-x-hidden">
              {/* Mobile Header */}
              <div className="md:hidden flex items-center justify-between mb-6 border-b-2 border-gray-900 pb-4">
                <h2 className="text-xl font-bold tracking-tighter">ENSEMBLE.AI</h2>
                <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-gray-900 text-white">
                  <Menu className="w-5 h-5" />
                </button>
              </div>

              {isProcessing ? (
                <div className="flex flex-col items-center justify-center h-[60vh]">
                  <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4"></div>
                  <div className="font-mono font-bold animate-pulse text-center text-lg">EXECUTING ENSEMBLE INFERENCE...</div>
                </div>
              ) : activeView === "master" ? (
                <MasterDashboard />
              ) : (
                <ModelDeepDive modelName={activeView} />
              )}
            </main>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
