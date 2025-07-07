import type { Express } from "express";
import { storage } from '../storage';
import { z } from "zod";

/**
 * Product related API routes
 */
export function productRoutes(app: Express) {
  // Get all products
  app.get("/api/products", async (_req, res) => {
    try {
      const products = await storage.getProducts();
      
      // If no products are returned (database issue), return empty array with success status
      if (!products) {
        console.log('No products found or database unavailable, returning empty array');
        return res.json([]);
      }
      
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      
      // Return empty array instead of error to prevent frontend crashes
      res.json([]);
    }
  });

  // Get product by ID
  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          message: "Invalid product ID format"
        });
      }

      const product = await storage.getProductById(id);
      if (!product) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      res.json(product);
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      res.status(500).json({
        message: "Failed to fetch product"
      });
    }
  });

  // Get products by category
  app.get("/api/products/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      if (!category) {
        return res.status(400).json({
          message: "Category is required"
        });
      }

      const products = await storage.getProductsByCategory(category);
      res.json(products || []);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      res.json([]);
    }
  });

  // Search products
  app.get("/api/products/search/:query", async (req, res) => {
    try {
      const { query } = req.params;
      if (!query || query.length < 2) {
        return res.status(400).json({
          message: "Search query must be at least 2 characters"
        });
      }

      // Get all products and filter by search term
      const allProducts = await storage.getProducts();
      if (!allProducts || allProducts.length === 0) {
        return res.json([]);
      }
      
      const searchQuery = query.toLowerCase();
      
      const filteredProducts = allProducts.filter(product => {
        return (
          product.name.toLowerCase().includes(searchQuery) ||
          product.description.toLowerCase().includes(searchQuery) ||
          product.category.toLowerCase().includes(searchQuery) ||
          product.collection.toLowerCase().includes(searchQuery)
        );
      });

      res.json(filteredProducts);
    } catch (error) {
      console.error('Error searching products:', error);
      res.json([]);
    }
  });
}