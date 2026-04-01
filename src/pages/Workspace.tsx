import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import DocumentUpload from "@/components/DocumentUpload";
import DashboardPreview from "@/components/DashboardPreview";
import { motion, AnimatePresence } from "framer-motion";
import { Preloader } from "@/components/Preloader";

const Workspace = () => {
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<{
    request_id: string;
    filename: string;
  } | null>(null);
  const uploadRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Process Supabase OAuth hash and save session
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session) {
        const userId = session.user?.id;
        
        // If we just got the token from the URL hash, let's notify the user
        const hash = window.location.hash;
        if (hash && hash.includes("access_token")) {
          // Tell the user they hit success!
          toast({
            title: "Logged in successfully",
            description: `Welcome back, ${session.user.user_metadata?.full_name || session.user.email}!`,
          });
          
          // Clean the URL so the huge token string disappears from the browser bar
          window.history.replaceState(null, "", window.location.pathname);
        }

        // Save legacy local variables so old backend fetching logic doesn't break
        if (userId) {
          localStorage.setItem("user_id", userId);
          localStorage.setItem("user_token", session.access_token);
        }
      } else if (!window.location.hash.includes("access_token")) {
        // No session and no incoming token -> redirect to login
        navigate("/login");
      }
    };

    checkSession();
  }, [navigate, toast]);

  const handleOpenDocument = (doc: any) => {
    setSelectedDoc({ request_id: doc.id, filename: doc.filename });
    if (uploadRef.current) {
      uploadRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

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
          <div className="mb-12" ref={uploadRef}>
            {/* We reuse the DocumentUpload component but it shouldn't contain the "Try DocuMind Now" title inside it. */}
            <DocumentUpload initialDocument={selectedDoc} />
          </div>

          {/* Dashboard Component */}
          <div>
            <DashboardPreview onOpenDocument={handleOpenDocument} />
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Workspace;
