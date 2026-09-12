import { useEffect, useState } from "react";
import { fetchProfile, fetchSkills, fetchExperience, fetchPosts, fetchSiteSettings } from "@/lib/api";

export interface Profile {
  name: string; tagline: string; bio: string; location: string;
  email: string; phone: string; github: string; linkedin: string;
  gpa: string; dp_url: string; resume_url: string; available: boolean;
}

export interface SkillCategory { title: string; skills: string[]; }
export interface Experience {
  id: string; title: string; company: string; period: string;
  location: string; description: string; tags: string[];
  current: boolean; order: number;
}
export interface Post {
  id: string; text: string; date: string; likes: number; comments: number;
  image_url?: string; video_url?: string; link?: string; link_title?: string;
}
export interface EducationEntry {
  degree: string; institution: string; period: string; gpa: string; location: string;
}
export interface NavItem { label: string; href: string; }
export interface SiteSettings {
  theme: "light" | "dark";
  language: "en" | "hi" | "te";
  translation_enabled: boolean;
  about_title: string;
  about_intro: string;
  about_story: string;
  about_quote: string;
  experience_heading: string;
  experience_subheading: string;
  education_heading: string;
  achievements_heading: string;
  contact_heading: string;
  contact_subheading: string;
  education: EducationEntry[];
  achievements: string[];
  hero_roles: string[];
  nav_items: NavItem[];
}

export const defaultProfile: Profile = {
  name: "Buvananand Vendotha", tagline: "Python Backend Developer & AI/ML Builder",
  bio: "B.E. CSE '26 @ MVSR · Building intelligent backends with Python, Django & FastAPI. Passionate about AI/ML and solving real-world problems with code.",
  location: "Hyderabad, Telangana, India", email: "vendotha@gmail.com",
  phone: "+91 9440401919", github: "https://github.com/vendotha",
  linkedin: "https://www.linkedin.com/in/vendotha",
  gpa: "8.33", dp_url: "/dp.jpg", resume_url: "/api/resume", available: true,
};

export const defaultSiteSettings: SiteSettings = {
  theme: "dark",
  language: "en",
  translation_enabled: true,
  about_title: "About Me",
  about_intro: "I'm a backend-focused developer from Hyderabad who loves building intelligent systems. My work sits at the intersection of Backend engineering and AI/ML.",
  about_story: "Currently pursuing B.E. CSE at MVSR Engineering College (GPA: 8.33). I build things that matter — chatbots, gesture controllers, AI medical assistants.",
  about_quote: "Build things that matter. Ship fast. Learn faster.",
  experience_heading: "Experience",
  experience_subheading: "Work, research, and academic background",
  education_heading: "Education",
  achievements_heading: "Achievements",
  contact_heading: "Get in Touch",
  contact_subheading: "Open to new opportunities, collaborations, and interesting conversations.",
  education: [
    { degree: "Bachelor of Engineering in Computer Science", institution: "MVSR Engineering College", period: "2023 — 2026", gpa: "8.33 / 10", location: "Hyderabad, Telangana" },
    { degree: "Diploma in Computer Engineering", institution: "TRR College of Technology", period: "2020 — 2023", gpa: "8.54 / 10", location: "Hyderabad, Telangana" },
  ],
  achievements: [
    "Dyne Research ideaLab 2025 — Selected among 10,000+ applicants",
    "Inter-College Hackathon 2024 — Finalist",
    "National AI/ML Challenge 2023 — Top 10%",
    "Open-Source Contributor Recognition 2024",
    "CODE-CRACK 2025 — Certificate of Participation (IEEE MVSR CS)",
    "Tech Savishkaar 3.0 — Cleared Coding Round (National Hackathon)",
    "Cisco Python Certification 2024",
  ],
  hero_roles: ["Backend Developer", "AI/ML Builder", "Open Source Contributor"],
  nav_items: [
    { label: "About", href: "#about" },
    { label: "Skills", href: "#skills" },
    { label: "Experience", href: "#experience" },
    { label: "Projects", href: "#projects" },
    { label: "Posts", href: "#posts" },
    { label: "Contact", href: "#contact" },
  ],
};

export const translations: Record<string, Record<string, string>> = {
  en: {
    about: 'About',
    skills: 'Skills',
    experience: 'Experience',
    projects: 'Projects',
    posts: 'Posts',
    contact: 'Contact',
    viewWork: 'View my work',
    viewResume: 'View Résumé',
    available: 'Available for opportunities',
    openingMail: 'Opening mail client...',
    sendMessage: 'Send Message',
    dark: 'Dark',
    light: 'Light',
    language: 'Language',
  },
  hi: {
    about: 'परिचय',
    skills: 'कौशल',
    experience: 'अनुभव',
    projects: 'परियोजनाएँ',
    posts: 'पोस्ट',
    contact: 'संपर्क',
    viewWork: 'मेरी परियोजनाएँ देखें',
    viewResume: 'रिज़्यूमे देखें',
    available: 'अवसरों के लिए उपलब्ध',
    openingMail: 'मेल क्लाइंट खोल रहा है...',
    sendMessage: 'मैसेज भेजें',
    dark: 'डार्क',
    light: 'लाइट',
    language: 'भाषा',
  },
  te: {
    about: 'గురించి',
    skills: 'నైపుణ్యాలు',
    experience: 'అనుభవం',
    projects: 'ప్రాజెక్టులు',
    posts: 'పోస్టులు',
    contact: 'సంప్రదించండి',
    viewWork: 'నా పనిని చూడండి',
    viewResume: 'రెస్యూమ్ చూడండి',
    available: 'అవకాశాల కోసం అందుబాటులో',
    openingMail: 'మెయిల్ క్లయింట్ తెరవబడుతోంది...',
    sendMessage: 'సందేశం పంపండి',
    dark: 'డార్క్',
    light: 'లైట్',
    language: 'భాష',
  },
};

export function getLocalizedText(language: "en" | "hi" | "te", key: string) {
  return translations[language]?.[key] ?? translations.en[key] ?? key;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchProfile().then(setProfile).catch(() => {}).finally(() => setLoading(false));
  }, []);
  return { profile, loading, setProfile };
}

export function useSkills() {
  const [skills, setSkills] = useState<SkillCategory[]>([]);
  useEffect(() => { fetchSkills().then(setSkills).catch(() => {}); }, []);
  return skills;
}

export function useExperience() {
  const [experience, setExperience] = useState<Experience[]>([]);
  useEffect(() => { fetchExperience().then(setExperience).catch(() => {}); }, []);
  return experience;
}

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchPosts().then(setPosts).catch(() => {}).finally(() => setLoading(false));
  }, []);
  return { posts, loading, setPosts };
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchSiteSettings()
      .then((data) => setSettings({ ...defaultSiteSettings, ...data }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  return { settings, loading, setSettings };
}
