import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, Languages } from "lucide-react";
import { useSiteSettings } from "@/hooks/usePortfolioData";

const Navbar = () => {
  const { settings } = useSiteSettings();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  const navItems = settings.nav_items.length ? settings.nav_items : [
    { label: "About", href: "#about" },
    { label: "Skills", href: "#skills" },
    { label: "Experience", href: "#experience" },
    { label: "Projects", href: "#projects" },
    { label: "Posts", href: "#posts" },
    { label: "Contact", href: "#contact" },
  ];

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      for (const { href } of [...navItems].reverse()) {
        const el = document.getElementById(href.replace("#", ""));
        if (el && window.scrollY >= el.offsetTop - 120) { setActive(href.replace("#", "")); break; }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [navItems]);

  const toggleTheme = () => {
    const nextTheme = document.documentElement.classList.contains("dark") ? "light" : "dark";
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.style.colorScheme = nextTheme;
    localStorage.setItem("portfolio-theme", nextTheme);
  };

  const toggleLanguage = () => {
    const order = ["en", "hi", "te"] as const;
    const current = (document.documentElement.lang || settings.language || "en") as typeof order[number];
    const next = order[(order.indexOf(current) + 1) % order.length];
    document.documentElement.lang = next;
    localStorage.setItem("portfolio-language", next);
  };

  return (
    <motion.nav initial={{y:-100,opacity:0}} animate={{y:0,opacity:1}}
      transition={{delay:0.5,duration:0.6}}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-max">
      <div className={`glass-card flex items-center gap-1 px-2 py-2 rounded-full transition-all duration-300 ${scrolled ? "shadow-xl" : ""}`}>
        <a href="/" className="px-4 py-2 rounded-full text-sm font-bold font-display text-primary mr-1 hidden sm:block">BV</a>
        {navItems.map(item => (
          <a key={item.href} href={item.href}
            className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              active === item.href.replace("#", "")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            }`}>
            {item.label}
          </a>
        ))}
        <div className="flex items-center gap-1 ml-2 border-l border-border pl-2">
          <button onClick={toggleTheme}
            className="p-2 rounded-full text-muted-foreground hover:bg-secondary/80 transition-colors"
            aria-label="Toggle dark mode">
            {document.documentElement.classList.contains("dark") ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={toggleLanguage}
            className="flex items-center gap-1 px-2 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:bg-secondary/80 transition-colors"
            aria-label="Toggle language">
            <Languages className="w-3.5 h-3.5" />
            {(document.documentElement.lang || settings.language || "en").toUpperCase()}
          </button>
        </div>
      </div>
    </motion.nav>
  );
};
export default Navbar;
