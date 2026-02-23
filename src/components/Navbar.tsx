import { motion } from "framer-motion";
import { FileText, Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = ["Features", "Pipeline", "Dashboard", "RAG", "Industries"];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass-strong"
    >
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground">DocuMind</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link} href={`#${link.toLowerCase()}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {link}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
            Sign In
          </button>
          <button className="text-sm px-5 py-2 rounded-lg bg-gradient-brand text-primary-foreground font-medium hover:shadow-[0_0_20px_-3px_hsl(var(--glow)/0.3)] transition-all">
            Get Started
          </button>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden px-6 pb-4 space-y-3 border-t border-border/30">
          {navLinks.map((link) => (
            <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setOpen(false)} className="block text-sm text-muted-foreground py-2">
              {link}
            </a>
          ))}
          <button className="w-full text-sm px-5 py-2.5 rounded-lg bg-gradient-brand text-primary-foreground font-medium mt-2">
            Get Started
          </button>
        </div>
      )}
    </motion.nav>
  );
};

export default Navbar;
