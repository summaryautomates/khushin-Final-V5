import { useState } from "react";
import { Button } from "@/components/ui/button";
import ProductInfoBox from "./product-info-box";
import { ShareIcon, HelpCircleIcon, GiftIcon } from "lucide-react";

interface Feature {
  icon: string;
  text: string;
}

interface Product {
  id: string;
  name: string;
  price: string;
  description: string;
  deliveryInfo: {
    express: boolean;
    eta: string;
  };
  features: Feature[];
}

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);

  // Function to determine which icon to render
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "gift":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
            <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
          </svg>
        );
      case "badge-check":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case "truck":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2v5a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-4a1 1 0 00-.293-.707l-3-3A1 1 0 0016 3H4a1 1 0 00-1 1z" />
          </svg>
        );
      case "arrow-down-circle":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
          </svg>
        );
      default:
        return <GiftIcon className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">{product.name}</h1>
        <p className="text-xl text-yellow-500 font-semibold mb-4">{product.price}</p>
        <div className="prose text-gray-300">
          <p>{product.description}</p>
        </div>
      </div>

      {/* Delivery Notice */}
      <ProductInfoBox>
        <div className="flex items-start space-x-3">
          <div className="text-yellow-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-white font-medium">Express delivery available</p>
            <p className="text-yellow-500 text-sm mt-1">{product.deliveryInfo.eta}</p>
          </div>
        </div>
      </ProductInfoBox>

      {/* Add to Cart Section */}
      <div className="flex space-x-4">
        <Button 
          variant="outline" 
          className="flex-1 bg-[#0A0A0A] hover:bg-gray-900 text-white border-gray-800"
          onClick={() => console.log("Add to cart clicked")}
        >
          Add to Cart
        </Button>
        <Button 
          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
          onClick={() => console.log("Buy now clicked")}
        >
          Buy Now
        </Button>
      </div>

      {/* Product Features */}
      <ProductInfoBox>
        <ul className="space-y-4">
          {product.features.map((feature, index) => (
            <li key={index} className="flex items-start space-x-3">
              <div className="text-yellow-500 flex-shrink-0 mt-1">
                {renderIcon(feature.icon)}
              </div>
              <div>
                <p className="text-white font-medium">{feature.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </ProductInfoBox>

      {/* Gift Options Section */}
      <div className="mt-8">
        <div className="flex items-center mb-4">
          <span className="text-yellow-500 mr-2">
            <GiftIcon className="h-5 w-5" />
          </span>
          <h3 className="text-lg font-medium">Gift Options Available</h3>
        </div>
        <p className="text-gray-300 text-sm">
          Add a personalized message or choose luxury gift wrapping during checkout.
        </p>
      </div>

      {/* Share Product */}
      <div className="flex items-center mt-8">
        <span className="text-sm text-gray-400 mr-4">Share this product:</span>
        <div className="flex space-x-3">
          <button
            aria-label="Share on Facebook"
            className="text-gray-400 hover:text-yellow-500 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
            </svg>
          </button>
          <button
            aria-label="Share on Twitter"
            className="text-gray-400 hover:text-yellow-500 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
            </svg>
          </button>
          <button
            aria-label="Share on Pinterest"
            className="text-gray-400 hover:text-yellow-500 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
            </svg>
          </button>
          <button
            aria-label="Share by Email"
            className="text-gray-400 hover:text-yellow-500 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Need Help Button */}
      <div className="flex justify-end mt-4">
        <button className="flex items-center text-yellow-500 hover:text-yellow-600 transition">
          <HelpCircleIcon className="h-5 w-5 mr-1" />
          Need help?
        </button>
      </div>
    </div>
  );
}
