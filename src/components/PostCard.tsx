import { Link } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BlogPost } from "@/data/blogPosts";

interface PostCardProps {
  post: BlogPost;
}

export const PostCard = ({ post }: PostCardProps) => {
  return (
    <Card className="group hover:shadow-xl hover:border-primary/50 transition-all duration-300 bg-gradient-to-br from-card to-card/50 animate-fade-in">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Calendar className="w-4 h-4" />
          <time>{post.date}</time>
        </div>
        <CardTitle className="text-xl group-hover:text-primary transition-colors">
          <Link to={`/blog/${post.slug}`} className="hover:underline">
            {post.title}
          </Link>
        </CardTitle>
        <CardDescription className="mt-2 line-clamp-2">
          {post.excerpt}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className="text-xs font-mono hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
            >
              #{tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Link 
          to={`/blog/${post.slug}`}
          className="flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all group"
        >
          Read more
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </CardFooter>
    </Card>
  );
};
