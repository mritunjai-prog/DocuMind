import { motion } from "framer-motion";
import {
  Upload,
  Cpu,
  CheckCircle2,
  Database,
  ChevronRight,
} from "lucide-react";

const steps = [
  {
    icon: Upload,
    label: "Ingest",
    description: "Upload PDFs, scans, images",
    color: "text-cyan-400",
    bg: "from-cyan-500 to-blue-500",
    num: "01",
  },
  {
    icon: Cpu,
    label: "Process",
    description: "OCR + NER + Classification",
    color: "text-violet-400",
    bg: "from-violet-500 to-purple-500",
    num: "02",
  },
  {
    icon: CheckCircle2,
    label: "Validate",
    description: "Rules engine + anomaly check",
    color: "text-emerald-400",
    bg: "from-emerald-500 to-teal-500",
    num: "03",
  },
  {
    icon: Database,
    label: "Store & Query",
    description: "Structured data + RAG index",
    color: "text-amber-400",
    bg: "from-amber-500 to-orange-500",
    num: "04",
  },
];

const PipelineSection = () => {
  return (
    <section className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-15" />
      <div
        className="orb orb-accent absolute"
        style={{ width: 400, height: 400, bottom: "0", left: "5%" }}
      />
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass glow-border mb-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            4-Stage Pipeline
          </motion.div>
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-5 text-foreground leading-tight">
            Processing <span className="text-gradient-animated">Pipeline</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Documents flow through four intelligent stages — from raw input to
            queryable knowledge.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-stretch justify-center gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: i * 0.12,
                duration: 0.6,
                ease: [0.23, 1, 0.32, 1],
              }}
              className="flex lg:flex-row items-center gap-3 lg:gap-0"
            >
              <motion.div
                whileHover={{ scale: 1.04, y: -4 }}
                className="glass-card rounded-3xl p-7 glow-border text-center w-full lg:w-52 group cursor-default relative overflow-hidden"
              >
                <div className="absolute top-3 right-4 text-4xl font-black text-foreground/5 select-none">
                  {step.num}
                </div>
                <motion.div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.bg} flex items-center justify-center mx-auto mb-4 shadow-lg`}
                  animate={{ rotate: [0, 3, -3, 0] }}
                  transition={{ duration: 5, repeat: Infinity, delay: i * 0.8 }}
                >
                  <step.icon className="w-7 h-7 text-white" />
                </motion.div>
                <div className="font-bold text-foreground text-lg mb-1">
                  {step.label}
                </div>
                <div className="text-xs text-muted-foreground leading-relaxed">
                  {step.description}
                </div>
                <div
                  className={`mt-4 h-0.5 rounded-full bg-gradient-to-r ${step.bg} opacity-0 group-hover:opacity-70 scale-x-0 group-hover:scale-x-100 origin-center transition-all duration-500`}
                />
              </motion.div>
              {i < steps.length - 1 && (
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                  className="hidden lg:flex mx-3 flex-shrink-0 text-primary/30"
                >
                  <ChevronRight className="w-6 h-6" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Live demo card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-20 max-w-4xl mx-auto glass-card rounded-3xl glow-border overflow-hidden"
        >
          <div className="flex items-center gap-2 px-6 py-3 border-b border-border/50">
            <div className="w-3 h-3 rounded-full bg-destructive/60" />
            <div className="w-3 h-3 rounded-full bg-warning/60" />
            <div className="w-3 h-3 rounded-full bg-success/60" />
            <span className="text-xs text-muted-foreground ml-3 font-mono">
              document-processor.ts
            </span>
          </div>
          <div className="p-6 font-mono text-sm leading-relaxed">
            <div className="text-muted-foreground">
              <span className="text-primary">const</span> result ={" "}
              <span className="text-primary">await</span> pipeline.
              <span className="text-accent">process</span>(&#123;
            </div>
            <div className="pl-6 text-muted-foreground">
              document:{" "}
              <span className="text-warning">"invoice_2024_q4.pdf"</span>,
            </div>
            <div className="pl-6 text-muted-foreground">
              extractors: [<span className="text-warning">"NER"</span>,{" "}
              <span className="text-warning">"table"</span>,{" "}
              <span className="text-warning">"classification"</span>],
            </div>
            <div className="pl-6 text-muted-foreground">
              validate: <span className="text-primary">true</span>,
            </div>
            <div className="pl-6 text-muted-foreground">
              indexForRAG: <span className="text-primary">true</span>,
            </div>
            <div className="text-muted-foreground">&#125;);</div>
            <div className="mt-3 text-muted-foreground">
              <span className="text-success">
                // ✓ Extracted 47 fields | 99.4% confidence | 1.2s
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PipelineSection;
