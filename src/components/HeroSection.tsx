import { motion } from "framer-motion";
import { FileText, Brain, Shield, Zap, ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 grid-pattern opacity-40" />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/5 blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

      <div className="relative z-10 container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass glow-border mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-gradient-brand animate-pulse" />
            <span className="text-sm font-medium text-muted-foreground">Enterprise-Grade Document AI</span>
          </motion.div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            <span className="text-foreground">Intelligent </span>
            <span className="text-gradient">Document</span>
            <br />
            <span className="text-foreground">Processing</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Extract, classify, and analyze documents with AI-powered OCR, NER, and RAG.
            Process 10,000+ documents daily with 99%+ accuracy.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button className="group px-8 py-3.5 rounded-lg bg-gradient-brand text-primary-foreground font-semibold text-base flex items-center gap-2 transition-all hover:shadow-[0_0_30px_-5px_hsl(var(--glow)/0.4)]">
              Start Processing
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button className="px-8 py-3.5 rounded-lg glass glow-border glow-border-hover font-semibold text-base text-foreground transition-all">
              View Documentation
            </button>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            {[
              { icon: FileText, label: "Documents/Day", value: "10K+" },
              { icon: Brain, label: "Extraction Accuracy", value: "99.2%" },
              { icon: Shield, label: "Compliance", value: "HIPAA" },
              { icon: Zap, label: "Processing Time", value: "<2s" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="glass rounded-xl p-4 glow-border text-center">
                <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{value}</div>
                <div className="text-xs text-muted-foreground mt-1">{label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
