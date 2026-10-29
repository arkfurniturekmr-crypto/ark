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
  googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3787.1724988291444!2d78.31618817464806!3d18.33941317468387!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcc4964cd219e3f%3A0x7388df8a324466c!2sARK%20FURNITURE!5e0!3m2!1sen!2sin!4v1783931758964!5m2!1sen!2sin",
  googleMapsLinkUrl: "https://www.google.com/maps/search/?api=1&query=18.33941317468387,78.31618817464806",
};

// Builds a wa.me link with the configured number + prefilled message.
// Pass a custom message to enquire about one specific photo.
function arkWhatsappUrl(customMessage) {
  const msg = encodeURIComponent(customMessage || ARK_CONFIG.whatsappMessage);
  return `https://wa.me/${ARK_CONFIG.whatsappNumber}?text=${msg}`;
}
