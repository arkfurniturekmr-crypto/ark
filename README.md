# ARK Furniture Website

A premium, responsive catalog website for ARK Furniture. No cart, no online
payments — customers browse and contact you on WhatsApp or phone.

## How the site is organized

```
ark-furniture/
├── index.html              Home page (hero slider + "Our Collection" grid)
├── about.html               About Us
├── contact.html              Contact Us
├── locate-us.html            Locate Us (Google Map)
├── categories/                One page per collection (10 files)
│    ├── teak-bed.html
│    ├── teak-showcase.html
│    ├── teak-dressings.html
│    ├── teak-sofa.html
│    ├── cushion-sofa.html
│    ├── luxury-sofa.html
│    ├── luxury-beds.html
│    ├── complete-furniture-set.html
│    ├── jhula.html
│    └── antique-items.html
└── assets/
     ├── css/style.css        All colors, fonts, spacing — one file
     ├── js/config.js         Phone numbers, email, WhatsApp, map link — EDIT THIS FIRST
     ├── js/main.js            Site behavior (menu, slider, animations)
     ├── js/lightbox.js         Fullscreen product image gallery
     ├── js/pagination.js       12-products-per-page pagination
     └── images/
          ├── hero-slider/       5 homepage slideshow images
          ├── collections/<slug>/cover.jpg      1 cover photo per collection
          └── products/<slug>/product-NN-img-N.jpg   4 photos per product
```

All images currently in the site are **placeholders** generated to match the
brand colors — replace them with real product photography using the exact
same file names and folders, and the site updates automatically.

## The 3 things you'll edit most often

### 1. Contact details, WhatsApp number, Google Map
Open `assets/js/config.js`. Everything there (phone numbers, email, address,
WhatsApp number, Instagram/Facebook links, Google Maps link) is used across
every page automatically — edit it once, and it updates the whole site.

To get your own Google Maps embed link: open Google Maps → search your
location → Share → Embed a map → copy the link inside `src="..."` and paste
it in as `googleMapsEmbedUrl`.

### 2. Product photos
Go to `assets/images/products/<collection-name>/`. Each product has 4 images
named like `product-01-img-1.jpg`, `product-01-img-2.jpg`, etc. Replace those
files with your real photos, keeping the same file names — no code changes
needed.

### 3. Adding or editing a product
Open the relevant file in `categories/`. Each product is one `<div
class="product-card">` block. Copy an existing block, paste it, and change
the title, description text, and the 4 image file paths. The pagination
(12 products per page) updates automatically as you add more.

## Running the site locally

Just double-click `index.html`, or for full functionality (some browsers
restrict local file access), run a simple local server from this folder:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Publishing the site

This site is plain HTML/CSS/JS with no build step, so it works on any static
host:

- **GitHub Pages**: push this folder to a GitHub repo and enable Pages in
  the repo settings.
- **Any web host**: upload the whole `ark-furniture` folder via FTP/hosting
  file manager.

## Notes

- Icons are loaded from Font Awesome and fonts from Google Fonts via CDN —
  the site needs an internet connection for those to load (they're free).
- The WhatsApp button, phone/email links, and floating scroll-to-top button
  appear automatically on every page.
