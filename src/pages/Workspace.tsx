import { useState, useEffect } from "react";
import DocumentUpload from "@/components/DocumentUpload";
import DashboardPreview from "@/components/DashboardPreview";
import { motion, AnimatePresence } from "framer-motion";
import { Preloader } from "@/components/Preloader";

const Workspace = () => {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <AnimatePresence>
        {loading && <Preloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.8 }}
        className="min-h-screen bg-background pt-24 pb-12"
      >
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Header */}
          <div className="mb-10 text-center md:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-extrabold text-foreground mb-4"
            >
              Your <span className="text-gradient-animated">Workspace</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-2xl"
            >
              Upload new documents, run the ML extraction pipelines, and chat
              with your files using the integrated RAG engine.
            </motion.p>
          </div>

          {/* Upload Component */}
          <div className="mb-12">
            {/* We reuse the DocumentUpload component but it shouldn't contain the "Try DocuMind Now" title inside it. */}
            <DocumentUpload />
          </div>

          {/* Dashboard Component */}
          <div>
            <DashboardPreview />
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Workspace;
