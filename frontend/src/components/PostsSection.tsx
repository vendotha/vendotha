import { motion } from "framer-motion";
import { ExternalLink, Heart, MessageCircle, Link as LinkIcon } from "lucide-react";
import { usePosts } from "@/hooks/usePortfolioData";

const PostsSection = () => {
  const { posts, loading } = usePosts();

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });

  return (
    <section id="posts" className="py-24 px-6 relative z-10">
      <div className="max-w-3xl mx-auto">
        <motion.h2 className="text-4xl md:text-5xl font-display font-bold text-center mb-4"
          initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          LinkedIn Posts
        </motion.h2>
        <motion.p className="text-center text-muted-foreground mb-16 font-sans"
          initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} transition={{delay:0.1}}>
          Thoughts, updates, and milestones shared along the way
        </motion.p>

        {loading ? (
          <div className="space-y-6">
            {[1,2,3].map(i => <div key={i} className="glass-card h-36 animate-pulse"/>)}
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post, i) => (
              <motion.div key={post.id} className="glass-card-hover p-6"
                initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
                transition={{delay:i*0.1}}>
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold text-sm font-display flex-shrink-0">
                    BV
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm font-sans text-foreground">Buvananand Vendotha</div>
                    <div className="text-xs text-muted-foreground font-sans">
                      Python Backend Developer · {fmt(post.date)}
                    </div>
                  </div>
                  <a href="https://www.linkedin.com/in/vendotha" target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary flex items-center gap-1 font-sans hover:underline flex-shrink-0">
                    <ExternalLink className="w-3 h-3"/> LinkedIn
                  </a>
                </div>

                {/* Text */}
                <p className="text-sm font-sans text-foreground leading-relaxed mb-4 whitespace-pre-line">
                  {post.text}
                </p>

                {/* Image */}
                {post.image_url && (
                  <div className="mb-4 rounded-lg overflow-hidden border border-border">
                    <img src={post.image_url} alt="Post" className="w-full object-cover max-h-72"/>
                  </div>
                )}

                {/* Video */}
                {post.video_url && (
                  <div className="mb-4 rounded-lg overflow-hidden border border-border">
                    <video src={post.video_url} controls className="w-full max-h-72"/>
                  </div>
                )}

                {/* Link */}
                {post.link && (
                  <a href={post.link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-secondary/50 border border-border hover:border-primary/40 transition-colors text-sm font-sans group">
                    <LinkIcon className="w-4 h-4 text-primary flex-shrink-0"/>
                    <span className="text-primary group-hover:underline truncate">
                      {post.link_title || post.link}
                    </span>
                  </a>
                )}

                {/* Footer */}
                <div className="flex items-center gap-4 pt-3 border-t border-border text-xs text-muted-foreground font-sans">
                  <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5"/>{post.likes}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5"/>{post.comments} comments</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
export default PostsSection;
