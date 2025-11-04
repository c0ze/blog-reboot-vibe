import { useState } from "react";
import { Header } from "@/components/Header";
import { PostCard } from "@/components/PostCard";
import { TagFilter } from "@/components/TagFilter";
import { blogPosts, getPostsByTag } from "@/data/blogPosts";

const Blog = () => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  const filteredPosts = selectedTag 
    ? getPostsByTag(selectedTag)
    : blogPosts;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog Posts</h1>
          <p className="text-xl text-muted-foreground">
            {selectedTag 
              ? `Posts tagged with #${selectedTag}` 
              : `All posts (${blogPosts.length})`
            }
          </p>
        </div>

        <div className="animate-slide-up">
          <TagFilter 
            selectedTag={selectedTag} 
            onTagSelect={setSelectedTag} 
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post, index) => (
            <div 
              key={post.id} 
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <PostCard post={post} />
            </div>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <p className="text-xl text-muted-foreground">
              No posts found with tag #{selectedTag}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Blog;
