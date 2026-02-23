import { motion } from "framer-motion";
import { Upload, Cpu, CheckCircle2, Database, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Upload,
    label: "Ingest",
    description: "Upload PDFs, scans, images",
    color: "text-primary",
  },
  {
    icon: Cpu,
    label: "Process",
    description: "OCR + NER + Classification",
    color: "text-primary",
  },
  {
    icon: CheckCircle2,
    label: "Validate",
    description: "Rules engine + anomaly check",
    color: "text-accent",
  },
  {
    icon: Database,
    label: "Store & Query",
    description: "Structured data + RAG index",
    color: "text-accent",
  },
];

const PipelineSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
            Processing <span className="text-gradient">Pipeline</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Documents flow through four intelligent stages — from raw input to queryable knowledge.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-0">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="flex items-center gap-4"
            >
              <div className="glass-strong rounded-2xl p-6 glow-border text-center w-52">
                <step.icon className={`w-8 h-8 mx-auto mb-3 ${step.color}`} />
                <div className="font-semibold text-foreground text-lg mb-1">{step.label}</div>
                <div className="text-xs text-muted-foreground">{step.description}</div>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="hidden lg:block w-6 h-6 text-primary/40 mx-2 flex-shrink-0" />
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
          className="mt-20 max-w-4xl mx-auto glass-strong rounded-2xl glow-border overflow-hidden"
        >
          <div className="flex items-center gap-2 px-6 py-3 border-b border-border/50">
            <div className="w-3 h-3 rounded-full bg-destructive/60" />
            <div className="w-3 h-3 rounded-full bg-warning/60" />
            <div className="w-3 h-3 rounded-full bg-success/60" />
            <span className="text-xs text-muted-foreground ml-3 font-mono">document-processor.ts</span>
          </div>
          <div className="p-6 font-mono text-sm leading-relaxed">
            <div className="text-muted-foreground">
              <span className="text-primary">const</span> result = <span className="text-primary">await</span> pipeline.<span className="text-accent">process</span>(&#123;
            </div>
            <div className="pl-6 text-muted-foreground">
              document: <span className="text-warning">"invoice_2024_q4.pdf"</span>,
            </div>
            <div className="pl-6 text-muted-foreground">
              extractors: [<span className="text-warning">"NER"</span>, <span className="text-warning">"table"</span>, <span className="text-warning">"classification"</span>],
            </div>
            <div className="pl-6 text-muted-foreground">
              validate: <span className="text-primary">true</span>,
            </div>
            <div className="pl-6 text-muted-foreground">
              indexForRAG: <span className="text-primary">true</span>,
            </div>
            <div className="text-muted-foreground">&#125;);</div>
            <div className="mt-3 text-muted-foreground">
              <span className="text-success">// ✓ Extracted 47 fields | 99.4% confidence | 1.2s</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PipelineSection;
