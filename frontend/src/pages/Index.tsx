import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import AnimatedBackground from "@/components/AnimatedBackground";
import CustomCursor from "@/components/CustomCursor";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import SkillsSection from "@/components/SkillsSection";
import ExperienceSection from "@/components/ExperienceSection";
import GitHubProjectsSection from "@/components/GitHubProjectsSection";
import PostsSection from "@/components/PostsSection";
import ContactSection from "@/components/ContactSection";

const Index = () => {
  const [repoCount, setRepoCount] = useState(0);
  const handleRepoCount = useCallback((n: number) => setRepoCount(n), []);
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AnimatedBackground/>
      <CustomCursor/>
      <Navbar/>
      <HeroSection repoCount={repoCount}/>
      <AboutSection/>
      <SkillsSection/>
      <ExperienceSection/>
      <GitHubProjectsSection onRepoCount={handleRepoCount}/>
      <PostsSection/>
      <ContactSection/>
    </div>
  );
};
export default Index;
