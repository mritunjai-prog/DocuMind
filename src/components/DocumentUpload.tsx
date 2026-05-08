import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  MessageSquare,
  Search,
  Bot,
  AlertTriangle,
} from "lucide-react";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

interface DocumentUploadProps {
  initialDocument?: { request_id: string; filename: string } | null;
}

interface ShortlistResult {
  shortlisted: boolean;
  status: string;
  message: string;
  job_role: string;
  match_percentage: number;
  required_skills: string[];
  matched_skills: string[];
  missing_skills: string[];
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  initialDocument,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [result, setResult] = useState<any>(null);

  // Interactive features state
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    "summary" | "ocr" | "ner" | "chat" | "anomalies" | "hr"
  >("summary");
  const [chatQuery, setChatQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { role: string; text: string }[]
  >([]);
  const [isChatting, setIsChatting] = useState(false);
  const [jobRole, setJobRole] = useState("SDE");
  const [requiredSkillsInput, setRequiredSkillsInput] = useState(
    "machine learning, react, js, node, mongodb",
  );
  const [isShortlisting, setIsShortlisting] = useState(false);
  const [shortlistResult, setShortlistResult] =
    useState<ShortlistResult | null>(null);

  const renderTextWithLinks = (text: string) => {
    const parts = text.split(/((?:https?:\/\/|www\.)[^\s]+)/gi);

    return parts.map((part, idx) => {
      if (!part) return null;

      if (/^(?:https?:\/\/|www\.)/i.test(part)) {
        const clean = part.replace(/[),.;]+$/g, "");
        const trailing = part.slice(clean.length);
        const href = clean.startsWith("http") ? clean : `https://${clean}`;

        return (
          <span key={`${clean}-${idx}`}>
            <a
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="underline underline-offset-2 text-primary hover:opacity-80"
            >
              {clean}
            </a>
            {trailing}
          </span>
        );
      }

      return <span key={`txt-${idx}`}>{part}</span>;
    });
  };

  useEffect(() => {
    if (initialDocument) {
      setFile(null);
      setResult(initialDocument);
      setUploadStatus("success");
      fetchAnalysis(initialDocument.request_id);
      setActiveTab("chat");
      setShortlistResult(null);
    }
  }, [initialDocument]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadStatus("idle");
      setResult(null);
      setAnalysisData(null);
      setChatHistory([]);
      setShortlistResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadStatus("idle");

    const formData = new FormData();
    formData.append("files", file); // Must match the backend's 'files' parameter

    const userId = localStorage.getItem("user_id") || "guest_user";

    try {
      const response = await axios.post(
        `${API_BASE_URL}/upload?user_id=${encodeURIComponent(userId)}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      // Backend returns an array, take the first result
      setResult(response.data[0]);
      setUploadStatus("success");

      // Auto-fetch analysis data after upload
      fetchAnalysis(response.data[0].request_id);
    } catch (error) {
      console.error("Upload failed", error);
      setUploadStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  const fetchAnalysis = async (docId: string) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/documents/${docId}/analysis`,
      );
      setAnalysisData(res.data);

      // Auto-poll if still processing
      if (res.data.status !== "completed" && res.data.status !== "failed") {
        setTimeout(() => fetchAnalysis(docId), 3000);
      }
    } catch (err) {
      console.error("Analysis fetch failed", err);
    }
  };

  const handleChat = async () => {
    if (!chatQuery.trim() || !result?.request_id) return;

    const query = chatQuery;
    setChatQuery("");
    setChatHistory((prev) => [...prev, { role: "user", text: query }]);
    setIsChatting(true);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/documents/${result.request_id}/query`,
        {
          query: query,
        },
      );
      setChatHistory((prev) => [
        ...prev,
        { role: "bot", text: res.data.answer },
      ]);
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Sorry, I encountered an error connecting to the RAG engine.",
        },
      ]);
    } finally {
      setIsChatting(false);
    }
  };

  const handleShortlistCheck = async () => {
    if (!result?.request_id) return;

    const skills = requiredSkillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (skills.length === 0) {
      setShortlistResult({
        shortlisted: false,
        status: "invalid_input",
        message: "Please provide at least one required skill.",
        job_role: jobRole,
        match_percentage: 0,
        required_skills: [],
        matched_skills: [],
        missing_skills: [],
      });
      return;
    }

    setIsShortlisting(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/documents/${result.request_id}/shortlist`,
        {
          job_role: jobRole,
          required_skills: skills,
        },
      );
      setShortlistResult(res.data);
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        "Failed to evaluate shortlist criteria. Please try again.";
      setShortlistResult({
        shortlisted: false,
        status: "error",
        message,
        job_role: jobRole,
        match_percentage: 0,
        required_skills: skills,
        matched_skills: [],
        missing_skills: skills,
      });
    } finally {
      setIsShortlisting(false);
    }
  };

  return (
    <section className="relative overflow-hidden w-full">
      <div className="w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card rounded-3xl p-8 glow-border"
        >
          {uploadStatus !== "success" && (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-primary/30 rounded-2xl p-10 bg-primary/5 hover:bg-primary/10 transition-colors">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center justify-center w-full"
              >
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <span className="text-lg font-semibold text-foreground mb-2">
                  Click to upload or drag and drop
                </span>
                <span className="text-sm text-muted-foreground">
                  PDF, PNG, JPG (max. 10MB)
                </span>
              </label>

              {file && (
                <div className="mt-8 flex flex-col items-center w-full">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-background w-full max-w-md border border-border">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium truncate flex-1">
                      {file.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>

                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="mt-6 px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Upload & Process
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Results Area */}
          {uploadStatus === "success" && result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 rounded-2xl bg-success/10 border border-success/30"
            >
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="w-6 h-6 text-success" />
                <h3 className="text-lg font-bold text-success">
                  Upload Complete
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-background/50">
                  <p className="text-xs text-muted-foreground mb-1">
                    Document ID
                  </p>
                  <p className="font-mono text-sm">{result.request_id}</p>
                </div>
                <div className="p-4 rounded-xl bg-background/50">
                  <p className="text-xs text-muted-foreground mb-1">
                    File Name
                  </p>
                  <p className="font-medium text-sm truncate">
                    {result.filename}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-background/50">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <p
                    className={`font-medium text-sm flex items-center gap-2 ${analysisData?.status === "failed" ? "text-destructive" : "text-primary"}`}
                  >
                    {analysisData?.status === "completed" ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-success" />{" "}
                        Completed
                      </>
                    ) : analysisData?.status === "failed" ? (
                      <>
                        <AlertTriangle className="w-4 h-4 text-destructive" />{" "}
                        Failed
                      </>
                    ) : (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Processing
                      </>
                    )}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-background/50">
                  <p className="text-xs text-muted-foreground mb-1">
                    Status Code
                  </p>
                  <p className="font-mono text-sm truncate">200 OK</p>
                </div>
              </div>

              {/* Interactive Tabs */}
              {analysisData && (
                <div className="mt-8 border-t border-border/50 pt-6">
                  <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
                    {["summary", "ocr", "ner", "anomalies", "hr", "chat"].map(
                      (tab) => (
                        <button
                          key={tab}
                          onClick={() => {
                            setActiveTab(tab as any);
                            if (
                              result?.request_id &&
                              analysisData?.status !== "completed"
                            ) {
                              fetchAnalysis(result.request_id);
                            }
                          }}
                          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${
                            activeTab === tab
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground hover:bg-primary/20"
                          }`}
                        >
                          {tab.toUpperCase()}
                        </button>
                      ),
                    )}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="bg-background/80 rounded-2xl p-6 border border-border min-h-[300px]"
                    >
                      {activeTab === "summary" && (
                        <div>
                          <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Bot className="w-5 h-5 text-primary" />
                            AI Document Summary
                          </h4>
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                            {analysisData.summary}
                          </p>
                        </div>
                      )}

                      {activeTab === "ocr" && (
                        <div>
                          <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Extracted Text (OCR)
                          </h4>
                          <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono p-4 bg-muted/30 rounded-xl overflow-auto max-h-[400px]">
                            {analysisData.ocr_text}
                          </pre>
                        </div>
                      )}

                      {activeTab === "ner" && (
                        <div>
                          <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Search className="w-5 h-5 text-primary" />
                            Named Entity Recognition (NER)
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            {analysisData.entities.map(
                              (ent: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex flex-col bg-muted/40 p-3 rounded-lg border border-border"
                                >
                                  <span className="text-xs font-bold text-primary mb-1 uppercase">
                                    {ent.label}
                                  </span>
                                  <span className="text-sm font-medium">
                                    {ent.text}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                      {activeTab === "anomalies" && (
                        <div>
                          <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-warning" />
                            Validation & Anomalies
                          </h4>
                          <div className="flex flex-col gap-3">
                            {analysisData.anomalies &&
                            analysisData.anomalies.length > 0 ? (
                              analysisData.anomalies.map(
                                (anom: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className={`flex p-4 rounded-lg border items-start gap-3 ${
                                      anom.severity === "high"
                                        ? "bg-destructive/10 border-destructive text-destructive"
                                        : anom.severity === "medium"
                                          ? "bg-warning/10 border-warning text-warning"
                                          : "bg-muted/40 border-border"
                                    }`}
                                  >
                                    <AlertTriangle
                                      className={`w-5 h-5 mt-0.5 ${
                                        anom.severity === "high"
                                          ? "text-destructive"
                                          : anom.severity === "medium"
                                            ? "text-warning"
                                            : "text-muted-foreground"
                                      }`}
                                    />
                                    <div>
                                      <span className="text-xs font-bold mb-1 uppercase opacity-70 block">
                                        {anom.type.replace(/_/g, " ")}
                                      </span>
                                      <span className="text-sm font-medium">
                                        {anom.message}
                                      </span>
                                    </div>
                                  </div>
                                ),
                              )
                            ) : (
                              <div className="text-muted-foreground flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-success" />
                                No anomalies or validation errors detected!
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {activeTab === "hr" && (
                        <div className="space-y-5">
                          <h4 className="text-lg font-bold mb-1 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                            HR Shortlisting
                          </h4>

                          <p className="text-sm text-muted-foreground">
                            Define a job role and required skills. The resume
                            will be shortlisted only when all required skills
                            are present.
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-muted-foreground uppercase">
                                Job Role
                              </label>
                              <input
                                type="text"
                                value={jobRole}
                                onChange={(e) => setJobRole(e.target.value)}
                                placeholder="e.g., SDE"
                                className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-muted-foreground uppercase">
                                Required Skills (comma separated)
                              </label>
                              <input
                                type="text"
                                value={requiredSkillsInput}
                                onChange={(e) =>
                                  setRequiredSkillsInput(e.target.value)
                                }
                                placeholder="machine learning, react, js, node, mongodb"
                                className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                              />
                            </div>
                          </div>

                          <button
                            onClick={handleShortlistCheck}
                            disabled={isShortlisting || !result?.request_id}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                          >
                            {isShortlisting ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Evaluating...
                              </>
                            ) : (
                              <>
                                <Search className="w-4 h-4" />
                                Evaluate Shortlist
                              </>
                            )}
                          </button>

                          {shortlistResult && (
                            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                              <div
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase ${
                                  shortlistResult.shortlisted
                                    ? "bg-success/20 text-success"
                                    : "bg-destructive/20 text-destructive"
                                }`}
                              >
                                {shortlistResult.shortlisted ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                  <AlertTriangle className="w-4 h-4" />
                                )}
                                {shortlistResult.shortlisted
                                  ? "Ready to Move Further"
                                  : "Not Shortlisted"}
                              </div>

                              <p className="text-sm text-muted-foreground">
                                {shortlistResult.message}
                              </p>

                              <p className="text-sm">
                                <span className="font-semibold">
                                  Match Score:
                                </span>{" "}
                                {shortlistResult.match_percentage}%
                              </p>

                              <div className="space-y-2">
                                <p className="text-xs font-semibold text-muted-foreground uppercase">
                                  Matched Skills
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {shortlistResult.matched_skills.length > 0 ? (
                                    shortlistResult.matched_skills.map(
                                      (skill, idx) => (
                                        <span
                                          key={`${skill}-${idx}`}
                                          className="px-2 py-1 rounded-full text-xs bg-success/20 text-success"
                                        >
                                          {skill}
                                        </span>
                                      ),
                                    )
                                  ) : (
                                    <span className="text-xs text-muted-foreground">
                                      No matches yet
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <p className="text-xs font-semibold text-muted-foreground uppercase">
                                  Missing Skills
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {shortlistResult.missing_skills.length > 0 ? (
                                    shortlistResult.missing_skills.map(
                                      (skill, idx) => (
                                        <span
                                          key={`${skill}-${idx}`}
                                          className="px-2 py-1 rounded-full text-xs bg-destructive/20 text-destructive"
                                        >
                                          {skill}
                                        </span>
                                      ),
                                    )
                                  ) : (
                                    <span className="text-xs text-success">
                                      All required skills matched
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {activeTab === "chat" && (
                        <div className="flex flex-col h-full min-h-[350px]">
                          <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-primary" />
                            Ask the Document (RAG)
                          </h4>

                          <div className="flex-1 bg-muted/20 rounded-xl p-4 mb-4 overflow-y-auto max-h-[300px] flex flex-col gap-4">
                            {chatHistory.length === 0 ? (
                              <div className="m-auto text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                                <Bot className="w-8 h-8 opacity-50" />
                                <p>Ask any question about this document.</p>
                                <p className="text-xs opacity-70">
                                  Example: "What is the total amount?"
                                </p>
                              </div>
                            ) : (
                              chatHistory.map((msg, idx) => (
                                <div
                                  key={idx}
                                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                  <div
                                    className={`max-w-[80%] p-3 rounded-xl text-sm ${
                                      msg.role === "user"
                                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                                        : "bg-secondary text-secondary-foreground rounded-tl-sm"
                                    }`}
                                  >
                                    <div className="whitespace-pre-line break-words">
                                      {renderTextWithLinks(msg.text)}
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                            {isChatting && (
                              <div className="flex justify-start">
                                <div className="bg-secondary p-3 rounded-xl rounded-tl-sm text-sm flex items-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Thinking...
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={chatQuery}
                              onChange={(e) => setChatQuery(e.target.value)}
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleChat()
                              }
                              placeholder="Ask a question..."
                              className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <button
                              onClick={handleChat}
                              disabled={isChatting || !chatQuery.trim()}
                              className="bg-primary hover:opacity-90 text-primary-foreground p-3 rounded-xl transition-opacity disabled:opacity-50"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}

          {uploadStatus === "success" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 flex justify-center"
            >
              <button
                onClick={() => {
                  setFile(null);
                  setUploadStatus("idle");
                  setResult(null);
                  setAnalysisData(null);
                  setChatHistory([]);
                  setShortlistResult(null);
                  setActiveTab("summary");
                }}
                className="px-6 py-2 rounded-full border border-primary text-primary font-semibold hover:bg-primary/10 transition-colors"
                title="Upload another document"
              >
                Upload New Document
              </button>
            </motion.div>
          )}

          {uploadStatus === "error" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 rounded-2xl bg-destructive/10 border border-destructive/30"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-destructive" />
                <p className="text-destructive font-medium">
                  Failed to process document. Please try again.
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default DocumentUpload;
