import { motion } from "framer-motion";
import { TrendingUp, Clock, FileCheck, AlertTriangle } from "lucide-react";

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
  { name: "invoice_Q4_2025.pdf", type: "Invoice", status: "Processed", confidence: "99.8%" },
  { name: "contract_renewal.pdf", type: "Contract", status: "Validating", confidence: "97.2%" },
  { name: "medical_record_anon.pdf", type: "Medical", status: "Processed", confidence: "98.5%" },
  { name: "tax_return_2025.pdf", type: "Tax", status: "Processing", confidence: "—" },
  { name: "insurance_claim_44.pdf", type: "Insurance", status: "Processed", confidence: "99.1%" },
];

const statusColor: Record<string, string> = {
  Processed: "text-success",
  Validating: "text-warning",
  Processing: "text-primary",
};

const DashboardPreview = () => {
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
            Real-Time <span className="text-gradient">Dashboard</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Monitor processing pipelines, track accuracy, and manage documents from a unified command center.
          </p>
        </motion.div>

        {/* Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {metrics.map((m) => (
            <div key={m.label} className="glass rounded-xl p-5 glow-border">
              <div className="flex items-center justify-between mb-3">
                <m.icon className="w-5 h-5 text-primary" />
                <span className={`text-xs font-medium ${m.positive ? "text-success" : "text-destructive"}`}>
                  {m.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-foreground">{m.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{m.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="glass-strong rounded-2xl glow-border overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-border/50">
            <h3 className="font-semibold text-foreground">Recent Documents</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left py-3 px-6 text-muted-foreground font-medium">Document</th>
                  <th className="text-left py-3 px-6 text-muted-foreground font-medium">Type</th>
                  <th className="text-left py-3 px-6 text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-3 px-6 text-muted-foreground font-medium">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {recentDocs.map((doc) => (
                  <tr key={doc.name} className="border-b border-border/20 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-6 font-mono text-foreground">{doc.name}</td>
                    <td className="py-3 px-6">
                      <span className="px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                        {doc.type}
                      </span>
                    </td>
                    <td className={`py-3 px-6 font-medium ${statusColor[doc.status]}`}>{doc.status}</td>
                    <td className="py-3 px-6 text-muted-foreground font-mono">{doc.confidence}</td>
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
