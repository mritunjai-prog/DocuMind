import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesGrid from "@/components/FeaturesGrid";
import PipelineSection from "@/components/PipelineSection";
import DashboardPreview from "@/components/DashboardPreview";
import RAGSection from "@/components/RAGSection";
import CTASection from "@/components/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <div id="features"><FeaturesGrid /></div>
      <div id="pipeline"><PipelineSection /></div>
      <div id="dashboard"><DashboardPreview /></div>
      <div id="rag"><RAGSection /></div>
      <div id="industries"><CTASection /></div>
    </div>
  );
};

export default Index;
