import { motion } from "framer-motion";
import { MapPin, GraduationCap, Circle, Mail, Phone } from "lucide-react";
import { useProfile } from "@/hooks/usePortfolioData";

const AboutSection = () => {
  const { profile } = useProfile();
  return (
    <section id="about" className="py-24 px-6 relative z-10">
      <div className="max-w-5xl mx-auto">
        <motion.h2 className="text-4xl md:text-5xl font-display font-bold text-center mb-16"
          initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          About Me
        </motion.h2>
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <motion.div initial={{opacity:0,x:-30}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{duration:0.5,delay:0.1}}>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6 font-sans">
              I'm a backend-focused developer from Hyderabad who loves building intelligent systems. My work sits at the intersection of <strong className="text-foreground">Backend engineering</strong> and <strong className="text-foreground">AI/ML</strong> — from designing REST APIs with Django, Springboot and FastAPI to training computer vision models.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6 font-sans">
              Currently pursuing B.E. CSE at MVSR Engineering College (GPA: {profile.gpa}). I build things that matter — chatbots, gesture controllers, AI medical assistants. Real problems, real solutions.
            </p>
            <blockquote className="border-l-4 border-primary pl-4 italic text-foreground/80 font-display text-lg">
              "Build things that matter. Ship fast. Learn faster."
            </blockquote>
          </motion.div>
          <motion.div className="glass-card p-6 space-y-5"
            initial={{opacity:0,x:30}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{duration:0.5,delay:0.2}}>
            <InfoRow icon={MapPin} label="Location" value={profile.location}/>
            <InfoRow icon={GraduationCap} label="Education" value="B.E. Computer Science — MVSR Engineering College"/>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Circle className="w-4 h-4 text-green-500 fill-green-500 animate-pulse"/>
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-sans">Status</div>
                <div className="font-medium font-sans text-green-600">Open to opportunities</div>
              </div>
            </div>
            <InfoRow icon={Mail} label="Email" value={profile.email}/>
            <InfoRow icon={Phone} label="Phone" value={profile.phone}/>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
const InfoRow = ({icon:Icon,label,value}:{icon:any;label:string;value:string}) => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
      <Icon className="w-4 h-4"/>
    </div>
    <div>
      <div className="text-xs text-muted-foreground font-sans">{label}</div>
      <div className="font-medium font-sans text-foreground">{value}</div>
    </div>
  </div>
);
export default AboutSection;
