/*!
 * Hydragear product catalog
 * One entry per Amazon listing, keyed by ASIN. This feeds the product
 * detail pop-up and the hover/focus background colours on the product grid.
 *
 * To update a product, edit its entry here (in both js/ and public/js/):
 *   - amazonBullets: paste the "About this item" bullets from the Amazon
 *     listing, one string per bullet. Leave [] to hide that section.
 *   - description: a short paragraph shown under the title.
 *   - highlights: short feature tags (taken from the Amazon listing title).
 *   - gallery: extra photos (paths relative to the site root).
 *   - colors: background palette that matches the bottle.
 *       base   = solid background colour behind the gradient
 *       deep   = darkest bottle tone
 *       accent = brightest accent (lid, handle, strap)
 *       glow   = soft highlight / backdrop tone
 */
window.HYDRAGEAR_PRODUCTS = {
  B0D5KMC7VK: {
    slug: 'elk-bottle',
    name: 'Elk Bottle',
    price: 19.99,
    highlights: ['Stainless steel', 'Easy-push', 'Carry handle'],
    description: '',
    amazonBullets: [],
    gallery: [
      'images/CoreHome_Manna_Hydragear_Web_Photos-14_1.webp'
    ],
    colors: { base: '#544c59', deep: '#2f2d40', accent: '#ff8a3d', glow: '#b9a6ff' }
  },
  B0D5KH39WK: {
    slug: 'juno-tumbler',
    name: 'Juno Tumbler',
    price: 24.99,
    highlights: ['Stainless steel', 'Reusable tumbler', 'Handle + straw'],
    description: '',
    amazonBullets: [],
    gallery: [
      'images/Core_Home_Hydragear_Studio_edits-18.webp',
      'images/Silver-Fish-Bottle.webp',
      'images/CoreHome_Manna_Hydragear_Web_Photos-11_1.webp'
    ],
    colors: { base: '#84c7c8', deep: '#577c86', accent: '#a8e0d6', glow: '#c9b8ff' }
  },
  B0D5KN2KKY: {
    slug: 'zenith-straw-bottle',
    name: 'Zenith Straw Bottle',
    price: 24.99,
    highlights: ['Stainless steel', 'Carabiner', 'Compass', 'Whistle'],
    description: 'Designed for those who push limits, the Zenith Bottle blends sleek design with cutting-edge insulation technology. Whether you’re hitting the gym or exploring the outdoors, stay hydrated and look good doing it.',
    amazonBullets: [],
    gallery: [
      'images/CoreHome_Manna_Hydragear_Web_Photos-13_1.webp',
      'images/CoreHome_Manna_Hydragear_Web_Photos-11_1.webp',
      'images/3-bottles.webp'
    ],
    colors: { base: '#1c6b50', deep: '#203d32', accent: '#30ff8a', glow: '#b8e6c4' }
  },
  B0D5K6NM68: {
    slug: 'zenith-bottle-chugger',
    name: 'Zenith Bottle Chugger',
    price: 27.99,
    highlights: ['Chugger lid', 'Stainless steel', 'Carabiner', 'Compass'],
    description: 'Designed for those who push limits, the Zenith Bottle blends sleek design with cutting-edge insulation technology. Whether you’re hitting the gym or exploring the outdoors, stay hydrated and look good doing it.',
    amazonBullets: [],
    gallery: [
      'images/Core_Home_Hydragear_Studio_edits-3_1.webp',
      'images/Core_Home_Hydragear_Studio_edits-4_1.webp'
    ],
    colors: { base: '#663594', deep: '#4e1d54', accent: '#b48cff', glow: '#6c97c5' }
  },
  B0D5KWQ4ZK: {
    slug: 'breaker-tumbler',
    name: 'Breaker Tumbler',
    price: 19.99,
    highlights: ['Stainless steel', 'Reusable tumbler', 'Straw lid'],
    description: '',
    amazonBullets: [],
    gallery: [
      'images/Core_Home_Hydragear_Studio_edits-16_1.webp',
      'images/50484-AMZ_SM_08.jpg',
      'images/50484-AMZ_SM_11.jpg'
    ],
    colors: { base: '#edc6d0', deep: '#ce9fb5', accent: '#f7d5de', glow: '#9fd8ff' }
  },
  B0D5KVNPQZ: {
    slug: 'alpine-bottle',
    name: 'Alpine Bottle',
    price: 44.99,
    highlights: ['Insulated', 'Stainless steel', 'Leak-proof'],
    description: '',
    amazonBullets: [],
    gallery: [
      'images/Core_Home_Hydragear_Studio_edits-9_1.webp',
      'images/Core_Home_Hydragear_Studio_edits-10_1.webp'
    ],
    colors: { base: '#a5bbae', deep: '#723570', accent: '#9ed8c4', glow: '#efcbcc' }
  }
};
