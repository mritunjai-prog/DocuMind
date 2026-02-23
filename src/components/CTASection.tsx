import { motion } from "framer-motion";
import { Building2, Scale, Stethoscope, Receipt, Calculator } from "lucide-react";

const industries = [
  { icon: Building2, label: "Finance", desc: "Invoice & payment processing" },
  { icon: Scale, label: "Legal", desc: "Contract analysis & review" },
  { icon: Stethoscope, label: "Healthcare", desc: "Medical record extraction" },
  { icon: Receipt, label: "Insurance", desc: "Claims processing" },
  { icon: Calculator, label: "Accounting", desc: "Tax document automation" },
];

const CTASection = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        {/* Industries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
            Built for <span className="text-gradient">Every Industry</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-12">
            Pre-configured templates and extraction models for the most demanding document workflows.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {industries.map((ind) => (
              <div key={ind.label} className="glass rounded-xl px-6 py-4 glow-border glow-border-hover transition-all flex items-center gap-3 cursor-default">
                <ind.icon className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <div className="font-semibold text-foreground text-sm">{ind.label}</div>
                  <div className="text-xs text-muted-foreground">{ind.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-strong rounded-3xl glow-border p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-brand opacity-[0.03]" />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
              Ready to Automate Your Document Workflow?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Reduce manual data entry by 90% and process documents with enterprise-grade accuracy.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="px-8 py-3.5 rounded-lg bg-gradient-brand text-primary-foreground font-semibold hover:shadow-[0_0_30px_-5px_hsl(var(--glow)/0.4)] transition-all">
                Request Demo
              </button>
              <button className="px-8 py-3.5 rounded-lg glass glow-border glow-border-hover font-semibold text-foreground transition-all">
                View API Docs
              </button>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border/30 text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 DocuMind AI — Intelligent Document Processing. All rights reserved.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
