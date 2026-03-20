import { useState, useEffect, useRef, useCallback } from "react";
import { signInWithPopup, signOut, onAuthStateChanged, User, getIdToken } from "firebase/auth";
import { auth, googleProvider, ADMIN_EMAIL, isMissingConfig } from "@/lib/firebase";
import {
  updateProfile, updateSkills, updateExperience,
  createPost, updatePost, deletePost,
  fetchProfile, fetchSkills, fetchExperience, fetchPosts,
  API_BASE,
} from "@/lib/api";
import { defaultProfile, type Profile, type SkillCategory, type Experience, type Post } from "@/hooks/usePortfolioData";
import { LogOut, Upload, Plus, Trash2, Save, X, ChevronDown, ChevronUp, Eye, Download, Crop, RefreshCw, AlertCircle } from "lucide-react";

// ── Token helper ──────────────────────────────────────────────────────────────
async function getToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in");
  return getIdToken(user);
}

// ── Login Screen ──────────────────────────────────────────────────────────────
const LoginScreen = () => {
  const [error, setError] = useState("");

  if (isMissingConfig) return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="glass-card p-10 max-w-md w-full">
        <div className="text-4xl mb-4 text-center">⚙️</div>
        <h1 className="text-2xl font-display font-bold mb-2 text-center">Firebase Not Configured</h1>
        <p className="text-muted-foreground text-sm mb-6 text-center font-sans">
          Create a <code className="bg-secondary px-1.5 py-0.5 rounded">.env</code> file with your Firebase config.
        </p>
        <div className="bg-secondary rounded-lg p-4 font-mono text-xs leading-6 text-foreground mb-4 overflow-x-auto">
          <p>VITE_FIREBASE_API_KEY=AIzaSy...</p>
          <p>VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com</p>
          <p>VITE_FIREBASE_PROJECT_ID=your-project-id</p>
          <p>VITE_API_URL=https://vendotha-api.onrender.com</p>
        </div>
        <p className="text-xs text-muted-foreground text-center font-sans">See <strong>SETUP.md</strong> for full instructions.</p>
      </div>
    </div>
  );

  const handleLogin = async () => {
    try {
      setError("");
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.email !== ADMIN_EMAIL) {
        await signOut(auth);
        setError("Access denied. Only the portfolio owner can log in.");
      }
    } catch (e: any) {
      setError(e.message?.includes("configuration-not-found")
        ? "Firebase not configured. Check your .env file."
        : e.message || "Login failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="glass-card p-10 max-w-sm w-full text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h1 className="text-2xl font-display font-bold mb-2">Admin Panel</h1>
        <p className="text-muted-foreground font-sans text-sm mb-8">Sign in with Google to manage your portfolio.</p>
        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-left"><p className="text-red-600 text-sm font-sans">{error}</p></div>}
        <button onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium font-sans hover:shadow-lg transition-all">
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>
        <p className="text-xs text-muted-foreground mt-4 font-sans">Only {ADMIN_EMAIL} can access this panel.</p>
      </div>
    </div>
  );
};

// ── Section collapsible ───────────────────────────────────────────────────────
const Section = ({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass-card overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 font-display font-bold text-lg hover:bg-secondary/30 transition-colors">
        {title}{open ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
      </button>
      {open && <div className="p-5 pt-0 border-t border-border">{children}</div>}
    </div>
  );
};

// ── Field ─────────────────────────────────────────────────────────────────────
const Field = ({ label, value, onChange, textarea, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; textarea?: boolean; type?: string;
}) => (
  <div>
    <label className="text-xs text-muted-foreground font-sans block mb-1">{label}</label>
    {textarea
      ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} className="w-full glass-input text-sm font-sans text-foreground resize-y"/>
      : <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full glass-input text-sm font-sans text-foreground"/>}
  </div>
);

// ── Save button ───────────────────────────────────────────────────────────────
const SaveBtn = ({ onClick, saving, saved, label = "Save changes" }: {
  onClick: () => void; saving: boolean; saved: boolean; label?: string;
}) => (
  <button onClick={onClick} disabled={saving}
    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm font-sans transition-all disabled:opacity-60 ${saved ? "bg-green-500 text-white" : "bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/25"}`}>
    <Save className="w-4 h-4"/>
    {saving ? "Saving..." : saved ? "✓ Saved!" : label}
  </button>
);

// ── DP Cropper Modal ──────────────────────────────────────────────────────────
const DPCropper = ({ src, onConfirm, onCancel }: {
  src: string; onConfirm: (croppedBlob: Blob) => void; onCancel: () => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  // SIZE is the canvas px dimension — larger = more portrait room
  const SIZE = 420;
  const [zoom, setZoom] = useState(0.5);
  const [minZoom, setMinZoom] = useState(0.1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // On image load: auto-fit the full image inside the circle
  const handleImgLoad = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    // Zoom to fit the shorter dimension inside the circle
    const fitZoom = SIZE / Math.max(img.naturalWidth, img.naturalHeight);
    setZoom(fitZoom);
    setMinZoom(fitZoom * 0.5); // allow zooming out to 50% of fit
    setOffsetX(0);
    setOffsetY(0);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;
    const ctx = canvas.getContext("2d")!;

    // Dark outside-circle overlay
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Clip + draw image inside circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.clearRect(0, 0, SIZE, SIZE);
    const scaledW = img.naturalWidth * zoom;
    const scaledH = img.naturalHeight * zoom;
    const x = (SIZE - scaledW) / 2 + offsetX;
    const y = (SIZE - scaledH) / 2 + offsetY;
    ctx.drawImage(img, x, y, scaledW, scaledH);
    ctx.restore();

    // Circle guide ring
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(0,113,227,0.7)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [zoom, offsetX, offsetY]);

  useEffect(() => { draw(); }, [draw]);

  // Mouse drag
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setOffsetX(e.clientX - dragStart.x);
    setOffsetY(e.clientY - dragStart.y);
  };
  const handleMouseUp = () => setDragging(false);

  // Touch drag (mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    setDragging(true);
    setDragStart({ x: t.clientX - offsetX, y: t.clientY - offsetY });
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    const t = e.touches[0];
    setOffsetX(t.clientX - dragStart.x);
    setOffsetY(t.clientY - dragStart.y);
  };

  // Scroll to zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.min(3, Math.max(minZoom, z - e.deltaY * 0.001)));
  };

  const handleConfirm = () => {
    // Render at high resolution (600px) for quality
    const outputSize = 600;
    const output = document.createElement("canvas");
    output.width = outputSize;
    output.height = outputSize;
    const ctx = output.getContext("2d")!;
    const scale = outputSize / SIZE;
    const img = imgRef.current!;

    ctx.save();
    ctx.beginPath();
    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
    ctx.clip();

    const scaledW = img.naturalWidth * zoom * scale;
    const scaledH = img.naturalHeight * zoom * scale;
    const x = (outputSize - scaledW) / 2 + offsetX * scale;
    const y = (outputSize - scaledH) / 2 + offsetY * scale;
    ctx.drawImage(img, x, y, scaledW, scaledH);
    ctx.restore();

    output.toBlob(blob => { if (blob) onConfirm(blob); }, "image/jpeg", 0.93);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="glass-card p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg flex items-center gap-2">
            <Crop className="w-5 h-5"/> Crop Profile Photo
          </h3>
          <button onClick={onCancel} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5"/>
          </button>
        </div>

        <img ref={imgRef} src={src} onLoad={handleImgLoad} className="hidden" alt=""/>

        {/* Canvas — full width, square aspect ratio */}
        <div className="flex justify-center mb-4 rounded-full overflow-hidden" style={{width:SIZE, height:SIZE, maxWidth:"100%", margin:"0 auto"}}>
          <canvas
            ref={canvasRef}
            width={SIZE} height={SIZE}
            style={{ cursor: dragging ? "grabbing" : "grab", width:"100%", height:"100%", borderRadius:"50%", display:"block" }}
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleMouseUp}
            onWheel={handleWheel}
          />
        </div>

        {/* Zoom slider */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-muted-foreground font-sans">Zoom</label>
            <span className="text-xs font-mono text-muted-foreground">{Math.round(zoom * 100)}%</span>
          </div>
          <input type="range" min={minZoom} max="3" step="0.01" value={zoom}
            onChange={e => setZoom(parseFloat(e.target.value))}
            className="w-full"/>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-muted-foreground font-sans">Drag to reposition · scroll or slider to zoom</p>
          <button onClick={() => { setZoom(minZoom * 2); setOffsetX(0); setOffsetY(0); }}
            className="text-xs text-primary font-sans hover:underline">Reset</button>
        </div>

        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg glass-card text-sm font-sans hover:bg-secondary/50 transition-colors">
            Cancel
          </button>
          <button onClick={handleConfirm}
            className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium font-sans hover:shadow-lg transition-all">
            Use this photo
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Resume Viewer Modal ───────────────────────────────────────────────────────
const ResumeViewer = ({ onClose }: { onClose: () => void }) => {
  // Use Google Docs viewer to embed the PDF cross-origin reliably
  const viewUrl = `${API_BASE}/api/resume/view`;
  const googleDocsUrl = `https://docs.google.com/gview?url=${encodeURIComponent(viewUrl)}&embedded=true`;
  const [useGoogle, setUseGoogle] = useState(true);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card w-full max-w-4xl mx-4 h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <h3 className="font-display font-bold text-lg">Buvananand Vendotha — Résumé</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => setUseGoogle(!useGoogle)}
              className="text-xs text-muted-foreground font-sans hover:text-primary transition-colors px-2 py-1 rounded hover:bg-secondary/50">
              {useGoogle ? "Switch to direct view" : "Switch to Google viewer"}
            </button>
            <a href={`${API_BASE}/api/resume`} download="Buvananand_Resume.pdf"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium font-sans hover:shadow-lg transition-all">
              <Download className="w-4 h-4"/> Download PDF
            </a>
            <button onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/50 transition-colors">
              <X className="w-5 h-5"/>
            </button>
          </div>
        </div>
        <div className="flex-1 relative">
          <iframe
            key={useGoogle ? "google" : "direct"}
            src={useGoogle ? googleDocsUrl : viewUrl}
            className="absolute inset-0 w-full h-full rounded-b-lg border-0"
            title="Resume"
          />
        </div>
        {useGoogle && (
          <p className="text-xs text-muted-foreground font-sans text-center py-2 border-t border-border">
            Viewing via Google Docs · <button onClick={() => setUseGoogle(false)} className="text-primary hover:underline">Try direct view</button> if it looks wrong
          </p>
        )}
      </div>
    </div>
  );
};

// ── Loading skeleton ──────────────────────────────────────────────────────────
const Skeleton = ({ rows = 3 }: { rows?: number }) => (
  <div className="space-y-3 pt-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-14 rounded-lg bg-secondary/50 animate-pulse"/>
    ))}
  </div>
);

// ── Error banner ──────────────────────────────────────────────────────────────
const ErrorBanner = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="flex items-center gap-3 p-4 mt-4 bg-red-50 border border-red-200 rounded-lg">
    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0"/>
    <p className="text-sm text-red-600 font-sans flex-1">{message}</p>
    <button onClick={onRetry} className="flex items-center gap-1 text-xs text-red-600 hover:underline font-sans">
      <RefreshCw className="w-3 h-3"/> Retry
    </button>
  </div>
);

// ── Main Dashboard ────────────────────────────────────────────────────────────
const AdminDashboard = ({ user }: { user: User }) => {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [skills, setSkills] = useState<SkillCategory[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  const [loadingSkills, setLoadingSkills] = useState(true);
  const [loadingExp, setLoadingExp] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [errorSkills, setErrorSkills] = useState("");
  const [errorExp, setErrorExp] = useState("");
  const [errorPosts, setErrorPosts] = useState("");
  const [errorProfile, setErrorProfile] = useState("");

  const [dpFile, setDpFile] = useState<File | null>(null);
  const [dpCropSrc, setDpCropSrc] = useState<string | null>(null);
  const [dpCroppedBlob, setDpCroppedBlob] = useState<Blob | null>(null);
  const [dpPreview, setDpPreview] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [showResume, setShowResume] = useState(false);

  const [postImageFiles, setPostImageFiles] = useState<Record<string, File>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const toast = (key: string) => { setSaved(key); setTimeout(() => setSaved(null), 2500); };

  // ── Load all data ─────────────────────────────────────────────────────────
  const loadProfile = () => {
    setLoadingProfile(true); setErrorProfile("");
    fetchProfile()
      .then(d => setProfile({ ...defaultProfile, ...d }))
      .catch(e => setErrorProfile(`Failed to load profile: ${e.message}. Is the backend running on ${API_BASE}?`))
      .finally(() => setLoadingProfile(false));
  };

  const loadSkills = () => {
    setLoadingSkills(true); setErrorSkills("");
    fetchSkills()
      .then(data => setSkills(data))
      .catch(e => setErrorSkills(`Failed to load skills: ${e.message}`))
      .finally(() => setLoadingSkills(false));
  };

  const loadExp = () => {
    setLoadingExp(true); setErrorExp("");
    fetchExperience()
      .then(data => setExperiences(data))
      .catch(e => setErrorExp(`Failed to load experience: ${e.message}`))
      .finally(() => setLoadingExp(false));
  };

  const loadPosts = () => {
    setLoadingPosts(true); setErrorPosts("");
    fetchPosts()
      .then(data => setPosts(data))
      .catch(e => setErrorPosts(`Failed to load posts: ${e.message}`))
      .finally(() => setLoadingPosts(false));
  };

  useEffect(() => {
    loadProfile(); loadSkills(); loadExp(); loadPosts();
  }, []);

  // ── DP crop flow ──────────────────────────────────────────────────────────
  const handleDpFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDpFile(file);
    const reader = new FileReader();
    reader.onload = ev => setDpCropSrc(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCropConfirm = (blob: Blob) => {
    setDpCroppedBlob(blob);
    setDpPreview(URL.createObjectURL(blob));
    setDpCropSrc(null);
  };

  // ── Save profile ──────────────────────────────────────────────────────────
  const saveProfile = async () => {
    setSaving("profile");
    try {
      const token = await getToken();
      const fd = new FormData();
      (["name","tagline","bio","location","email","phone","github","linkedin","gpa"] as (keyof Profile)[])
        .forEach(k => fd.append(k, String(profile[k])));
      fd.append("available", String(profile.available));
      if (dpCroppedBlob) fd.append("dp_file", dpCroppedBlob, "dp.jpg");
      else if (dpFile && !dpCroppedBlob) fd.append("dp_file", dpFile);
      if (resumeFile) fd.append("resume_file", resumeFile);
      await updateProfile(token, fd);
      setDpFile(null); setDpCroppedBlob(null);
      setResumeFile(null);
      toast("profile");
    } catch (e: any) { alert("Save failed: " + e.message); }
    setSaving(null);
  };

  // ── Save skills ───────────────────────────────────────────────────────────
  const saveSkills = async () => {
    setSaving("skills");
    try { await updateSkills(await getToken(), skills); toast("skills"); }
    catch (e: any) { alert("Save failed: " + e.message); }
    setSaving(null);
  };

  // ── Save experience ───────────────────────────────────────────────────────
  const saveExperiences = async () => {
    setSaving("exp");
    try { await updateExperience(await getToken(), experiences); toast("exp"); }
    catch (e: any) { alert("Save failed: " + e.message); }
    setSaving(null);
  };

  // ── Post CRUD ─────────────────────────────────────────────────────────────
  const savePost = async (post: Post) => {
    setSaving(post.id);
    try {
      const token = await getToken();
      const fd = new FormData();
      fd.append("text", post.text);
      fd.append("date", post.date);
      fd.append("likes", String(post.likes || 0));
      fd.append("comments", String(post.comments || 0));
      if (post.video_url) fd.append("video_url", post.video_url);
      if (post.link) fd.append("link", post.link);
      if (post.link_title) fd.append("link_title", post.link_title);
      const imgFile = postImageFiles[post.id];
      if (imgFile) fd.append("image_file", imgFile);

      if (post.id.startsWith("new_")) {
        const res = await createPost(token, fd);
        setPosts(prev => prev.map(p => p.id === post.id ? { ...post, id: res.id } : p));
        setPostImageFiles(prev => { const n = {...prev}; delete n[post.id]; return n; });
      } else {
        fd.append("remove_image", post.image_url ? "false" : "true");
        await updatePost(token, post.id, fd);
        if (imgFile) setPostImageFiles(prev => { const n = {...prev}; delete n[post.id]; return n; });
      }
      toast(post.id);
    } catch (e: any) { alert("Save failed: " + e.message); }
    setSaving(null);
  };

  const removePost = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    if (!id.startsWith("new_")) {
      try { await deletePost(await getToken(), id); }
      catch (e: any) { alert("Delete failed: " + e.message); return; }
    }
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const dpSrc = dpPreview || (profile.dp_url?.startsWith("data:") ? profile.dp_url : (profile.dp_url || ""));

  return (
    <div className="min-h-screen bg-background">
      {/* Modals */}
      {dpCropSrc && (
        <DPCropper src={dpCropSrc} onConfirm={handleCropConfirm} onCancel={() => setDpCropSrc(null)}/>
      )}
      {showResume && <ResumeViewer onClose={() => setShowResume(false)}/>}

      {/* Header */}
      <div className="glass-card rounded-none border-x-0 border-t-0 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div>
          <h1 className="font-display font-bold text-xl">Portfolio Admin</h1>
          <p className="text-xs text-muted-foreground font-sans">
            {user.email} · API: <span className="font-mono text-primary">{API_BASE}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" target="_blank" className="text-xs text-primary font-sans hover:underline">View site ↗</a>
          <button onClick={() => signOut(auth)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card text-sm font-sans hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut className="w-4 h-4"/> Sign out
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6 space-y-6">

        {/* ── PROFILE ── */}
        <Section title="👤 Profile & Links">
          {loadingProfile ? <Skeleton rows={4}/> : errorProfile ? (
            <ErrorBanner message={errorProfile} onRetry={loadProfile}/>
          ) : (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Full Name" value={profile.name} onChange={v => setProfile({...profile,name:v})}/>
                <Field label="Tagline" value={profile.tagline} onChange={v => setProfile({...profile,tagline:v})}/>
              </div>
              <Field label="Bio" value={profile.bio} onChange={v => setProfile({...profile,bio:v})} textarea/>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Email" value={profile.email} onChange={v => setProfile({...profile,email:v})}/>
                <Field label="Phone" value={profile.phone} onChange={v => setProfile({...profile,phone:v})}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Location" value={profile.location} onChange={v => setProfile({...profile,location:v})}/>
                <Field label="GPA" value={profile.gpa} onChange={v => setProfile({...profile,gpa:v})}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="GitHub URL" value={profile.github} onChange={v => setProfile({...profile,github:v})}/>
                <Field label="LinkedIn URL" value={profile.linkedin} onChange={v => setProfile({...profile,linkedin:v})}/>
              </div>

              {/* DP Upload + Crop */}
              <div>
                <label className="text-xs text-muted-foreground font-sans mb-2 block">Profile Photo (DP)</label>
                <div className="flex items-center gap-4 flex-wrap">
                  {dpSrc ? (
                    <div className="relative">
                      <img src={dpSrc} alt="DP"
                        className="w-20 h-20 rounded-full object-cover border-2 border-primary/20"/>
                      {dpPreview && (
                        <span className="absolute -bottom-1 -right-1 text-xs bg-green-500 text-white rounded-full px-1.5 py-0.5">✓</span>
                      )}
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-secondary border-2 border-dashed border-border flex items-center justify-center text-muted-foreground">
                      <Upload className="w-6 h-6"/>
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg glass-card text-sm font-sans hover:bg-secondary/50 transition-colors">
                      <Upload className="w-4 h-4"/> Choose photo
                      <input type="file" accept="image/*" className="hidden" onChange={handleDpFileChange}/>
                    </label>
                    {dpFile && !dpPreview && (
                      <button onClick={() => { const r=new FileReader(); r.onload=e=>setDpCropSrc(e.target?.result as string); r.readAsDataURL(dpFile); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-sans hover:bg-primary/20 transition-colors">
                        <Crop className="w-4 h-4"/> Crop & preview
                      </button>
                    )}
                    {dpPreview && (
                      <button onClick={() => { setDpPreview(null); setDpCroppedBlob(null); if (dpFile) { const r=new FileReader(); r.onload=e=>setDpCropSrc(e.target?.result as string); r.readAsDataURL(dpFile); } }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-sm font-sans hover:bg-secondary/70 transition-colors">
                        <Crop className="w-4 h-4"/> Recrop
                      </button>
                    )}
                  </div>
                  {dpFile && <span className="text-xs text-primary font-sans">{dpFile.name}</span>}
                </div>
              </div>

              {/* Resume */}
              <div>
                <label className="text-xs text-muted-foreground font-sans mb-2 block">Resume PDF</label>
                <div className="flex items-center gap-3 flex-wrap">
                  <button onClick={() => setShowResume(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card text-sm font-sans hover:bg-secondary/50 transition-colors">
                    <Eye className="w-4 h-4"/> View current resume
                  </button>
                  <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg glass-card text-sm font-sans hover:bg-secondary/50 transition-colors">
                    <Upload className="w-4 h-4"/> Upload new PDF
                    <input type="file" accept=".pdf" className="hidden"
                      onChange={e => { if (e.target.files?.[0]) setResumeFile(e.target.files[0]); }}/>
                  </label>
                  {resumeFile && <span className="text-xs text-green-600 font-sans">✓ {resumeFile.name} ready to upload</span>}
                </div>
              </div>

              {/* Available toggle */}
              <div className="flex items-center gap-3">
                <button onClick={() => setProfile({...profile, available: !profile.available})}
                  className={`relative w-11 h-6 rounded-full transition-colors ${profile.available ? "bg-green-500" : "bg-muted"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${profile.available ? "translate-x-5" : "translate-x-0.5"}`}/>
                </button>
                <span className="text-sm font-sans">Show "Available for work" badge</span>
              </div>
              <SaveBtn onClick={saveProfile} saving={saving==="profile"} saved={saved==="profile"}/>
            </div>
          )}
        </Section>

        {/* ── SKILLS ── */}
        <Section title="🛠️ Skills">
          {loadingSkills ? <Skeleton rows={3}/> : errorSkills ? (
            <ErrorBanner message={errorSkills} onRetry={loadSkills}/>
          ) : (
            <div className="space-y-4 pt-4">
              {skills.length === 0 && (
                <p className="text-sm text-muted-foreground font-sans text-center py-4">No skills yet. Click "Add category" to start.</p>
              )}
              {skills.map((cat, ci) => (
                <div key={ci} className="glass-card p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <input value={cat.title}
                      onChange={e => { const s=[...skills]; s[ci]={...s[ci],title:e.target.value}; setSkills(s); }}
                      className="glass-input flex-1 text-sm font-sans font-semibold" placeholder="Category name"/>
                    <button onClick={() => setSkills(skills.filter((_,i)=>i!==ci))}
                      className="p-2 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cat.skills.map((skill, si) => (
                      <div key={si} className="flex items-center gap-1 glass-card px-3 py-1.5 rounded-full">
                        <input value={skill}
                          onChange={e => { const s=[...skills]; s[ci]={...s[ci],skills:s[ci].skills.map((sk,i)=>i===si?e.target.value:sk)}; setSkills(s); }}
                          className="bg-transparent text-sm font-sans outline-none w-24"/>
                        <button onClick={() => { const s=[...skills]; s[ci]={...s[ci],skills:s[ci].skills.filter((_,i)=>i!==si)}; setSkills(s); }}>
                          <X className="w-3 h-3 text-muted-foreground hover:text-red-500"/>
                        </button>
                      </div>
                    ))}
                    <button onClick={() => { const s=[...skills]; s[ci]={...s[ci],skills:[...s[ci].skills,"New Skill"]}; setSkills(s); }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-dashed border-primary/40 text-xs text-primary hover:bg-primary/5 transition-colors">
                      <Plus className="w-3 h-3"/> Add skill
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex gap-3 flex-wrap">
                <button onClick={() => setSkills([...skills,{title:"New Category",skills:[]}])}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-primary/40 text-sm text-primary hover:bg-primary/5 transition-colors">
                  <Plus className="w-4 h-4"/> Add category
                </button>
                <SaveBtn onClick={saveSkills} saving={saving==="skills"} saved={saved==="skills"}/>
              </div>
            </div>
          )}
        </Section>

        {/* ── EXPERIENCE ── */}
        <Section title="💼 Experience">
          {loadingExp ? <Skeleton rows={2}/> : errorExp ? (
            <ErrorBanner message={errorExp} onRetry={loadExp}/>
          ) : (
            <div className="space-y-4 pt-4">
              {experiences.length === 0 && (
                <p className="text-sm text-muted-foreground font-sans text-center py-4">No entries yet. Click "Add experience" to start.</p>
              )}
              {experiences.map((exp, ei) => (
                <div key={exp.id} className="glass-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <button disabled={ei===0}
                        onClick={() => { const e=[...experiences]; [e[ei],e[ei-1]]=[e[ei-1],e[ei]]; setExperiences(e); }}
                        className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"><ChevronUp className="w-4 h-4"/></button>
                      <button disabled={ei===experiences.length-1}
                        onClick={() => { const e=[...experiences]; [e[ei],e[ei+1]]=[e[ei+1],e[ei]]; setExperiences(e); }}
                        className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"><ChevronDown className="w-4 h-4"/></button>
                    </div>
                    <button onClick={() => setExperiences(experiences.filter(e=>e.id!==exp.id))}
                      className="p-2 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Role" value={exp.title} onChange={v=>{const e=[...experiences];e[ei]={...e[ei],title:v};setExperiences(e);}}/>
                    <Field label="Company" value={exp.company} onChange={v=>{const e=[...experiences];e[ei]={...e[ei],company:v};setExperiences(e);}}/>
                    <Field label="Period (e.g. Jan 2025 — Mar 2025)" value={exp.period} onChange={v=>{const e=[...experiences];e[ei]={...e[ei],period:v};setExperiences(e);}}/>
                    <Field label="Location" value={exp.location} onChange={v=>{const e=[...experiences];e[ei]={...e[ei],location:v};setExperiences(e);}}/>
                  </div>
                  <Field label="Description" value={exp.description} onChange={v=>{const e=[...experiences];e[ei]={...e[ei],description:v};setExperiences(e);}} textarea/>
                  <Field label="Tags (comma separated)" value={exp.tags.join(", ")}
                    onChange={v=>{const e=[...experiences];e[ei]={...e[ei],tags:v.split(",").map(t=>t.trim()).filter(Boolean)};setExperiences(e);}}/>
                  <div className="flex items-center gap-2">
                    <button onClick={()=>{const e=[...experiences];e[ei]={...e[ei],current:!e[ei].current};setExperiences(e);}}
                      className={`w-9 h-5 rounded-full transition-colors relative ${exp.current?"bg-green-500":"bg-muted"}`}>
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${exp.current?"translate-x-4":"translate-x-0.5"}`}/>
                    </button>
                    <span className="text-xs font-sans text-muted-foreground">Mark as current position</span>
                  </div>
                </div>
              ))}
              <div className="flex gap-3 flex-wrap">
                <button onClick={() => setExperiences([{id:`new_${Date.now()}`,title:"",company:"",period:"",location:"",description:"",tags:[],current:false,order:experiences.length},...experiences])}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-primary/40 text-sm text-primary hover:bg-primary/5 transition-colors">
                  <Plus className="w-4 h-4"/> Add experience
                </button>
                <SaveBtn onClick={saveExperiences} saving={saving==="exp"} saved={saved==="exp"}/>
              </div>
            </div>
          )}
        </Section>

        {/* ── POSTS ── */}
        <Section title="📝 LinkedIn Posts">
          {loadingPosts ? <Skeleton rows={2}/> : errorPosts ? (
            <ErrorBanner message={errorPosts} onRetry={loadPosts}/>
          ) : (
            <div className="space-y-4 pt-4">
              <p className="text-xs text-muted-foreground font-sans">Each post saves independently to the database.</p>
              {posts.map((post, pi) => (
                <div key={post.id} className="glass-card p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground font-mono bg-secondary px-2 py-0.5 rounded">{post.id}</span>
                    <button onClick={() => removePost(post.id)}
                      className="p-2 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
                  </div>
                  <Field label="Post text" value={post.text} onChange={v=>{const p=[...posts];p[pi]={...p[pi],text:v};setPosts(p);}} textarea/>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Date (YYYY-MM-DD)" value={post.date} onChange={v=>{const p=[...posts];p[pi]={...p[pi],date:v};setPosts(p);}}/>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Likes" value={String(post.likes)} onChange={v=>{const p=[...posts];p[pi]={...p[pi],likes:Number(v)||0};setPosts(p);}}/>
                      <Field label="Comments" value={String(post.comments)} onChange={v=>{const p=[...posts];p[pi]={...p[pi],comments:Number(v)||0};setPosts(p);}}/>
                    </div>
                  </div>
                  <Field label="Link URL (optional)" value={post.link||""} onChange={v=>{const p=[...posts];p[pi]={...p[pi],link:v};setPosts(p);}}/>
                  {post.link && <Field label="Link display title" value={post.link_title||""} onChange={v=>{const p=[...posts];p[pi]={...p[pi],link_title:v};setPosts(p);}}/>}
                  <Field label="Video URL (optional)" value={post.video_url||""} onChange={v=>{const p=[...posts];p[pi]={...p[pi],video_url:v};setPosts(p);}}/>
                  <div>
                    <label className="text-xs text-muted-foreground font-sans mb-1 block">Image (stored in database)</label>
                    <div className="flex items-center gap-3 flex-wrap">
                      {(postImageFiles[post.id] || post.image_url) && (
                        <img src={postImageFiles[post.id] ? URL.createObjectURL(postImageFiles[post.id]) : post.image_url}
                          alt="" className="w-16 h-16 rounded-lg object-cover border border-border"/>
                      )}
                      <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg glass-card text-xs font-sans hover:bg-secondary/50 transition-colors">
                        <Upload className="w-3.5 h-3.5"/> Upload image
                        <input type="file" accept="image/*" className="hidden"
                          onChange={e=>{if(e.target.files?.[0])setPostImageFiles(prev=>({...prev,[post.id]:e.target.files![0]}));}}/>
                      </label>
                      {post.image_url && (
                        <button onClick={()=>{const p=[...posts];p[pi]={...p[pi],image_url:""};setPosts(p);}}
                          className="text-xs text-red-500 font-sans hover:underline">Remove image</button>
                      )}
                    </div>
                  </div>
                  <SaveBtn onClick={() => savePost(post)} saving={saving===post.id} saved={saved===post.id} label="Save post"/>
                </div>
              ))}
              <button onClick={() => setPosts([{id:`new_${Date.now()}`,text:"",date:new Date().toISOString().split("T")[0],likes:0,comments:0},...posts])}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-primary/40 text-sm text-primary hover:bg-primary/5 transition-colors w-full justify-center">
                <Plus className="w-4 h-4"/> Add new post
              </button>
            </div>
          )}
        </Section>

      </div>
    </div>
  );
};

// ── Entry point ───────────────────────────────────────────────────────────────
const AdminPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u?.email === ADMIN_EMAIL ? u : null);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return user ? <AdminDashboard user={user}/> : <LoginScreen/>;
};

export default AdminPage;