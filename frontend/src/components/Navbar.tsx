import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const navItems = [
  {label:"About",href:"#about"},
  {label:"Skills",href:"#skills"},
  {label:"Experience",href:"#experience"},
  {label:"Projects",href:"#projects"},
  {label:"Posts",href:"#posts"},
  {label:"Contact",href:"#contact"},
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      for (const {href} of [...navItems].reverse()) {
        const el = document.getElementById(href.replace("#",""));
        if (el && window.scrollY >= el.offsetTop - 120) { setActive(href.replace("#","")); break; }
      }
    };
    window.addEventListener("scroll", onScroll, {passive:true});
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav initial={{y:-100,opacity:0}} animate={{y:0,opacity:1}}
      transition={{delay:0.5,duration:0.6}}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-max">
      <div className={`glass-card flex items-center gap-1 px-2 py-2 rounded-full transition-all duration-300 ${scrolled?"shadow-xl":""}`}>
        <a href="/" className="px-4 py-2 rounded-full text-sm font-bold font-display text-primary mr-1 hidden sm:block">BV</a>
        {navItems.map(item => (
          <a key={item.href} href={item.href}
            className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              active === item.href.replace("#","")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            }`}>
            {item.label}
          </a>
        ))}
      </div>
    </motion.nav>
  );
};
export default Navbar;
