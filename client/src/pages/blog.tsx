import { useQuery } from "@tanstack/react-query";
import { BlogCard } from "@/components/blog/blog-card";
import type { BlogPost } from "@shared/schema";

export default function Blog() {
  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">Blog</h1>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts?.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
