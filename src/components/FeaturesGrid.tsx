import { motion } from "framer-motion";
import {
  FileSearch, Brain, ShieldCheck, AlertTriangle,
  MessageSquare, BarChart3, Upload, Layers
} from "lucide-react";

const features = [
  {
    icon: FileSearch,
    title: "OCR & Text Extraction",
    description: "Multi-format document reading with advanced OCR for PDFs, scans, and handwritten content.",
  },
  {
    icon: Layers,
    title: "Auto Classification",
    description: "AI-powered document type detection — invoices, contracts, receipts, medical records.",
  },
  {
    icon: Brain,
    title: "Named Entity Recognition",
    description: "Extract structured fields like dates, amounts, parties, and clauses automatically.",
  },
  {
    icon: ShieldCheck,
    title: "Data Validation",
    description: "Validate extracted data against compliance rules with configurable validation pipelines.",
  },
  {
    icon: AlertTriangle,
    title: "Anomaly Detection",
    description: "Flag suspicious clauses, unusual amounts, and potential compliance violations.",
  },
  {
    icon: MessageSquare,
    title: "RAG-Powered Q&A",
    description: "Ask natural language questions over your document corpus with contextual answers.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Real-time processing metrics, accuracy tracking, and document pipeline insights.",
  },
  {
    icon: Upload,
    title: "Batch Processing",
    description: "Upload thousands of documents simultaneously with parallel processing pipelines.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const FeaturesGrid = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
            Complete Processing <span className="text-gradient">Pipeline</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            End-to-end document intelligence from ingestion to actionable insights.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              className="glass rounded-xl p-6 glow-border glow-border-hover transition-all group cursor-default"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-brand flex items-center justify-center mb-4 group-hover:shadow-[0_0_20px_-3px_hsl(var(--glow)/0.3)] transition-shadow">
                <f.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
