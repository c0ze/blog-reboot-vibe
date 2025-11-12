import { Link, useLocation } from "react-router-dom";
import { Code2, BookOpen, Archive } from "lucide-react";

export const Header = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
        >
          <Code2 className="w-8 h-8 text-primary" />
          Coze
        </Link>
        
        <div className="flex items-center gap-6">
          <Link
            to="/blog"
            className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
              isActive("/blog") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Blog
          </Link>
          <Link
            to="/archive"
            className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
              isActive("/archive") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Archive className="w-4 h-4" />
            Archive
          </Link>
        </div>
      </nav>
    </header>
  );
};
