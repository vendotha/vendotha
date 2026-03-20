import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Linkedin, Github, Phone, MapPin, ArrowRight, Send } from "lucide-react";
import { useProfile } from "@/hooks/usePortfolioData";

const ContactSection = () => {
  const { profile } = useProfile();
  const [form, setForm] = useState({ name:"", email:"", subject:"", message:"" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailto = `mailto:${profile.email}?subject=${encodeURIComponent(form.subject||"Portfolio Contact")}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)}`;
    window.location.href = mailto;
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const links = [
    { icon:Mail,    label:"Email",    value:profile.email,    href:`mailto:${profile.email}` },
    { icon:Linkedin,label:"LinkedIn", value:"linkedin.com/in/vendotha", href:profile.linkedin },
    { icon:Github,  label:"GitHub",   value:"github.com/vendotha", href:profile.github },
    { icon:Phone,   label:"Phone",    value:profile.phone,    href:`tel:${profile.phone}` },
    { icon:MapPin,  label:"Location", value:profile.location, href:"#" },
  ];

  return (
    <section id="contact" className="py-24 px-6 relative z-10">
      <div className="max-w-5xl mx-auto">
        <motion.h2 className="text-4xl md:text-5xl font-display font-bold text-center mb-4"
          initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          Get in Touch
        </motion.h2>
        <motion.p className="text-center text-muted-foreground mb-16 font-sans"
          initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}}>
          Open to new opportunities, collaborations, and interesting conversations.
        </motion.p>

        <div className="grid md:grid-cols-2 gap-10">
          <motion.div className="space-y-4"
            initial={{opacity:0,x:-20}} whileInView={{opacity:1,x:0}} viewport={{once:true}}>
            {links.map((link, i) => (
              <motion.a key={link.label} href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                className="glass-card-hover flex items-center justify-between p-4 group"
                initial={{opacity:0,x:-20}} whileInView={{opacity:1,x:0}} viewport={{once:true}}
                transition={{delay:i*0.08}}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <link.icon className="w-4 h-4 text-primary"/>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-sans">{link.label}</div>
                    <div className="text-sm font-medium font-sans text-foreground">{link.value}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all"/>
              </motion.a>
            ))}
          </motion.div>

          <motion.form onSubmit={handleSubmit} className="glass-card p-6 space-y-4"
            initial={{opacity:0,x:20}} whileInView={{opacity:1,x:0}} viewport={{once:true}}>
            <input type="text" placeholder="Your Name" required value={form.name}
              onChange={e => setForm({...form,name:e.target.value})}
              className="w-full glass-input font-sans text-foreground placeholder:text-muted-foreground"/>
            <input type="email" placeholder="Your Email" required value={form.email}
              onChange={e => setForm({...form,email:e.target.value})}
              className="w-full glass-input font-sans text-foreground placeholder:text-muted-foreground"/>
            <input type="text" placeholder="Subject" value={form.subject}
              onChange={e => setForm({...form,subject:e.target.value})}
              className="w-full glass-input font-sans text-foreground placeholder:text-muted-foreground"/>
            <textarea placeholder="Your message..." required rows={5} value={form.message}
              onChange={e => setForm({...form,message:e.target.value})}
              className="w-full glass-input font-sans resize-none text-foreground placeholder:text-muted-foreground"/>
            <button type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium transition-all hover:shadow-lg hover:shadow-primary/25 font-sans">
              <Send className="w-4 h-4"/>
              {sent ? "✓ Opening mail client..." : "Send Message"}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};
export default ContactSection;
