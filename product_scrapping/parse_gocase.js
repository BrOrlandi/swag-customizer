const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const url = process.argv[2];
if (!url) {
  console.error('Usage: node parse_gocase.js <product_url>');
  process.exit(1);
}

async function main() {
  console.log(`Fetching: ${url}`);

  // Use curl to fetch the page (handles redirects reliably)
  const html = execSync(`curl -s -L "${url}"`, { maxBuffer: 10 * 1024 * 1024 }).toString();

  // Extract __NUXT__ data
  const nuxtStart = html.indexOf('__NUXT__=');
  if (nuxtStart === -1) {
    console.error('Could not find __NUXT__ data in page');
    process.exit(1);
  }

  const scriptEnd = html.indexOf('</script>', nuxtStart);
  const nuxtCode = html.substring(nuxtStart + '__NUXT__='.length, scriptEnd).trim();
  console.log(`Found NUXT code (${nuxtCode.length} chars)`);

  const nuxtData = eval(nuxtCode);

  // Find the product object recursively
  const product = findProduct(nuxtData);
  if (!product) {
    console.error('Could not find product data in NUXT state');
    process.exit(1);
  }

  console.log(`\nProduct: ${product.name}`);
  console.log(`SKU: ${product.sku}`);

  // Build the mockup image URL for a given case_type + device combination
  function buildMockupUrl(productSku, caseTypeCode, deviceCode) {
    return `https://ik.imagekit.io/gocase/govinci/${productSku}/${caseTypeCode}-${deviceCode}/mockup`;
  }

  // Devices = size variants (e.g. "Fresh 650ml", "Fresh 950ml")
  const devices = product.devices || [];
  console.log(`\nDevices (sizes): ${devices.length}`);
  devices.forEach(d => console.log(`  ${d.name} (${d.code})`));

  // Case types = color variants (e.g. "Branca", "Preta", "Azul Marinho")
  const caseTypes = product.case_types || [];
  console.log(`\nCase types (colors): ${caseTypes.length}`);
  caseTypes.forEach(ct => console.log(`  ${ct.name} (${ct.code})`));

  // Build output: for each color, get the mockup image for each available size
  const variants = [];

  for (const caseType of caseTypes) {
    const colorVariant = {
      color_name: caseType.name,
      color_code: caseType.code,
      color_swatch_url: caseType.case_image,
      sizes: []
    };

    for (const device of caseType.devices || []) {
      // Find the matching device info
      const deviceInfo = devices.find(d => d.id === device.device_id);
      if (!deviceInfo) continue;

      const mockupUrl = buildMockupUrl(product.sku, caseType.code, deviceInfo.code);

      colorVariant.sizes.push({
        device_id: device.device_id,
        case_device_id: device.case_device_id,
        size_name: deviceInfo.name,
        size_code: deviceInfo.code,
        in_stock: device.in_stock,
        additional_price: device.cost_price,
        mockup_url: mockupUrl
      });
    }

    variants.push(colorVariant);
  }

  // Build the output JSON
  const output = {
    id: product.id,
    sku: product.sku,
    slug: product.slug,
    name: product.name,
    product_type_code: product.product_type_code,
    description: product.description,
    price: product.price_with_cost,
    old_price: product.old_price_with_cost,
    default_case_device_id: product.default_case_device_id,
    devices: devices.map(d => ({
      id: d.id,
      name: d.name,
      code: d.code,
      brand: d.brand
    })),
    variants: variants,
    source_url: url
  };

  // Save to individual file per product
  const outputDir = path.join(__dirname, 'products');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filename = path.join(outputDir, `${product.sku}.json`);
  fs.writeFileSync(filename, JSON.stringify(output, null, 2));
  console.log(`\nSaved to ${filename}`);

  // Print summary
  console.log(`\n=== SUMMARY ===`);
  console.log(`Product: ${product.name}`);
  console.log(`Sizes: ${devices.map(d => d.name).join(', ')}`);
  console.log(`Colors: ${variants.length}`);
  for (const v of variants) {
    const availableSizes = v.sizes.filter(s => s.in_stock).map(s => s.size_name).join(', ');
    console.log(`  ${v.color_name}: ${availableSizes || '(out of stock)'}`);
    for (const s of v.sizes) {
      console.log(`    ${s.size_name}: ${s.mockup_url}`);
    }
  }
}

function findProduct(obj, depth = 0) {
  if (depth > 5 || !obj || typeof obj !== 'object') return null;

  if (obj.sku && obj.name && obj.case_types) {
    return obj;
  }

  const keys = Array.isArray(obj) ? obj.map((_, i) => i) : Object.keys(obj);
  for (const key of keys) {
    const result = findProduct(obj[key], depth + 1);
    if (result) return result;
  }
  return null;
}

main().catch(console.error);
