import { motion } from "framer-motion";
import { useSkills } from "@/hooks/usePortfolioData";

const SkillsSection = () => {
  const skillCategories = useSkills();
  return (
    <section id="skills" className="py-24 px-6 relative z-10">
      <div className="max-w-5xl mx-auto">
        <motion.h2 className="text-4xl md:text-5xl font-display font-bold text-center mb-4"
          initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          Skills & Technologies
        </motion.h2>
        <motion.p className="text-center text-muted-foreground mb-16 font-sans"
          initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} transition={{delay:0.1}}>
          Continuously expanding expertise in backend engineering and AI
        </motion.p>
        <div className="space-y-10">
          {skillCategories.map((cat,ci) => (
            <motion.div key={cat.title}
              initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:ci*0.1}}>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 font-sans">{cat.title}</h3>
              <div className="flex flex-wrap gap-3">
                {cat.skills.map((skill,i) => (
                  <motion.span key={skill} className="glass-pill hover:bg-primary hover:text-primary-foreground transition-all duration-200 text-foreground cursor-default"
                    initial={{opacity:0,scale:0.8}} whileInView={{opacity:1,scale:1}} viewport={{once:true}}
                    transition={{delay:ci*0.1+i*0.04}} whileHover={{scale:1.05}}>
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default SkillsSection;
