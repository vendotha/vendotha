import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, ExternalLink, GitFork } from "lucide-react";

interface Repo {
  id: number; name: string; description: string | null;
  language: string | null; stargazers_count: number;
  forks_count: number; html_url: string; topics: string[];
  updated_at: string;
}

const langColors: Record<string,string> = {
  JavaScript:"#f1e05a",TypeScript:"#3178c6",Python:"#3572A5",
  Java:"#b07219","C++":"#f34b7d",HTML:"#e34c26",CSS:"#563d7c",
  Go:"#00ADD8",Rust:"#dea584",Shell:"#89e051",
};

const GITHUB_USERNAME = "vendotha";

const GitHubProjectsSection = ({ onRepoCount }: { onRepoCount: (n: number) => void }) => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=9`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const filtered = data.filter(r => !r.fork).slice(0, 9);
          setRepos(filtered);
          onRepoCount(data.length);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [onRepoCount]);

  const fmt = (d: string) => {
    const dt = new Date(d);
    return `${dt.getDate()}/${dt.getMonth()+1}/${dt.getFullYear()}`;
  };

  return (
    <section id="projects" className="py-24 px-6 relative z-10">
      <div className="max-w-5xl mx-auto">
        <motion.h2 className="text-4xl md:text-5xl font-display font-bold text-center mb-4"
          initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          Projects
        </motion.h2>
        <motion.p className="text-center text-muted-foreground mb-16 font-sans"
          initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} transition={{delay:0.1}}>
          Live from <span className="text-primary font-medium">@{GITHUB_USERNAME}</span> · auto-synced on every visit
        </motion.p>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="glass-card h-48 animate-pulse"/>)}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repos.map((repo, i) => (
              <motion.a key={repo.id} href={repo.html_url} target="_blank" rel="noopener noreferrer"
                className="glass-card-hover p-6 group block"
                initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
                transition={{delay:i*0.07}}>
                <div className="h-0.5 w-0 group-hover:w-full mb-4 rounded-full transition-all duration-500"
                  style={{background:"var(--gradient-accent)"}}/>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold font-display text-foreground group-hover:text-primary transition-colors truncate pr-2">
                    {repo.name}
                  </h3>
                  <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"/>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 font-sans leading-relaxed">
                  {repo.description || "No description available"}
                </p>
                {repo.topics?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {repo.topics.slice(0,3).map(t => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-sans">{t}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground font-sans border-t border-border pt-3">
                  <div className="flex items-center gap-3">
                    {repo.language && (
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor:langColors[repo.language]||"#888"}}/>
                        {repo.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1"><Star className="w-3 h-3"/>{repo.stargazers_count}</span>
                    <span className="flex items-center gap-1"><GitFork className="w-3 h-3"/>{repo.forks_count}</span>
                  </div>
                  <span>Updated {fmt(repo.updated_at)}</span>
                </div>
              </motion.a>
            ))}
          </div>
        )}

        <motion.div className="text-center mt-10"
          initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}}>
          <a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-card font-medium font-sans transition-all hover:-translate-y-0.5 text-sm">
            View all projects on GitHub <ExternalLink className="w-4 h-4"/>
          </a>
        </motion.div>
      </div>
    </section>
  );
};
export default GitHubProjectsSection;
