import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Cpu, Target, Clock, Activity, Zap } from "lucide-react";

type ModelProps = {
  modelName: string;
};

// Actual data from backend models
const CLASSES = ["1121", "1509 - sella", "1509 - steam", "1718"];

// Extracted metrics from actual dataset runs
const MODEL_METRICS: Record<string, any> = {
  "KNN": {
    precision: 0.58, recall: 0.58, f1: 0.58, trainTime: "0.5s", inferTime: "45ms",
    confusion: [[1418, 168, 265, 315], [230, 1501, 230, 202], [313, 311, 1167, 315], [499, 338, 477, 948]]
  },
  "Random Forest": {
    precision: 0.92, recall: 0.92, f1: 0.92, trainTime: "12.5s", inferTime: "15ms",
    confusion: [[2030, 27, 47, 62], [24, 2060, 35, 44], [59, 58, 1897, 92], [86, 71, 99, 2006]]
  },
  "SVM": {
    precision: 0.66, recall: 0.66, f1: 0.66, trainTime: "18.2s", inferTime: "22ms",
    confusion: [[1541, 149, 216, 260], [129, 1724, 161, 149], [249, 214, 1313, 330], [347, 293, 477, 1145]]
  },
  "Custom CNN (3-Block)": {
    precision: 0.93, recall: 0.93, f1: 0.93, trainTime: "15m", inferTime: "8ms",
    confusion: [[1981, 25, 70, 90], [29, 2065, 44, 25], [44, 23, 1959, 80], [82, 31, 103, 2046]]
  },
  "EfficientNet-B0": {
    precision: 0.95, recall: 0.95, f1: 0.95, trainTime: "45m", inferTime: "12ms",
    confusion: [[2039, 21, 50, 56], [17, 2103, 28, 15], [32, 27, 1998, 49], [46, 30, 72, 2114]]
  },
};

// Subtle Architecture Animations
const KnnAnimation = () => (
  <div className="relative w-full h-48 border-2 border-gray-900 bg-gray-50 overflow-hidden flex items-center justify-center p-4">
    {/* Background points */}
    {[...Array(15)].map((_, i) => (
      <motion.div key={i} className="absolute w-2 h-2 rounded-full bg-gray-300" 
        style={{ left: `${20 + (i * 7) % 60}%`, top: `${20 + (i * 13) % 60}%` }}
      />
    ))}
    {/* Target point */}
    <motion.div 
      initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
      className="absolute w-4 h-4 rounded-full bg-gray-900 border-2 border-white shadow-[0_0_0_2px_rgba(17,24,39,1)] z-10"
      style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
    />
    {/* Connecting lines */}
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      {[1, 2, 3].map(i => (
        <motion.line key={i} x1="50%" y1="50%" x2={`${40 + i * 5}%`} y2={`${30 + i * 10}%`} stroke="#111827" strokeWidth="2" strokeDasharray="4 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 1, delay: 0.5 + i * 0.2, repeat: Infinity, repeatDelay: 2 }}
        />
      ))}
    </svg>
  </div>
);

const RfAnimation = () => (
  <div className="relative w-full h-48 border-2 border-gray-900 bg-gray-50 overflow-hidden flex flex-col items-center justify-center p-4">
    <div className="flex gap-12 w-full justify-center">
      {[1, 2, 3].map((tree) => (
        <div key={tree} className="flex flex-col items-center">
          <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: tree * 0.2, repeat: Infinity, repeatDelay: 3 }} className="w-8 h-8 border-2 border-gray-900 flex items-center justify-center text-xs font-bold mb-4 bg-white">?</motion.div>
          <div className="flex gap-4">
            <motion.div initial={{ height: 0 }} animate={{ height: 30 }} transition={{ delay: 0.2 + tree * 0.2, repeat: Infinity, repeatDelay: 3 }} className="w-0.5 bg-gray-900 -ml-2 rotate-[30deg] origin-top" />
            <motion.div initial={{ height: 0 }} animate={{ height: 30 }} transition={{ delay: 0.2 + tree * 0.2, repeat: Infinity, repeatDelay: 3 }} className="w-0.5 bg-gray-900 -mr-2 -rotate-[30deg] origin-top" />
          </div>
          <div className="flex gap-2 mt-2">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 + tree * 0.2, repeat: Infinity, repeatDelay: 3 }} className="w-4 h-4 bg-gray-300 border-2 border-gray-900" />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 + tree * 0.2, repeat: Infinity, repeatDelay: 3 }} className="w-4 h-4 bg-gray-900 border-2 border-gray-900" />
          </div>
        </div>
      ))}
    </div>
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5, repeat: Infinity, repeatDelay: 1.7 }} className="mt-6 px-4 py-1 border-2 border-gray-900 bg-gray-900 text-white font-mono text-xs">MAJORITY VOTE</motion.div>
  </div>
);

const SvmAnimation = () => (
  <div className="relative w-full h-48 border-2 border-gray-900 bg-gray-50 overflow-hidden flex items-center justify-center">
    {/* Group 1 */}
    {[...Array(8)].map((_, i) => (
      <motion.div key={`g1-${i}`} className="absolute w-3 h-3 bg-gray-400 rounded-sm" style={{ left: `${15 + Math.random() * 20}%`, top: `${20 + Math.random() * 40}%` }} />
    ))}
    {/* Group 2 */}
    {[...Array(8)].map((_, i) => (
      <motion.div key={`g2-${i}`} className="absolute w-3 h-3 bg-gray-900 rounded-full" style={{ right: `${15 + Math.random() * 20}%`, bottom: `${20 + Math.random() * 40}%` }} />
    ))}
    {/* Hyperplane */}
    <motion.div 
      initial={{ height: 0, opacity: 0 }} 
      animate={{ height: "150%", opacity: 1 }} 
      transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 2 }}
      className="absolute w-1 bg-gray-900 rotate-[35deg]"
    />
    <motion.div 
      initial={{ height: 0, opacity: 0 }} 
      animate={{ height: "150%", opacity: 0.2 }} 
      transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut", repeat: Infinity, repeatDelay: 2 }}
      className="absolute w-8 bg-gray-500 rotate-[35deg]"
    />
  </div>
);

const CnnAnimation = () => (
  <div className="relative w-full h-48 border-2 border-gray-900 bg-gray-50 overflow-hidden flex items-center justify-center gap-6 p-4">
    {[1, 2, 3].map(layer => (
      <div key={layer} className="flex items-center gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotateX: 60, rotateZ: -45 }}
          animate={{ opacity: [0, 1, 1, 0], scale: 1, rotateX: 60, rotateZ: -45 }}
          transition={{ duration: 3, delay: layer * 0.5, repeat: Infinity }}
          className="border-2 border-gray-900 bg-white/50 shadow-[4px_4px_0_0_rgba(17,24,39,0.2)]"
          style={{ 
            width: `${80 - layer * 15}px`, 
            height: `${80 - layer * 15}px`,
            borderWidth: `${1 + layer}px`
          }}
        />
        {layer < 3 && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 30, opacity: 1 }}
            transition={{ duration: 0.5, delay: layer * 0.5 + 0.5, repeat: Infinity, repeatDelay: 2.5 }}
            className="h-0.5 bg-gray-900"
          />
        )}
      </div>
    ))}
  </div>
);

const EnetAnimation = () => (
  <div className="relative w-full h-48 border-2 border-gray-900 bg-gray-50 overflow-hidden flex flex-col items-center justify-center p-4">
    <div className="flex gap-4 items-end h-32">
      {[1, 2, 3, 4, 5].map(block => (
        <motion.div 
          key={block}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: `${30 + block * 15}px`, opacity: 1 }}
          transition={{ duration: 0.5, delay: block * 0.2, repeat: Infinity, repeatDelay: 2 }}
          className="w-12 border-2 border-gray-900 bg-white relative group"
        >
          {/* Skip Connection */}
          {block % 2 === 0 && (
             <motion.div 
               initial={{ opacity: 0, pathLength: 0 }}
               animate={{ opacity: 1, pathLength: 1 }}
               transition={{ duration: 0.5, delay: block * 0.2 + 0.3, repeat: Infinity, repeatDelay: 2 }}
               className="absolute -top-6 left-1/2 w-16 h-8 border-t-2 border-r-2 border-gray-900 rounded-tr-lg rounded-tl-lg pointer-events-none"
               style={{ transform: "translateX(-100%)" }}
             />
          )}
        </motion.div>
      ))}
    </div>
    <div className="mt-4 font-mono text-[10px] text-gray-500 tracking-widest uppercase">Compound Scaling</div>
  </div>
);


export function ModelDeepDive({ modelName }: ModelProps) {
  const metrics = MODEL_METRICS[modelName] || MODEL_METRICS["KNN"];
  
  const renderAnimation = () => {
    switch (modelName) {
      case "KNN": return <KnnAnimation />;
      case "Random Forest": return <RfAnimation />;
      case "SVM": return <SvmAnimation />;
      case "Custom CNN (3-Block)": return <CnnAnimation />;
      case "EfficientNet-B0": return <EnetAnimation />;
      default: return <KnnAnimation />;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-2 leading-tight break-words">{modelName}</h1>
        <p className="font-mono text-gray-500 uppercase tracking-widest border-b-2 border-gray-900 pb-4 text-xs md:text-sm">Internal Architecture Inspection</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Animation & Metrics */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white border-2 border-gray-900 p-6 shadow-[8px_8px_0px_0px_rgba(17,24,39,1)]">
            <h3 className="font-mono font-bold mb-4 flex items-center gap-2"><Cpu className="w-5 h-5"/> Data Flow</h3>
            {renderAnimation()}
          </div>
          
          <div className="bg-white border-2 border-gray-900 p-6 shadow-[8px_8px_0px_0px_rgba(17,24,39,1)]">
            <h3 className="font-mono font-bold mb-6 flex items-center gap-2"><Activity className="w-5 h-5"/> Performance</h3>
            <div className="space-y-4 font-mono text-sm">
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-gray-500 uppercase">Precision</span>
                <span className="font-bold">{(metrics.precision * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-gray-500 uppercase">Recall</span>
                <span className="font-bold">{(metrics.recall * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-gray-500 uppercase">F1-Score</span>
                <span className="font-bold">{(metrics.f1 * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 text-white border-2 border-gray-900 p-6 shadow-[8px_8px_0px_0px_rgba(150,150,150,1)]">
            <h3 className="font-mono font-bold mb-6 flex items-center gap-2 text-green-400"><Clock className="w-5 h-5"/> Compute Profile</h3>
            <div className="space-y-4 font-mono text-sm">
              <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                <span className="text-gray-400 uppercase">Train Time</span>
                <span className="font-bold">{metrics.trainTime}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                <span className="text-gray-400 uppercase">Infer/Image</span>
                <span className="font-bold">{metrics.inferTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Confusion Matrix */}
        <div className="lg:col-span-2 bg-white border-2 border-gray-900 p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(17,24,39,1)] flex flex-col">
          <h3 className="font-mono font-bold mb-6 flex items-center gap-2"><Target className="w-5 h-5"/> Confusion Matrix</h3>
          
          <div className="flex-1 flex flex-col justify-center">
            <div className="overflow-x-auto">
              <div className="min-w-[500px]">
                {/* Headers */}
                <div className="flex mb-2">
                  <div className="w-24 shrink-0 flex flex-col justify-end items-end pr-2 pb-1 font-mono text-[9px] uppercase text-gray-400 leading-tight">
                    <span>Predicted &rarr;</span>
                    <span>Actual &darr;</span>
                  </div>
                  {CLASSES.map(c => (
                    <div key={c} className="flex-1 text-center font-mono text-[10px] uppercase text-gray-500 tracking-tighter truncate px-1">
                      {c}
                    </div>
                  ))}
                </div>
                
                {/* Grid */}
                <div className="border-2 border-gray-900 bg-gray-50 p-2 space-y-2">
                  {metrics.confusion.map((row: number[], i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-20 shrink-0 font-mono text-[10px] uppercase text-gray-500 text-right truncate">
                        {CLASSES[i]}
                      </div>
                      <div className="flex-1 flex gap-2">
                        {row.map((val, j) => {
                          // Brutalist visual encoding: completely fill the box if high, outline if low
                          const isCorrect = i === j;
                          const intensity = val / 100; // rough scale
                          return (
                            <div 
                              key={j} 
                              className={`flex-1 aspect-square flex items-center justify-center font-mono text-xs font-bold border-2 transition-all hover:scale-110 ${
                                isCorrect 
                                  ? "border-gray-900 bg-gray-900 text-white" 
                                  : val > 0 
                                    ? "border-gray-400 bg-white text-gray-900" 
                                    : "border-transparent text-gray-300"
                              }`}
                              style={isCorrect ? { opacity: Math.max(0.4, intensity) } : {}}
                            >
                              {val}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 bg-gray-50 border border-gray-200 p-4 font-mono text-xs text-gray-600 leading-relaxed">
            <span className="font-bold text-gray-900">Analysis: </span>
            {isDeepVision(modelName) 
              ? "Deep vision nets excel at complex feature extraction, capturing subtle texture variations across grain boundaries."
              : "Classical ML pipelines rely on structured geometrical features, processing shape and dimensions effectively but struggling slightly with overlapping boundaries."}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function isDeepVision(name: string) {
  return name.includes("CNN") || name.includes("EfficientNet");
}
