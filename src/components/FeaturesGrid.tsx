import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { MouseEvent, useRef } from "react";
import {
  FileSearch,
  Brain,
  ShieldCheck,
  AlertTriangle,
  MessageSquare,
  BarChart3,
  Upload,
  Layers,
} from "lucide-react";

const features = [
  {
    icon: FileSearch,
    title: "OCR & Text Extraction",
    description:
      "Multi-format document reading with advanced OCR for PDFs, scans, and handwritten content.",
    color: "from-cyan-500/20 to-blue-500/20",
    iconBg: "from-cyan-500 to-blue-500",
  },
  {
    icon: Layers,
    title: "Auto Classification",
    description:
      "AI-powered document type detection — invoices, contracts, receipts, medical records.",
    color: "from-violet-500/20 to-purple-500/20",
    iconBg: "from-violet-500 to-purple-500",
  },
  {
    icon: Brain,
    title: "Named Entity Recognition",
    description:
      "Extract structured fields like dates, amounts, parties, and clauses automatically.",
    color: "from-emerald-500/20 to-teal-500/20",
    iconBg: "from-emerald-500 to-teal-500",
  },
  {
    icon: ShieldCheck,
    title: "Data Validation",
    description:
      "Validate extracted data against compliance rules with configurable validation pipelines.",
    color: "from-sky-500/20 to-cyan-500/20",
    iconBg: "from-sky-500 to-cyan-500",
  },
  {
    icon: AlertTriangle,
    title: "Anomaly Detection",
    description:
      "Flag suspicious clauses, unusual amounts, and potential compliance violations.",
    color: "from-orange-500/20 to-red-500/20",
    iconBg: "from-orange-500 to-red-500",
  },
  {
    icon: MessageSquare,
    title: "RAG-Powered Q&A",
    description:
      "Ask natural language questions over your document corpus with contextual answers.",
    color: "from-pink-500/20 to-rose-500/20",
    iconBg: "from-pink-500 to-rose-500",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Real-time processing metrics, accuracy tracking, and document pipeline insights.",
    color: "from-amber-500/20 to-yellow-500/20",
    iconBg: "from-amber-500 to-yellow-500",
  },
  {
    icon: Upload,
    title: "Batch Processing",
    description:
      "Upload thousands of documents simultaneously with parallel processing pipelines.",
    color: "from-lime-500/20 to-green-500/20",
    iconBg: "from-lime-500 to-green-500",
  },
];

const Feature3DCard = ({
  f,
  index,
}: {
  f: (typeof features)[0];
  index: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const cfg = { stiffness: 250, damping: 30 };
  const rx = useSpring(useTransform(rawY, [-0.5, 0.5], [8, -8]), cfg);
  const ry = useSpring(useTransform(rawX, [-0.5, 0.5], [-8, 8]), cfg);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    rawX.set((e.clientX - r.left) / r.width - 0.5);
    rawY.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        delay: index * 0.07,
        duration: 0.6,
        ease: [0.23, 1, 0.32, 1],
      }}
      style={{ perspective: 900 }}
    >
      <motion.div
        ref={ref}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        whileHover={{ z: 20 }}
        className="glass-card rounded-3xl p-6 cursor-default group h-full relative overflow-hidden transition-shadow duration-300 hover:glow-strong"
      >
        {/* Gradient background layer */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500`}
        />

        {/* Shimmer beam on hover */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/8 to-transparent skew-x-[-15deg] group-hover:animate-beam" />
        </div>

        <div className="relative z-10">
          {/* Icon */}
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.15 }}
            transition={{ duration: 0.5 }}
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.iconBg} flex items-center justify-center mb-5 shadow-lg`}
          >
            <f.icon className="w-6 h-6 text-white" />
          </motion.div>

          <h3 className="font-bold text-foreground text-lg mb-2 leading-tight">
            {f.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {f.description}
          </p>

          {/* Bottom line */}
          <div
            className={`mt-5 h-0.5 rounded-full bg-gradient-to-r ${f.iconBg} opacity-0 group-hover:opacity-60 transition-all duration-500 scale-x-0 group-hover:scale-x-100 origin-left`}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

const FeaturesGrid = () => {
  return (
    <section className="py-28 relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 dot-pattern opacity-20" />
      <div
        className="orb orb-primary absolute"
        style={{ width: 500, height: 500, top: "0%", right: "10%" }}
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
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Full Feature Suite
          </motion.div>
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-5 text-foreground leading-tight">
            Complete Processing{" "}
            <span className="text-gradient-animated">Pipeline</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            End-to-end document intelligence from raw ingestion to actionable
            insights.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <Feature3DCard key={f.title} f={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
