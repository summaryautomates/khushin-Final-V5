import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

// Validation schema for API key
const apiKeySchema = z.string().min(1, "API key is required");

// Environment variable setup - using the provided key directly
const API_KEY = 'AIzaSyA08rjxgp24C7emSPxqVTFjXKGsU1clEQM';

// Initialize the Gemini API client
const initializeGeminiClient = (): GoogleGenerativeAI | null => {
  try {
    // Create the client with the API key
    const genAI = new GoogleGenerativeAI(API_KEY);
    return genAI;
  } catch (error) {
    console.error('Error initializing Gemini client:', error);
    return null;
  }
};

// Get AI response for user query
export const getAIResponse = async (userMessage: string): Promise<string> => {
  const genAI = initializeGeminiClient();
  
  if (!genAI) {
    console.warn('Using fallback response: Gemini client unavailable');
    return getFallbackResponse(userMessage);
  }
  
  try {
    // Use the gemini-1.5-flash model based on the available models from the API
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are a helpful shopping assistant for KHUSH.IN, a premium e-commerce store
specializing in high-quality lighters and accessories. 
Respond to the following customer query: "${userMessage}"
Be concise, helpful, and conversational. Limit your response to 100 words maximum.`;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    if (!text) {
      console.warn('Empty response from Gemini API');
      return getFallbackResponse(userMessage);
    }
    
    return text;
  } catch (error) {
    console.error('Error getting Gemini AI response:', error);
    return getFallbackResponse(userMessage);
  }
};

// Fallback responses when API is unavailable
const getFallbackResponse = (query: string): string => {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('product') || lowerQuery.includes('lighter')) {
    return `Here are some details about our products that match your query "${query}". We have a wide range of premium lighters and accessories.`;
  } else if (lowerQuery.includes('price') || lowerQuery.includes('cost')) {
    return `Our products are premium quality and prices vary. For specific pricing on "${query}", I recommend checking our product catalog.`;
  } else if (lowerQuery.includes('shipping') || lowerQuery.includes('delivery')) {
    return "We offer worldwide shipping. Standard delivery takes 3-5 business days within India, and international shipping typically takes 7-14 business days.";
  } else {
    return `I understand you're asking about: ${query}. As your shopping assistant, I'm here to help with product information, shipping details, and any other questions about KHUSH.IN's premium products.`;
  }
};