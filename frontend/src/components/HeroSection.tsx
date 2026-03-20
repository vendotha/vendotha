import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, Download, Eye, ArrowDown } from "lucide-react";
import { useProfile } from "@/hooks/usePortfolioData";
import { API_BASE } from "@/lib/api";

const roles = ["Backend Developer","Django & FastAPI Engineer","AI/ML Builder","Nest JS Developer","Open Source Contributor"];

const HeroSection = ({ repoCount }: { repoCount: number }) => {
  const { profile } = useProfile();
  const [showResume, setShowResume] = useState(false);
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const cur = roles[roleIndex];
    let t: ReturnType<typeof setTimeout>;
    if (!deleting && displayed.length < cur.length) t = setTimeout(() => setDisplayed(cur.slice(0,displayed.length+1)),80);
    else if (!deleting && displayed.length === cur.length) t = setTimeout(() => setDeleting(true),2000);
    else if (deleting && displayed.length > 0) t = setTimeout(() => setDisplayed(displayed.slice(0,-1)),40);
    else { setDeleting(false); setRoleIndex(p => (p+1)%roles.length); }
    return () => clearTimeout(t);
  }, [displayed, deleting, roleIndex]);

  const dpSrc = profile.dp_url?.startsWith("data:") ? profile.dp_url : (profile.dp_url || "/dp.jpg");

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
      <motion.div initial={{opacity:0}} animate={{opacity:0.06}} transition={{delay:1.5,duration:1}}
        className="absolute top-32 right-10 lg:right-32 -rotate-6 font-mono text-xs leading-6 text-foreground select-none hidden lg:block">
        <pre>{`from django.db import models\n\nclass Developer:\n    name = "Buvananand"\n    stack = ["Django","FastAPI",\n             "Python","AI/ML"]\n    status = "open_to_work"\n    coffee = float("inf")`}</pre>
      </motion.div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div initial={{scale:0,opacity:0}} animate={{scale:1,opacity:1}}
          transition={{delay:0.2,type:"spring",stiffness:200}} className="relative w-32 h-32 mx-auto mb-6">
          <div className="absolute inset-[-4px] rounded-full spin-slow" style={{background:"var(--glow-ring)",padding:"3px"}}>
            <div className="w-full h-full rounded-full bg-background"/>
          </div>
          <div className="absolute inset-0 rounded-full overflow-hidden border-2 border-primary/20">
            <img src={dpSrc} alt={profile.name} className="w-full h-full object-cover"
              onError={e=>{(e.target as HTMLImageElement).src="/dp.jpg";}}/>
          </div>
          <div className="absolute inset-0 rounded-full" style={{boxShadow:"var(--glow-blue)"}}/>
        </motion.div>

        {profile.available && (
          <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
            className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full glass-card text-sm font-sans">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>Available for opportunities
          </motion.div>
        )}

        <motion.h1 className="text-5xl md:text-7xl font-display font-bold mb-4 tracking-tight"
          initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4,duration:0.6}}>
          Hi, I'm <span className="gradient-text">{profile.name.split(" ")[0]}</span>
        </motion.h1>

        <motion.div className="text-xl md:text-2xl text-muted-foreground mb-6 h-8 font-sans"
          initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.6}}>
          {displayed}<span className="animate-pulse">|</span>
        </motion.div>

        <motion.p className="text-muted-foreground max-w-xl mx-auto mb-8 font-sans leading-relaxed"
          initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.8}}>
          {profile.bio}
        </motion.p>

        <motion.div className="flex flex-wrap items-center justify-center gap-3 mb-8"
          initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:1}}>
          <a href="#projects" className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium font-sans transition-all hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5">
            View my work
          </a>
          <button onClick={() => setShowResume(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-full glass-card font-medium font-sans transition-all hover:-translate-y-0.5">
            <Eye className="w-4 h-4"/>View Résumé
          </button>
        </motion.div>

        {showResume && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowResume(false)}>
            <div className="glass-card w-full max-w-4xl mx-4 h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
                <h3 className="font-display font-bold text-lg">Buvananand Vendotha — Résumé</h3>
                <div className="flex items-center gap-3">
                  <a href={`${API_BASE}/api/resume`} download="Buvananand_Resume.pdf"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium font-sans hover:shadow-lg transition-all">
                    <Download className="w-4 h-4"/> Download PDF
                  </a>
                  <button onClick={() => setShowResume(false)} className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/50 transition-colors">✕</button>
                </div>
              </div>
              <div className="flex-1 relative">
                <iframe
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(`${API_BASE}/api/resume/view`)}&embedded=true`}
                  className="absolute inset-0 w-full h-full rounded-b-lg border-0"
                  title="Resume"
                />
              </div>
              <p className="text-xs text-muted-foreground font-sans text-center py-2 border-t border-border">
                Powered by Google Docs viewer
              </p>
            </div>
          </div>
        )}

        <motion.div className="flex flex-wrap items-center justify-center gap-3 mb-12"
          initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.1}}>
          {[{href:profile.github,icon:Github,label:"GitHub"},{href:profile.linkedin,icon:Linkedin,label:"LinkedIn"},{href:`mailto:${profile.email}`,icon:Mail,label:"Email"}]
            .map(({href,icon:Icon,label})=>(
            <a key={label} href={href} target={href.startsWith("mailto")?undefined:"_blank"} rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-sans hover:-translate-y-0.5 transition-all">
              <Icon className="w-4 h-4"/>{label}
            </a>
          ))}
        </motion.div>

        <motion.div className="flex items-center justify-center gap-8 pt-8 border-t border-border"
          initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.2}}>
          {[{n:`${repoCount||9}+`,l:"GitHub Repos"},{n:"2+",l:"Years Coding"},{n:profile.gpa,l:"GPA"}]
            .map(({n,l},i)=>(
            <div key={l} className="flex items-center gap-8">
              {i>0&&<div className="w-px h-10 bg-border"/>}
              <div className="text-center">
                <div className="text-3xl font-display font-bold">{n}</div>
                <div className="text-xs text-muted-foreground font-sans mt-1">{l}</div>
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div className="mt-12" animate={{y:[0,8,0]}} transition={{repeat:Infinity,duration:1.8,ease:"easeInOut"}}>
          <ArrowDown className="w-5 h-5 text-muted-foreground mx-auto"/>
        </motion.div>
      </div>
    </section>
  );
};
export default HeroSection;