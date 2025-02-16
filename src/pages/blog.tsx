import React from "react";
import { Link } from "wouter";

// Mock blog posts data
const blogPosts = [
  {
    id: 1,
    title: "The Art of Traditional Indian Weaving",
    excerpt: "Discover the intricate techniques and rich history behind traditional Indian textile weaving...",
    date: "2024-02-15",
    category: "Culture",
    readTime: "5 min read"
  },
  {
    id: 2,
    title: "Sustainable Fashion: A Modern Necessity",
    excerpt: "Exploring how luxury fashion brands are adopting sustainable practices while maintaining quality...",
    date: "2024-02-10",
    category: "Sustainability",
    readTime: "4 min read"
  },
  {
    id: 3,
    title: "Wedding Season Style Guide 2024",
    excerpt: "Your comprehensive guide to choosing the perfect outfit for this wedding season...",
    date: "2024-02-05",
    category: "Style Guide",
    readTime: "6 min read"
  }
];

export const Blog: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">KHUSH.IN Blog</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
          <article key={post.id} className="group cursor-pointer">
            <Link href={`/blog/${post.id}`}>
              <div className="space-y-4">
                <div className="aspect-video bg-primary/5 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-muted-foreground">Blog Image</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{post.category}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                  
                  <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  
                  <p className="text-muted-foreground">
                    {post.excerpt}
                  </p>
                  
                  <div className="text-sm text-muted-foreground">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Blog;
