import { useParams, Link } from "react-router-dom";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypePrism from "rehype-prism-plus";
import Gist from "react-embed";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPostBySlug } from "@/data/blogPosts";
import { Calendar, ArrowLeft } from "lucide-react";

const BlogPost = () => {
  const { slug } = useParams();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The blog post you're looking for doesn't exist.
          </p>
          <Link to="/blog">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  const processedContent = post.content
    .replace(
      /{{< youtube\s+([a-zA-Z0-9_-]+)\s+>}}/g,
      '<iframe width="560" height="315" src="https://www.youtube.com/embed/$1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    )
    .replace(
      /{{<\s*highlight\s+json\s*>}}([\s\S]*?){{<\s*\/\s*highlight\s*>}}/g,
      "```json\n$1\n```"
    )
    .replace(
      /{{<\s*highlight\s+docker\s*>}}([\s\S]*?){{<\s*\/\s*highlight\s*>}}/g,
      "```docker\n$1\n```"
    )
    .replace(
      /{{<\s*highlight\s+yaml\s*>}}([\s\S]*?){{<\s*\/\s*highlight\s*>}}/g,
      "```yaml\n$1\n```"
    )
    .replace(
      /{{<\s*highlight\s+go\s*>}}([\s\S]*?){{<\s*\/\s*highlight\s*>}}/g,
      "```go\n$1\n```"
    )
    .replace(
      /{{< gist ([a-zA-Z0-9]+) ([a-zA-Z0-9]+) >}}/g,
      '<div data-gist-id="$1/$2"></div>'
    );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <article className="container mx-auto px-4 py-16 max-w-4xl">
        <Link to="/blog">
          <Button variant="ghost" className="gap-2 mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Button>
        </Link>

        <div className="animate-fade-in">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Calendar className="w-4 h-4" />
            <time>{post.date}</time>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            {post.title}
          </h1>

          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="font-mono hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="prose prose-invert prose-lg max-w-none animate-slide-up">
          {post.excerpt && (
            <div className="bg-card border border-border rounded-lg p-8 mb-8">
              <p className="text-lg leading-relaxed text-muted-foreground mb-6">
                {post.excerpt}
              </p>
            </div>
          )}

          <div className="prose prose-invert prose-lg max-w-none space-y-6 text-foreground leading-relaxed">
            <Markdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypePrism]}
              components={{
                table: ({ node, ...props }) => (
                  <table className="w-full text-left border-collapse" {...props} />
                ),
                thead: ({ node, ...props }) => (
                  <thead className="bg-card border-b border-border" {...props} />
                ),
                th: ({ node, ...props }) => (
                  <th className="p-4 font-medium" {...props} />
                ),
                td: ({ node, ...props }) => (
                  <td className="p-4 border-t border-border" {...props} />
                ),
                div: (props) => {
                  const { "data-gist-id": gistId, ...rest } = props as any;
                  if (gistId) {
                    return <Gist url={`https://gist.github.com/${gistId}`} />;
                  }
                  return <div {...rest} />;
                },
              }}
            >
              {processedContent}
            </Markdown>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <Link to="/blog">
            <Button variant="outline" className="gap-2 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to all posts
            </Button>
          </Link>
        </div>
      </article>
    </div>
  );
};

export default BlogPost;
