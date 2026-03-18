import { motion } from "framer-motion";
import { Send, Bot, User } from "lucide-react";
import { useState } from "react";

const sampleConversation = [
  {
    role: "user" as const,
    text: "What is the total amount on invoice INV-2024-4421?",
  },
  {
    role: "assistant" as const,
    text: "Based on the extracted data from **INV-2024-4421**, the total amount is **$14,832.50** (subtotal: $13,250.00 + tax: $1,582.50). The invoice was issued on Dec 12, 2024 by Acme Corp to TechStart Inc.",
  },
  {
    role: "user" as const,
    text: "Are there any anomalies in recent contracts?",
  },
  {
    role: "assistant" as const,
    text: "I found **2 anomalies** across 47 recent contracts:\n\n• **Contract #C-891** — Non-standard liability clause in §4.2 (confidence: 94%)\n• **Contract #C-903** — Unusual termination window of 7 days vs typical 30 days",
  },
];

const RAGSection = () => {
  const [inputValue, setInputValue] = useState("");

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
              Ask Your <span className="text-gradient">Documents</span>
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Retrieval-Augmented Generation lets you query your entire document
              corpus in natural language. Get precise, cited answers backed by
              your own data.
            </p>
            <ul className="space-y-3">
              {[
                "Semantic search across all processed documents",
                "Source citations with confidence scores",
                "Cross-document analysis and comparison",
                "Multi-language query support",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-sm text-muted-foreground"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gradient-brand flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl glow-border overflow-hidden"
          >
            {/* Chat header */}
            <div className="px-5 py-3 border-b border-border/50 flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Document AI Assistant
              </span>
              <span className="ml-auto w-2 h-2 rounded-full bg-success animate-pulse" />
            </div>

            {/* Messages */}
            <div className="p-5 space-y-4 max-h-80 overflow-y-auto">
              {sampleConversation.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm max-w-[85%] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-brand text-primary-foreground"
                        : "glass glow-border text-foreground"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-4 h-4 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="px-5 py-3 border-t border-border/50">
              <div className="flex items-center gap-2 glass rounded-2xl px-4 py-3">
                <input
                  type="text"
                  placeholder="Ask about your documents..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center flex-shrink-0"
                  style={{ boxShadow: "0 0 16px -3px hsl(var(--glow) / 0.4)" }}
                >
                  <Send className="w-4 h-4 text-primary-foreground" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default RAGSection;
