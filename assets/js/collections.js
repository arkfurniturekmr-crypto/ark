/* ==========================================================================
   ARK FURNITURE — COLLECTIONS & PHOTO SLOTS
   --------------------------------------------------------------------------
   This is the ONE place that says how many photos each collection has.

     photos : how many photos you have today
     spare  : extra empty slots kept ready for photos you add later
              (a slot that has no photo is simply hidden — nothing breaks)

   Photos live in:   assets/images/products/<folder>/<prefix> <number>.<format>
   Example:          assets/images/products/bed/bed 12.jpg

   To add MORE photos than photos + spare, just raise the numbers below.
   ========================================================================== */

const ARK_PHOTO_ROOT = "assets/images/products";

const ARK_COLLECTIONS = [
  { slug: "antique", name: "Antique", prefix: "antique", photos: 4, spare: 4 },
  { slug: "bed", name: "Bed", prefix: "bed", photos: 39, spare: 4 },
  { slug: "chairs", name: "Chairs", prefix: "chair", photos: 14, spare: 4 },
  { slug: "dining", name: "Dining", prefix: "dining", photos: 22, spare: 4 },
  { slug: "door", name: "Door", prefix: "door", photos: 17, spare: 4 },
  { slug: "dressing", name: "Dressing", prefix: "dressing", photos: 27, spare: 4 },
  { slug: "jhula", name: "Jhula", prefix: "jhula", photos: 3, spare: 4 },
  { slug: "marriage-set", name: "Marriage Set", prefix: "marriage set", photos: 32, spare: 4 },
  { slug: "showcase", name: "Showcase", prefix: "showcase", photos: 9, spare: 4 },
  { slug: "sofa", name: "Sofa", prefix: "sofa", photos: 25, spare: 4 },
  { slug: "cushion-sofa", name: "Cushion Sofa", prefix: "cushion", photos: 11, spare: 4 },
];

// Homepage slideshow: files are  hero-1, hero-2, ... (any image format).
const ARK_HERO = { folder: "assets/images/hero-slider", prefix: "hero-", slots: 8 };

/* Path (without file extension) of photo number n in a collection. */
function arkPhotoBase(root, collection, n) {
  return `${root}${ARK_PHOTO_ROOT}/${collection.slug}/${collection.prefix} ${n}`;
}
