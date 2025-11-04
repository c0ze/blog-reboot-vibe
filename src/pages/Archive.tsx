import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { blogPosts } from "@/data/blogPosts";
import { Calendar } from "lucide-react";

const Archive = () => {
  // Group posts by year
  const postsByYear = blogPosts.reduce((acc, post) => {
    const year = new Date(post.date).getFullYear().toString();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(post);
    return acc;
  }, {} as Record<string, typeof blogPosts>);

  const years = Object.keys(postsByYear).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Archive</h1>
          <p className="text-xl text-muted-foreground">
            All posts organized by year
          </p>
        </div>

        <div className="space-y-12 animate-slide-up">
          {years.map((year) => (
            <div key={year} className="space-y-4">
              <h2 className="text-3xl font-bold text-primary mb-6">{year}</h2>
              <div className="space-y-3">
                {postsByYear[year]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((post) => (
                    <Link
                      key={post.id}
                      to={`/blog/${post.slug}`}
                      className="block group p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-card/50 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[120px]">
                          <Calendar className="w-4 h-4" />
                          <time>{post.date}</time>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold group-hover:text-primary transition-colors mb-1">
                            {post.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {post.excerpt}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Archive;
