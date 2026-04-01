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
  const hasShownToast = useRef(false);
  const previousSessionId = useRef<string | null>(null);

  useEffect(() => {
    // Process Supabase OAuth and save session using the reliable auth listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);

        if (session) {
          const userId = session.user?.id;
          const currentSessionId = session.user?.user_metadata?.sub || userId;

          // Show welcome toast if this is a fresh login (new session we haven't greeted yet)
          if (
            !hasShownToast.current &&
            currentSessionId &&
            previousSessionId.current !== currentSessionId
          ) {
            console.log("New session detected, showing welcome toast");
            hasShownToast.current = true;

            // Tell the user they hit success!
            setTimeout(() => {
              console.log("Toast is displaying now");
              toast({
                title: "Logged in successfully",
                description: `Welcome back, ${session.user.user_metadata?.full_name || session.user.email}!`,
                duration: 8000, // 8 seconds so you can definitely see it
              });
            }, 300); // Small delay to ensure visible
          }

          previousSessionId.current = currentSessionId;

          // Save legacy local variables so old backend fetching logic doesn't break
          if (userId) {
            console.log("Saving user session to localStorage:", userId);
            localStorage.setItem("user_id", userId);
            localStorage.setItem("user_token", session.access_token);

            // Trigger a quick event so other components know the user ID changed
            window.dispatchEvent(new Event("storage"));
          }
        } else if (event === "SIGNED_OUT") {
          // User signed out explicitly
          console.log("User signed out, redirecting to login");
          hasShownToast.current = false;
          previousSessionId.current = null;
          navigate("/login");
        }
      },
    );

    // Also run a manual check just in case the event already fired before mount
    const manualCheck = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        console.log("Manual check: no session found, redirecting to login");
        navigate("/login");
      } else if (data.session) {
        console.log(
          "Manual check: session found for user",
          data.session.user.email,
        );
      }
    };

    // Delay the manual check to let onAuthStateChange finish processing first
    const timer = setTimeout(manualCheck, 100);

    return () => {
      clearTimeout(timer);
      authListener.subscription.unsubscribe();
    };
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
