import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { blogPosts } from "@/data/blogPosts";
import { ArrowRight, Sparkles } from "lucide-react";

const Home = () => {
  const featuredPosts = blogPosts.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary animate-glow" />
          <span className="text-sm font-mono text-primary">Software Development Journey</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-cyan-400 bg-clip-text text-transparent">
          Coze
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Exploring programming languages, frameworks, design patterns, and more. 
          A place where I share my journey through Go, AWS, DevOps, and modern web technologies.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/blog">
            <Button size="lg" className="gap-2 group">
              View All Posts
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/archive">
            <Button size="lg" variant="outline" className="gap-2">
              Browse Archive
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Latest Posts</h2>
          <Link to="/blog" className="text-primary hover:underline flex items-center gap-2">
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredPosts.map((post, index) => (
            <div key={post.id} style={{ animationDelay: `${index * 0.1}s` }}>
              <PostCard post={post} />
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="container mx-auto px-4 py-16 animate-slide-up">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">About This Blog</h2>
          <p className="text-muted-foreground leading-relaxed">
            This blog is a collection of technical articles, tutorials, and insights 
            from my experience as a software developer. I focus on practical solutions 
            to real-world problems, covering topics like Go programming, cloud infrastructure, 
            DevOps practices, and modern web development.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
