/* ==========================================================================
   ARK FURNITURE — SITE CONFIG
   --------------------------------------------------------------------------
   Edit the values below to update contact details across the ENTIRE website.
   These are used by main.js to fill in the WhatsApp button, footer links,
   and clickable phone/email links automatically.
   ========================================================================== */

const ARK_CONFIG = {
  // WhatsApp number in international format, no spaces or symbols.
  // This single line controls every WhatsApp button on the site.
  whatsappNumber: "919182200463",
  whatsappMessage: "Hello ARK Furniture, I would like to know more about your furniture collection.",

  phones: ["+91 91822 00463", "+91 96765 86890", "+91 99633 39578"],
  email: "arkfurniturekmr@gmail.com",
  address: "Industrial Area, Old Collector Office, Kamareddy",

  instagramUrl: "https://instagram.com/arkfurniturekmr",
  facebookUrl: "https://facebook.com/ARKFurniture",

  // Replace this with your own Google Maps embed link any time.
  // Google Maps > Share > Embed a map > copy the "src" URL from the iframe code.
  googleMapsEmbedUrl: "https://www.google.com/maps?q=Industrial+Area,+Old+Collector+Office,+Kamareddy&output=embed",
  googleMapsLinkUrl: "https://www.google.com/maps/search/?api=1&query=Industrial+Area+Old+Collector+Office+Kamareddy",
};

// Builds a wa.me link with the configured number + prefilled message.
function arkWhatsappUrl() {
  const msg = encodeURIComponent(ARK_CONFIG.whatsappMessage);
  return `https://wa.me/${ARK_CONFIG.whatsappNumber}?text=${msg}`;
}
