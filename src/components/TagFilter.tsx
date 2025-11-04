import { Badge } from "@/components/ui/badge";
import { getTags } from "@/data/blogPosts";

interface TagFilterProps {
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

export const TagFilter = ({ selectedTag, onTagSelect }: TagFilterProps) => {
  const tags = getTags();

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <Badge
        onClick={() => onTagSelect(null)}
        variant={selectedTag === null ? "default" : "outline"}
        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors font-mono"
      >
        All Posts
      </Badge>
      {tags.map((tag) => (
        <Badge
          key={tag}
          onClick={() => onTagSelect(tag)}
          variant={selectedTag === tag ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors font-mono"
        >
          #{tag}
        </Badge>
      ))}
    </div>
  );
};
