import { motion } from "framer-motion";
import {
  TrendingUp,
  Clock,
  FileCheck,
  AlertTriangle,
  Download,
  MessageSquare,
} from "lucide-react";

const metrics = [
  {
    icon: FileCheck,
    label: "Documents Processed",
    value: "148,392",
    change: "+12.5%",
    positive: true,
  },
  {
    icon: TrendingUp,
    label: "Extraction Accuracy",
    value: "99.2%",
    change: "+0.3%",
    positive: true,
  },
  {
    icon: Clock,
    label: "Avg Processing Time",
    value: "1.4s",
    change: "-18%",
    positive: true,
  },
  {
    icon: AlertTriangle,
    label: "Anomalies Flagged",
    value: "234",
    change: "+5.1%",
    positive: false,
  },
];

const recentDocs = [
  {
    name: "invoice_001.pdf",
    type: "Invoice",
    status: "✅ Complete",
    confidence: "99.8%",
  },
  {
    name: "contract_renewal.pdf",
    type: "Contract",
    status: "⚠️ Review Needed",
    confidence: "97.2%",
  },
  {
    name: "receipt.jpg",
    type: "Receipt",
    status: "⏳ Processing",
    confidence: "—",
  },
  {
    name: "medical_record_anon.pdf",
    type: "Medical",
    status: "✅ Complete",
    confidence: "98.5%",
  },
];

const statusColor: Record<string, string> = {
  "✅ Complete": "text-success",
  "⚠️ Review Needed": "text-warning",
  "⏳ Processing": "text-primary",
};

const DashboardPreview = () => {
  return (
    <section className="py-28 relative overflow-hidden">
      <div
        className="orb orb-purple absolute"
        style={{ width: 500, height: 500, top: "10%", right: "-5%" }}
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
            Live Analytics
          </motion.div>
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-5 text-foreground leading-tight">
            Real-Time <span className="text-gradient-animated">Dashboard</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Monitor processing pipelines, track accuracy, and manage documents
            from a unified command center.
          </p>
        </motion.div>

        {/* Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.04, y: -3 }}
              className="glass-card rounded-3xl p-5 glow-border cursor-default group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-brand/10 flex items-center justify-center">
                  <m.icon className="w-5 h-5 text-primary" />
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    m.positive
                      ? "bg-accent/15 text-accent"
                      : "bg-destructive/15 text-destructive"
                  }`}
                >
                  {m.change}
                </span>
              </div>
              <div className="text-2xl font-extrabold text-foreground">
                {m.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {m.label}
              </div>
              <div className="mt-3 h-0.5 rounded-full bg-gradient-to-r from-primary/40 to-accent/40 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
            </motion.div>
          ))}
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-3xl glow-border overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-border/50 flex justify-between items-center bg-background/50">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              📊 My Documents
              <span className="text-xs font-normal text-muted-foreground ml-2">
                (23 processed this month)
              </span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 bg-muted/20">
                  <th className="text-left py-4 px-6 text-muted-foreground font-semibold">
                    Uploaded Document
                  </th>
                  <th className="text-left py-4 px-6 text-muted-foreground font-semibold">
                    Status
                  </th>
                  <th className="text-right py-4 px-6 text-muted-foreground font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentDocs.map((doc) => (
                  <tr
                    key={doc.name}
                    className="border-b border-border/20 hover:bg-primary/5 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center">
                          <FileCheck className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-mono text-foreground font-medium">
                            {doc.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {doc.type}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td
                      className={`py-4 px-6 font-medium ${statusColor[doc.status]}`}
                    >
                      {doc.status}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {doc.status !== "⏳ Processing" ? (
                          <>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-xs font-medium transition-colors">
                              <Download className="w-3.5 h-3.5" />
                              Download
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 text-xs font-medium transition-colors">
                              <MessageSquare className="w-3.5 h-3.5" />
                              Ask
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground px-3 py-1.5 flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 border-2 border-muted-foreground border-t-primary rounded-full animate-spin"></span>
                            Wait...
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DashboardPreview;
