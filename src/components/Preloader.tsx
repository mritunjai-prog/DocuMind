import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { BrainCircuit, Cpu, Zap, Library } from "lucide-react";

export const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const [loadingText, setLoadingText] = useState("Initializing neural links...");

  useEffect(() => {
    const texts = [
      "Initializing neural links...",
      "Waking up the AI models...",
      "Loading ML pipelines...",
      "Preparing workspace...",
    ];
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < texts.length) {
        setLoadingText(texts[step]);
      }
    }, 800);

    const timer = setTimeout(() => {
      onComplete();
    }, 3200);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <motion.div
      key="preloader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
    >
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 blur-[120px] rounded-full" />

      {/* Center Logo / Animation */}
      <motion.div
        className="relative z-10 flex flex-col items-center"
      >
        <div className="relative w-32 h-32 mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-t-2 border-primary/50"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 rounded-full border-b-2 border-white/30"
          />
          <motion.div
            animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <BrainCircuit className="w-12 h-12 text-primary drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
          </motion.div>
        </div>

        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black text-white tracking-widest mb-4 uppercase"
        >
          DOCUMIND
        </motion.h2>

        <div className="h-6 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={loadingText}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="text-sm font-mono tracking-wider text-muted-foreground uppercase"
            >
              {loadingText}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Loading Bar */}
        <div className="w-64 h-1 mt-8 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3.2, ease: "easeInOut" }}
            className="h-full bg-primary"
          />
        </div>
      </motion.div>
    </motion.div>
  );
};
