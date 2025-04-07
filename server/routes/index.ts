import type { Express } from "express";
import { productRoutes } from './productRoutes';
import { cartRoutes } from './cartRoutes';
import { orderRoutes } from './orderRoutes';
import { aiRoutes } from './aiRoutes';
import { healthRoutes } from './healthRoutes';

/**
 * Register all application routes
 * This function imports and registers route handlers from individual route modules
 */
export async function registerRoutes(app: Express) {
  // Register health routes first
  healthRoutes(app);
  
  // Register product routes
  productRoutes(app);
  
  // Register cart routes
  cartRoutes(app);
  
  // Register order routes
  orderRoutes(app);
  
  // Register AI-related routes
  aiRoutes(app);
  
  console.log('All routes registered successfully');
}