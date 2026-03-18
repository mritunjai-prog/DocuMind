import { useState, useEffect, useRef, MouseEvent } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import {
  Eye,
  EyeOff,
  FileText,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  Sun,
  Moon,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import Tilt from "react-parallax-tilt";

/* ── floating particle ── */
const Particle = ({
  delay,
  duration,
  x,
  size,
  color,
}: {
  delay: number;
  duration: number;
  x: number;
  size: number;
  color: string;
}) => (
  <div
    className="absolute bottom-0 rounded-full pointer-events-none"
    style={{
      left: `${x}%`,
      width: size,
      height: size,
      background: color,
      animation: `particle-drift ${duration}s linear ${delay}s infinite`,
      filter: "blur(1px)",
    }}
  />
);

/* ── 3-D tilt card using react-parallax-tilt ── */
const TiltCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <Tilt
      tiltMaxAngleX={8}
      tiltMaxAngleY={8}
      perspective={1000}
      transitionSpeed={1500}
      scale={1.02}
      glareEnable={true}
      glareMaxOpacity={0.15}
      glareColor="#ffffff"
      glarePosition="all"
      glareBorderRadius="1.5rem"
      className={`relative ${className}`}
    >
      {children}
    </Tilt>
  );
};

/* ── orbiting ring ── */
const Ring = ({
  radius,
  duration,
  reverse,
  color,
  dash,
}: {
  radius: number;
  duration: number;
  reverse?: boolean;
  color: string;
  dash?: string;
}) => (
  <div
    className="absolute inset-0 m-auto rounded-full pointer-events-none"
    style={{
      width: radius * 2,
      height: radius * 2,
      border: `1px ${dash || "solid"} ${color}`,
      animation: `${reverse ? "spin-reverse" : "spin-slow"} ${duration}s linear infinite`,
    }}
  />
);

/* ── orbiting dot ── */
const OrbDot = ({
  radius,
  duration,
  delay,
  color,
  reverse,
}: {
  radius: number;
  duration: number;
  delay?: number;
  color: string;
  reverse?: boolean;
}) => (
  <div
    className="absolute"
    style={{
      top: "50%",
      left: "50%",
      marginTop: -radius,
      marginLeft: -4,
      width: 8,
      height: 8,
      transformOrigin: `4px ${radius}px`,
      animation: `${reverse ? "spin-reverse" : "spin-slow"} ${duration}s linear ${delay ?? 0}s infinite`,
    }}
  >
    <div
      className="w-2 h-2 rounded-full"
      style={{ background: color, boxShadow: `0 0 8px ${color}` }}
    />
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState<"email" | "pass" | null>(null);

  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    delay: Math.random() * 10,
    duration: 8 + Math.random() * 12,
    x: Math.random() * 100,
    size: 2 + Math.random() * 6,
    color:
      i % 3 === 0
        ? "hsl(187 85% 53% / 0.7)"
        : i % 3 === 1
          ? "hsl(160 84% 45% / 0.6)"
          : "hsl(280 80% 65% / 0.5)",
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setLoading(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center perspective">
      {/* ── Theme toggle ── */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        onClick={toggleTheme}
        className="fixed top-5 right-5 z-50 w-10 h-10 rounded-full glass glow-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        {theme === "dark" ? (
          <Sun className="w-4 h-4" />
        ) : (
          <Moon className="w-4 h-4" />
        )}
      </motion.button>

      {/* ── Animated background ── */}
      <div className="absolute inset-0">
        <div className="dot-pattern absolute inset-0 opacity-30" />

        {/* Large morphing orbs */}
        <motion.div
          className="orb orb-primary"
          style={{ width: 700, height: 700, top: "-20%", left: "-15%" }}
          animate={{ scale: [1, 1.15, 1], rotate: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="orb orb-accent"
          style={{ width: 600, height: 600, bottom: "-15%", right: "-10%" }}
          animate={{ scale: [1.1, 1, 1.1], rotate: [0, -25, 0] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className="orb orb-purple"
          style={{ width: 400, height: 400, top: "30%", right: "10%" }}
          animate={{ scale: [1, 1.2, 1], y: [0, -40, 0] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />

        {/* Floating particles */}
        {particles.map((p) => (
          <Particle key={p.id} {...p} />
        ))}

        {/* Grid */}
        <div className="grid-pattern absolute inset-0 opacity-20" />
      </div>

      {/* ── Split layout ── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 flex items-center gap-16">
        {/* ── Left: 3D Orbital Showcase ── */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
          className="hidden lg:flex flex-col items-center justify-center flex-1"
        >
          {/* Orbital system */}
          <div className="relative w-80 h-80 flex items-center justify-center mb-10">
            {/* Center pulsing core */}
            <div className="relative z-10">
              <motion.div
                className="w-20 h-20 rounded-2xl bg-gradient-brand flex items-center justify-center"
                animate={{
                  boxShadow: [
                    "0 0 30px -5px hsl(187 85% 53% / 0.5)",
                    "0 0 70px -5px hsl(187 85% 53% / 0.9)",
                    "0 0 30px -5px hsl(187 85% 53% / 0.5)",
                  ],
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <FileText className="w-9 h-9 text-primary-foreground" />
              </motion.div>
              {/* Ping ring */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-brand animate-ping-slow opacity-30" />
            </div>

            {/* Rings */}
            <Ring radius={80} duration={18} color="hsl(187 85% 53% / 0.25)" />
            <Ring
              radius={110}
              duration={12}
              reverse
              color="hsl(160 84% 45% / 0.2)"
              dash="dashed"
            />
            <Ring radius={138} duration={22} color="hsl(280 80% 65% / 0.15)" />

            {/* Orbiting dots */}
            <OrbDot radius={80} duration={4} color="hsl(187 85% 53%)" />
            <OrbDot
              radius={80}
              duration={4}
              delay={2}
              color="hsl(187 85% 60%)"
              reverse
            />
            <OrbDot
              radius={110}
              duration={6}
              delay={1}
              color="hsl(160 84% 45%)"
              reverse
            />
            <OrbDot radius={138} duration={9} color="hsl(280 80% 65%)" />
            <OrbDot
              radius={138}
              duration={9}
              delay={4.5}
              color="hsl(280 80% 75%)"
            />

            {/* Floating feature badges */}
            {[
              { label: "OCR", icon: "📄", angle: 30, r: 158 },
              { label: "NER", icon: "🧠", angle: 150, r: 158 },
              { label: "RAG", icon: "⚡", angle: 270, r: 158 },
            ].map(({ label, icon, angle, r }) => {
              const rad = (angle * Math.PI) / 180;
              return (
                <motion.div
                  key={label}
                  className="absolute glass rounded-xl px-3 py-1.5 text-xs font-semibold text-foreground flex items-center gap-1.5 glow-border"
                  style={{
                    left: `calc(50% + ${Math.cos(rad) * r}px - 32px)`,
                    top: `calc(50% + ${Math.sin(rad) * r}px - 16px)`,
                  }}
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    duration: 3 + angle / 100,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl font-extrabold mb-3 text-gradient-animated">
              DocuMind AI
            </h2>
            <p className="text-muted-foreground max-w-xs mx-auto text-sm leading-relaxed">
              Enterprise-grade intelligent document processing with RAG, OCR &
              real-time extraction.
            </p>

            {/* Live stats */}
            <div className="flex items-center gap-6 justify-center mt-6">
              {[
                { label: "Accuracy", value: "99.2%" },
                { label: "Docs/Day", value: "10K+" },
                { label: "Uptime", value: "99.9%" },
              ].map(({ label, value }) => (
                <motion.div
                  key={label}
                  whileHover={{ scale: 1.05 }}
                  className="glass rounded-2xl px-4 py-3 text-center glow-border"
                >
                  <div className="text-lg font-bold text-gradient">{value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* ── Right: 3D Tilt Login Card ── */}
        <div className="flex-1 max-w-md w-full mx-auto">
          <TiltCard className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
              className="glass-card rounded-3xl p-8 relative overflow-hidden"
            >
              {/* Top shimmer bar */}
              <div className="absolute top-0 left-0 right-0 h-[1px]">
                <div
                  className="h-full rounded-t-3xl bg-gradient-to-r from-transparent via-primary/70 to-transparent"
                  style={{
                    animation: "shimmer 3s linear infinite",
                    backgroundSize: "200% auto",
                  }}
                />
              </div>

              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3 mb-8"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center animate-glow-pulse">
                  <FileText className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-bold text-foreground text-lg">
                    DocuMind
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Welcome back
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-xs text-accent font-medium">Live</span>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-extrabold text-foreground mb-1"
              >
                Sign in
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-muted-foreground text-sm mb-8"
              >
                Access your intelligent document workspace
              </motion.p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 }}
                  className="relative group"
                >
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Email
                  </label>
                  <div
                    className={`relative flex items-center rounded-2xl border transition-all duration-300 ${
                      focus === "email"
                        ? "border-primary/60 shadow-[0_0_0_3px_hsl(var(--glow)/0.15)]"
                        : "border-border/50"
                    } glass`}
                  >
                    <Mail className="w-4 h-4 text-muted-foreground ml-4 flex-shrink-0" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocus("email")}
                      onBlur={() => setFocus(null)}
                      placeholder="you@company.com"
                      className="w-full bg-transparent px-3 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                      required
                    />
                  </div>
                </motion.div>

                {/* Password */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.65 }}
                  className="relative group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Password
                    </label>
                    <a
                      href="#"
                      className="text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div
                    className={`relative flex items-center rounded-2xl border transition-all duration-300 ${
                      focus === "pass"
                        ? "border-primary/60 shadow-[0_0_0_3px_hsl(var(--glow)/0.15)]"
                        : "border-border/50"
                    } glass`}
                  >
                    <Lock className="w-4 h-4 text-muted-foreground ml-4 flex-shrink-0" />
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocus("pass")}
                      onBlur={() => setFocus(null)}
                      placeholder="••••••••••"
                      className="w-full bg-transparent px-3 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="mr-4 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPass ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </motion.div>

                {/* Submit */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75 }}
                >
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-smooth w-full py-3.5 rounded-2xl bg-gradient-brand text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 relative overflow-hidden"
                    style={{
                      boxShadow: "0 4px 24px -4px hsl(var(--glow) / 0.45)",
                    }}
                  >
                    <AnimatePresence mode="wait">
                      {loading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <div className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                          <span>Signing in...</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="idle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Sign in to DocuMind</span>
                          <ArrowRight className="w-4 h-4" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </motion.div>

                {/* Divider */}
                <div className="flex items-center gap-3 my-2">
                  <div className="flex-1 h-px bg-border/50" />
                  <span className="text-xs text-muted-foreground">
                    or continue with
                  </span>
                  <div className="flex-1 h-px bg-border/50" />
                </div>

                {/* Social */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Google", icon: "G" },
                    { label: "Microsoft", icon: "M" },
                  ].map(({ label, icon }) => (
                    <motion.button
                      key={label}
                      type="button"
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      className="py-3 rounded-2xl glass glow-border glow-border-hover text-sm font-semibold text-foreground flex items-center justify-center gap-2 transition-all"
                    >
                      <span className="font-bold text-primary">{icon}</span>
                      {label}
                    </motion.button>
                  ))}
                </div>
              </form>

              {/* Footer */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-center text-xs text-muted-foreground mt-6"
              >
                Don't have an account?{" "}
                <Link
                  to="/"
                  className="text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  Request access
                </Link>
              </motion.p>

              {/* Bottom shimmer bar */}
              <div className="absolute bottom-0 left-0 right-0 h-[1px]">
                <div
                  className="h-full rounded-b-3xl bg-gradient-to-r from-transparent via-accent/50 to-transparent"
                  style={{
                    animation: "shimmer 4s linear infinite reverse",
                    backgroundSize: "200% auto",
                  }}
                />
              </div>
            </motion.div>
          </TiltCard>

          {/* Security badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex items-center justify-center gap-2 mt-5 text-xs text-muted-foreground"
          >
            <Lock className="w-3 h-3 text-accent" />
            <span>
              256-bit SSL encryption · HIPAA compliant · SOC 2 Type II
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
