-- Premium Lighters (5 products)
INSERT INTO products (name, description, price, category, images, customizable, features) VALUES
(
  'Aurora Elite Lighter',
  'Hand-crafted premium lighter with platinum finish and intricate engravings. Features a dual flame system and premium fuel efficiency.',
  299900, -- ₹2,999
  'lighters',
  ARRAY['/product-images/aurora-elite-1.webp', '/product-images/aurora-elite-2.webp'],
  true,
  '{"material": "Platinum-plated brass", "dimensions": "1.5 x 0.5 x 3 inches", "warranty": "Lifetime", "features": ["Dual flame system", "Wind-resistant", "Fuel window", "Adjustable flame height"]}'
),
(
  'Quantum X-Series Lighter',
  'State-of-the-art premium lighter with built-in temperature control and ergonomic design. Perfect for cigar enthusiasts.',
  349900, -- ₹3,499
  'lighters',
  ARRAY['/product-images/quantum-x-1.webp', '/product-images/quantum-x-2.webp'],
  true,
  '{"material": "Aircraft-grade aluminum", "dimensions": "2 x 1 x 3.5 inches", "warranty": "10 years", "features": ["Temperature control", "Triple flame", "Fuel gauge", "Impact resistant"]}'
),
(
  'Celestial Diamond Lighter',
  'Premium diamond-studded lighter with 24K gold accents. A true collectors item combining luxury with functionality.',
  499900, -- ₹4,999
  'lighters',
  ARRAY['/product-images/celestial-1.webp', '/product-images/celestial-2.webp'],
  true,
  '{"material": "24K gold-plated brass with diamonds", "dimensions": "1.8 x 0.8 x 3.2 inches", "warranty": "Lifetime", "features": ["Diamond accents", "Single jet flame", "Protective case included", "Numbered edition"]}'
),
(
  'Nova Pro Lighter',
  'Professional-grade premium lighter with laser ignition system and temperature monitoring display.',
  399900, -- ₹3,999
  'lighters',
  ARRAY['/product-images/nova-pro-1.webp', '/product-images/nova-pro-2.webp'],
  false,
  '{"material": "Aerospace titanium", "dimensions": "2.2 x 1.2 x 3.8 inches", "warranty": "5 years", "features": ["Laser ignition", "Digital display", "Temperature control", "USB rechargeable"]}'
),
(
  'Royal Sapphire Lighter',
  'Limited edition premium lighter adorned with genuine sapphires and hand-polished silver finish.',
  599900, -- ₹5,999
  'lighters',
  ARRAY['/product-images/royal-sapphire-1.webp', '/product-images/royal-sapphire-2.webp'],
  true,
  '{"material": "Sterling silver with sapphires", "dimensions": "1.6 x 0.7 x 3.0 inches", "warranty": "Lifetime", "features": ["Sapphire inlays", "Dual flame system", "Gift box included", "Certificate of authenticity"]}'
),

-- Luxury Lighters (5 products)
(
  'Vintage Classic Lighter',
  'Timeless luxury lighter with traditional flip-top design and classic brass construction.',
  199900, -- ₹1,999
  'lighters',
  ARRAY['/product-images/vintage-classic-1.webp', '/product-images/vintage-classic-2.webp'],
  false,
  '{"material": "Polished brass", "dimensions": "1.4 x 0.5 x 2.8 inches", "warranty": "2 years", "features": ["Classic design", "Windproof", "Flint wheel ignition", "Vintage finish"]}'
),
(
  'Metropolitan Elite Lighter',
  'Modern luxury lighter with sleek design and advanced electronic ignition system.',
  249900, -- ₹2,499
  'lighters',
  ARRAY['/product-images/metropolitan-1.webp', '/product-images/metropolitan-2.webp'],
  false,
  '{"material": "Brushed stainless steel", "dimensions": "1.8 x 0.6 x 3.2 inches", "warranty": "3 years", "features": ["Electronic ignition", "Safety lock", "Fuel level window", "Gift box included"]}'
),
(
  'Art Deco Lighter',
  'Luxury lighter inspired by art deco design with geometric patterns and chrome finish.',
  179900, -- ₹1,799
  'lighters',
  ARRAY['/product-images/art-deco-1.webp', '/product-images/art-deco-2.webp'],
  true,
  '{"material": "Chrome-plated zinc alloy", "dimensions": "1.5 x 0.5 x 2.9 inches", "warranty": "2 years", "features": ["Art deco design", "Single flame", "Adjustable flame", "Presentation box"]}'
),
(
  'Urban Style Lighter',
  'Contemporary luxury lighter with matte black finish and side squeeze ignition.',
  159900, -- ₹1,599
  'lighters',
  ARRAY['/product-images/urban-style-1.webp', '/product-images/urban-style-2.webp'],
  false,
  '{"material": "Matte black aluminum", "dimensions": "1.6 x 0.6 x 3.0 inches", "warranty": "1 year", "features": ["Side squeeze ignition", "Windproof", "Sleek design", "Compact size"]}'
),
(
  'Bronze Age Lighter',
  'Luxury lighter with antique bronze finish and traditional flint wheel mechanism.',
  189900, -- ₹1,899
  'lighters',
  ARRAY['/product-images/bronze-age-1.webp', '/product-images/bronze-age-2.webp'],
  true,
  '{"material": "Antique bronze", "dimensions": "1.4 x 0.5 x 2.7 inches", "warranty": "2 years", "features": ["Antique finish", "Flint wheel", "Collectible design", "Gift packaging"]}'
),

-- Refuelling Solutions (5 products)
(
  'Premium Butane Refill',
  'Ultra-pure butane refill with universal adapter set for all premium lighters.',
  49900, -- ₹499
  'refueling',
  ARRAY['/product-images/butane-refill-1.webp', '/product-images/butane-refill-2.webp'],
  false,
  '{"material": "Ultra-pure butane", "dimensions": "6.0 x 2.0 x 2.0 inches", "warranty": "Quality guarantee", "features": ["Universal adapters", "99.9% pure", "300ml capacity", "Safety valve"]}'
),
(
  'Deluxe Maintenance Kit',
  'Complete lighter maintenance kit including cleaning tools, flints, and cotton swabs.',
  79900, -- ₹799
  'refueling',
  ARRAY['/product-images/maintenance-kit-1.webp', '/product-images/maintenance-kit-2.webp'],
  false,
  '{"material": "Professional grade tools", "dimensions": "8.0 x 4.0 x 2.0 inches", "warranty": "1 year", "features": ["Cleaning tools", "Spare flints", "Cotton swabs", "Carrying case"]}'
),
(
  'Quick-Fill Adapter Set',
  'Professional-grade adapter set for quick and safe refueling of all lighter types.',
  39900, -- ₹399
  'refueling',
  ARRAY['/product-images/adapter-set-1.webp', '/product-images/adapter-set-2.webp'],
  false,
  '{"material": "Brass and plastic", "dimensions": "4.0 x 2.0 x 1.0 inches", "warranty": "6 months", "features": ["Universal fit", "Quick-connect", "Safety lock", "Storage case"]}'
),
(
  'Premium Flint Pack',
  'High-quality replacement flints compatible with all premium and luxury lighters.',
  29900, -- ₹299
  'refueling',
  ARRAY['/product-images/flint-pack-1.webp', '/product-images/flint-pack-2.webp'],
  false,
  '{"material": "Premium flint compound", "dimensions": "2.0 x 1.0 x 0.5 inches", "warranty": "Quality guarantee", "features": ["Universal size", "Long-lasting", "6 pieces", "Storage tube"]}'
),
(
  'Refueling Station Kit',
  'Professional refueling station with premium butane, adapters, and maintenance tools.',
  99900, -- ₹999
  'refueling',
  ARRAY['/product-images/refueling-station-1.webp', '/product-images/refueling-station-2.webp'],
  false,
  '{"material": "Various materials", "dimensions": "12.0 x 8.0 x 4.0 inches", "warranty": "2 years", "features": ["Complete kit", "Premium fuel", "Tool set", "Storage case"]}'
);