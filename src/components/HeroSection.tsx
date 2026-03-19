import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
import {
  FileText,
  Brain,
  Shield,
  Zap,
  ArrowRight,
  Sparkles,
  Play,
  ScanSearch,
  Database,
  Layers,
} from "lucide-react";
import { useRef, MouseEvent } from "react";
import { Link } from "react-router-dom";
import Tilt from "react-parallax-tilt";

const HeroSection = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const stats = [
    {
      icon: FileText,
      label: "Documents/Day",
      value: "10K+",
      color: "text-primary",
    },
    { icon: Brain, label: "Accuracy", value: "99.2%", color: "text-accent" },
    {
      icon: Shield,
      label: "Compliance",
      value: "HIPAA",
      color: "text-primary",
    },
    { icon: Zap, label: "Response", value: "<2s", color: "text-accent" },
  ];

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* ── Background layers ── */}
      <div className="absolute inset-0 grid-pattern opacity-30" />

      <motion.div
        className="orb orb-primary animate-morph"
        style={{ width: 650, height: 650, top: "-10%", left: "-5%", y }}
      />
      <motion.div
        className="orb orb-accent"
        style={{
          width: 500,
          height: 500,
          bottom: "-5%",
          right: "-5%",
          y: useTransform(scrollYProgress, [0, 1], [0, -80]),
        }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="w-[800px] h-[800px] rounded-full border border-primary/5 animate-spin-slow" />
        <div className="absolute w-[600px] h-[600px] rounded-full border border-accent/5 animate-spin-reverse" />
        <div
          className="absolute w-[1000px] h-[1000px] rounded-full border border-primary/3 animate-spin-slow"
          style={{ animationDuration: "40s" }}
        />
      </div>

      <motion.div
        style={{ opacity: fade }}
        className="relative z-10 w-full max-w-7xl mx-auto px-6"
      >
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Text Content */}
          <div className="text-center lg:text-left z-20">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass glow-border mb-8 cursor-default"
            >
              <motion.span
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-accent"
              />
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm font-semibold text-muted-foreground">
                Enterprise-Grade Document AI — Now Live
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.15,
                duration: 0.9,
                ease: [0.23, 1, 0.32, 1],
              }}
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight leading-[1.05] mb-6"
            >
              <span className="text-foreground">Intelligent</span>
              <br />
              <span className="text-gradient-animated">Document</span>
              <br />
              <span className="shimmer-text">Processing</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed"
            >
              Extract, classify, and analyze documents with AI-powered OCR, NER,
              and RAG. Process{" "}
              <strong className="text-foreground">
                10,000+ documents daily
              </strong>{" "}
              with 99%+ accuracy.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.7 }}
              className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-4 mb-16"
            >
              <Link to="/workspace">
                <motion.button
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-smooth group px-8 py-4 rounded-2xl bg-gradient-brand text-primary-foreground font-bold text-base flex items-center gap-2"
                  style={{
                    boxShadow: "0 8px 32px -6px hsl(var(--glow) / 0.5)",
                  }}
                >
                  <Sparkles className="w-4 h-4" /> Try DocuMind
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="group px-8 py-4 rounded-2xl glass glow-border glow-border-hover font-bold text-base text-foreground flex items-center gap-2 transition-all"
              >
                <Play className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />{" "}
                Watch Demo
              </motion.button>
            </motion.div>
          </div>

          {/* Right 3D Visualizer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: 30 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ delay: 0.4, duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
            className="relative perspective-1000 hidden lg:block"
          >
            <Tilt
              tiltMaxAngleX={15}
              tiltMaxAngleY={15}
              perspective={1000}
              transitionSpeed={1500}
              scale={1.05}
              className="w-full relative z-10"
            >
              {/* Central 3D Card */}
              <div className="relative w-full max-w-md mx-auto aspect-[3/4] glass-card rounded-3xl p-6 border border-primary/20 bg-background/50 backdrop-blur-xl shadow-2xl overflow-hidden transform-gpu">
                {/* Scanning Laser */}
                <motion.div
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 w-full h-1 bg-primary z-50 shadow-[0_0_20px_4px_hsl(187_85%_53%)]"
                  style={{ opacity: 0.8 }}
                />

                <div className="absolute top-6 right-6 z-20 flex gap-2">
                  <span className="flex items-center gap-1 text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded-full">
                    <Brain className="w-3 h-3" /> AI Active
                  </span>
                </div>

                {/* Simulated Document Content */}
                <div className="space-y-4 pt-8">
                  <div className="h-6 w-3/4 bg-primary/20 rounded-md animate-pulse" />
                  <div className="h-4 w-1/2 bg-muted/40 rounded-md" />

                  <div className="py-4 space-y-3">
                    <div className="flex gap-3 items-center">
                      <ScanSearch className="w-5 h-5 text-primary" />
                      <div className="h-2 w-full bg-primary/20 rounded-full overflow-hidden">
                        <motion.div
                          animate={{ width: ["0%", "100%"] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="h-full bg-primary"
                        />
                      </div>
                    </div>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-2">
                        <div className="h-3 w-3 rounded-full bg-accent/50" />
                        <div className="h-3 flex-1 bg-muted/30 rounded-md" />
                      </div>
                    ))}
                  </div>

                  {/* 3D Floating Action Elements */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute -right-8 bottom-20 glass p-3 rounded-xl border border-accent/30 shadow-lg backdrop-blur-md flex items-center gap-3 transform translate-z-10"
                    style={{ transform: "translateZ(50px)" }}
                  >
                    <Database className="w-6 h-6 text-accent" />
                    <div>
                      <div className="text-xs font-bold text-foreground">
                        Extracted
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        JSON Structured
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                    className="absolute -left-8 top-32 glass p-3 rounded-xl border border-primary/30 shadow-lg backdrop-blur-md flex items-center gap-3 transform translate-z-10"
                    style={{ transform: "translateZ(80px)" }}
                  >
                    <Layers className="w-6 h-6 text-primary" />
                    <div>
                      <div className="text-xs font-bold text-foreground">
                        Classified
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Invoice Type
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="absolute bottom-6 left-6 right-6 grid grid-cols-2 gap-3">
                  <div className="bg-background/80 p-3 rounded-xl border border-border">
                    <div className="text-[10px] text-muted-foreground mb-1">
                      Confidence
                    </div>
                    <div className="text-sm font-bold text-primary">99.8%</div>
                  </div>
                  <div className="bg-background/80 p-3 rounded-xl border border-border">
                    <div className="text-[10px] text-muted-foreground mb-1">
                      Processing Time
                    </div>
                    <div className="text-sm font-bold text-accent">1.2s</div>
                  </div>
                </div>
              </div>
            </Tilt>
          </motion.div>
        </div>

        {/* Stats Grid at Bottom */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto lg:mx-0 mt-20"
        >
          {stats.map(({ icon: Icon, label, value, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.7 + i * 0.08, duration: 0.5 }}
              whileHover={{ scale: 1.06, y: -4 }}
              className="glass-card rounded-2xl p-5 text-center cursor-default group"
            >
              <motion.div
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                className={`w-8 h-8 mx-auto mb-2 ${color}`}
              >
                <Icon className="w-full h-full" />
              </motion.div>
              <div className="text-2xl font-extrabold text-foreground">
                {value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
              <div className="mt-2 h-0.5 rounded-full bg-gradient-to-r from-transparent via-primary/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
