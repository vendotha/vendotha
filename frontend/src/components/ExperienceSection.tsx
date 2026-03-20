import { motion } from "framer-motion";
import { useExperience } from "@/hooks/usePortfolioData";

const education = [
  {degree:"Bachelor of Engineering in Computer Science",institution:"MVSR Engineering College",period:"2023 — 2026",gpa:"8.33 / 10",location:"Hyderabad, Telangana"},
  {degree:"Diploma in Computer Engineering",institution:"TRR College of Technology",period:"2020 — 2023",gpa:"8.54 / 10",location:"Hyderabad, Telangana"},
];
const achievements = [
  "Dyne Research ideaLab 2025 — Selected among 10,000+ applicants",
  "Inter-College Hackathon 2024 — Finalist",
  "National AI/ML Challenge 2023 — Top 10%",
  "Open-Source Contributor Recognition 2024",
  "CODE-CRACK 2025 — Certificate of Participation (IEEE MVSR CS)",
  "Tech Savishkaar 3.0 — Cleared Coding Round (National Hackathon)",
  "Cisco Python Certification 2024",
];

const ExperienceSection = () => {
  const experiences = useExperience();
  return (
    <section id="experience" className="py-24 px-6 relative z-10">
      <div className="max-w-3xl mx-auto">
        <motion.h2 className="text-4xl md:text-5xl font-display font-bold text-center mb-4"
          initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>Experience</motion.h2>
        <motion.p className="text-center text-muted-foreground mb-16 font-sans"
          initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}}>Work, research, and academic background</motion.p>

        <div className="relative mb-20">
          <motion.div className="absolute left-6 top-0 w-px bg-border"
            initial={{height:0}} whileInView={{height:"100%"}} viewport={{once:true}} transition={{duration:1.5,ease:"easeInOut"}}/>
          <div className="space-y-10">
            {experiences.map((exp,i) => (
              <motion.div key={exp.id} className="relative pl-16"
                initial={{opacity:0,x:-30}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{delay:i*0.15,duration:0.5}}>
                <div className={`absolute left-[18px] top-2 w-3 h-3 rounded-full ring-4 ring-background ${exp.current?"bg-green-400":"bg-primary"}`}/>
                <div className="glass-card-hover p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <span className="text-xs text-muted-foreground font-sans">{exp.period}</span>
                    {exp.current&&<span className="text-xs px-2 py-0.5 rounded-full bg-green-400/10 text-green-600 font-medium font-sans border border-green-400/20">Current</span>}
                  </div>
                  <h3 className="text-lg font-bold font-display text-foreground">{exp.title}</h3>
                  <div className="text-sm text-primary font-medium font-sans mb-1">{exp.company}</div>
                  <div className="text-xs text-muted-foreground font-sans mb-3">{exp.location}</div>
                  <p className="text-muted-foreground text-sm font-sans leading-relaxed mb-4">{exp.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {exp.tags.map(t=><span key={t} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-sans">{t}</span>)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.h3 className="text-2xl font-display font-bold mb-8"
          initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>Education</motion.h3>
        <div className="space-y-4 mb-16">
          {education.map((edu,i) => (
            <motion.div key={i} className="glass-card-hover p-6"
              initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}}>
              <div className="flex flex-wrap justify-between gap-2 mb-1">
                <h4 className="font-bold font-display text-foreground">{edu.degree}</h4>
                <span className="text-xs text-muted-foreground font-sans">{edu.period}</span>
              </div>
              <div className="text-sm text-primary font-medium font-sans">{edu.institution}</div>
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground font-sans">
                <span>{edu.location}</span><span>GPA: {edu.gpa}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.h3 className="text-2xl font-display font-bold mb-8"
          initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>Achievements</motion.h3>
        <div className="space-y-3">
          {achievements.map((a,i) => (
            <motion.div key={i} className="glass-card-hover px-5 py-4 flex items-start gap-3"
              initial={{opacity:0,x:-20}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{delay:i*0.07}}>
              <span className="text-primary mt-0.5 text-lg leading-none">✦</span>
              <span className="text-sm font-sans text-foreground">{a}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default ExperienceSection;
