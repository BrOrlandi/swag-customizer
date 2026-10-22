const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const url = process.argv[2];
if (!url) {
  console.error('Usage: node parse_shopify.js <product_url>');
  process.exit(1);
}

async function main() {
  // Extract the product handle from the URL
  // URL format: https://store.com/products/product-handle
  const urlObj = new URL(url);
  const jsonUrl = `${urlObj.origin}${urlObj.pathname}.json`;

  console.log(`Fetching: ${jsonUrl}`);
  const raw = execSync(`curl -s "${jsonUrl}"`, { maxBuffer: 10 * 1024 * 1024 }).toString();

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse JSON response');
    process.exit(1);
  }

  const product = data.product;
  if (!product) {
    console.error('No product data found');
    process.exit(1);
  }

  console.log(`\nProduct: ${product.title}`);
  console.log(`Handle: ${product.handle}`);
  console.log(`Vendor: ${product.vendor}`);
  console.log(`Type: ${product.product_type}`);

  // Build variants
  const variants = (product.variants || []).map(v => ({
    id: v.id,
    title: v.title,
    sku: v.sku,
    price: v.price,
    compare_at_price: v.compare_at_price,
    option1: v.option1,
    option2: v.option2,
    option3: v.option3,
    available: v.available,
    image_id: v.image_id,
  }));

  // Build images
  const images = (product.images || []).map(img => ({
    id: img.id,
    src: img.src,
    alt: img.alt,
    variant_ids: img.variant_ids,
  }));

  // Map variant images
  for (const variant of variants) {
    if (variant.image_id) {
      const img = images.find(i => i.id === variant.image_id);
      variant.image_url = img ? img.src : null;
    } else {
      // Use first image as default
      variant.image_url = images.length > 0 ? images[0].src : null;
    }
  }

  // Build output
  const output = {
    id: product.id,
    handle: product.handle,
    title: product.title,
    vendor: product.vendor,
    product_type: product.product_type,
    description: product.body_html,
    tags: product.tags,
    options: product.options,
    variants: variants,
    images: images,
    source_url: url,
  };

  // Save to individual file
  const outputDir = path.join(__dirname, 'products');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filename = path.join(outputDir, `${product.handle}.json`);
  fs.writeFileSync(filename, JSON.stringify(output, null, 2));
  console.log(`\nSaved to ${filename}`);

  // Print summary
  console.log(`\n=== SUMMARY ===`);
  console.log(`Product: ${product.title}`);
  console.log(`Options: ${(product.options || []).map(o => o.name).join(', ')}`);
  console.log(`Variants: ${variants.length}`);
  for (const v of variants) {
    console.log(`  ${v.title}: R$${v.price} ${v.available ? '' : '(out of stock)'}`);
    if (v.image_url) {
      console.log(`    image: ${v.image_url.substring(0, 100)}...`);
    }
  }
  console.log(`Images: ${images.length}`);
  for (const img of images) {
    console.log(`  ${img.src.substring(0, 100)}...`);
  }
}

main().catch(console.error);
