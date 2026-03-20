import { useEffect, useState } from "react";
import { fetchProfile, fetchSkills, fetchExperience, fetchPosts } from "@/lib/api";

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

export const defaultProfile: Profile = {
  name: "Buvananand Vendotha", tagline: "Python Backend Developer & AI/ML Builder",
  bio: "B.E. CSE '26 @ MVSR · Building intelligent backends with Python, Django & FastAPI. Passionate about AI/ML and solving real-world problems with code.",
  location: "Hyderabad, Telangana, India", email: "vendotha@gmail.com",
  phone: "+91 9440401919", github: "https://github.com/vendotha",
  linkedin: "https://www.linkedin.com/in/vendotha",
  gpa: "8.33", dp_url: "/dp.jpg", resume_url: "/api/resume", available: true,
};

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
