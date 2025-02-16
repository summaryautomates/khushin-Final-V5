import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactMessageSchema } from "../shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Products API
  const productsRouter = {
    getAll: async (_req: Request, res: Response) => {
      const products = await storage.getProducts();
      res.json(products);
    },

    getById: async (req: Request, res: Response) => {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    },

    getByCategory: async (req: Request, res: Response) => {
      const products = await storage.getProductsByCategory(req.params.category);
      res.json(products);
    }
  };

  // Blog API
  const blogRouter = {
    getAll: async (_req: Request, res: Response) => {
      const posts = await storage.getBlogPosts();
      res.json(posts);
    },

    getBySlug: async (req: Request, res: Response) => {
      const post = await storage.getBlogPost(req.params.slug);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    }
  };

  // Register routes
  app.get("/api/products", productsRouter.getAll);
  app.get("/api/products/:id", productsRouter.getById);
  app.get("/api/products/category/:category", productsRouter.getByCategory);
  app.get("/api/blog", blogRouter.getAll);
  app.get("/api/blog/:slug", blogRouter.getBySlug);

  // Contact route
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const data = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(data);
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: error.errors 
        });
      }
      throw error;
    }
  });

  return createServer(app);
}