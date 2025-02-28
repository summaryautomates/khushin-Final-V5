
#!/bin/bash

echo "Verifying image directories..."

# Create required directories if they don't exist
mkdir -p client/public/placeholders
mkdir -p client/public/images

# Check if placeholder images exist
if [ ! -f client/public/placeholders/product-placeholder.svg ]; then
  echo "Creating product placeholder image..."
  cat > client/public/placeholders/product-placeholder.svg << EOF
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#f0f0f0"/>
  <path d="M100,65 L130,110 L100,155 L70,110 Z" fill="#d0d0d0"/>
  <circle cx="100" cy="85" r="12" fill="#a0a0a0"/>
  <text x="100" y="180" font-family="Arial" font-size="14" text-anchor="middle" fill="#808080">Product Image</text>
</svg>
EOF
fi

if [ ! -f client/public/placeholders/image-placeholder.svg ]; then
  echo "Creating image placeholder..."
  cat > client/public/placeholders/image-placeholder.svg << EOF
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#f5f5f5"/>
  <path d="M80,60 L120,60 L120,140 L80,140 Z" fill="#e0e0e0"/>
  <circle cx="100" cy="85" r="15" fill="#d0d0d0"/>
  <path d="M70,120 L130,120 L130,140 L70,140 Z" fill="#d0d0d0"/>
  <text x="100" y="170" font-family="Arial" font-size="12" text-anchor="middle" fill="#909090">Image Placeholder</text>
</svg>
EOF
fi

echo "Image directories verified."
echo "You may need to add actual product images to client/public/images/ directory."
