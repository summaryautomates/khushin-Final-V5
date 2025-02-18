import { useQuery } from "@tanstack/react-query";
import { BlogCard } from "@/components/blog/blog-card";
import type { BlogPost } from "@shared/schema";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Blog() {
  const { data: posts, isLoading, error, refetch } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
    staleTime: 60000, // Cache for 1 minute
  });

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="mt-2">
            <p>Failed to load blog posts. Please try again later.</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()} 
              className="mt-2"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!posts?.length) {
    return (
      <div className="container py-8">
        <h1 className="mb-8 text-3xl font-bold">Blog</h1>
        <p className="text-muted-foreground text-center py-12">
          No blog posts available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">Blog</h1>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}