/* ==========================================================================
   ARK FURNITURE — IMAGE LOADER (any photo format)
   --------------------------------------------------------------------------
   Given a path WITHOUT an extension  (e.g. "assets/images/products/bed/bed 1"),
   arkFindPhoto() finds the real file whatever its format is:
   jpg, jpeg, png, webp, avif, gif, jfif, bmp ... and iPhone HEIC/HEIF
   (HEIC is converted in the browser, only when such a file really exists).

   It resolves with the loaded image and its ORIGINAL file URL, or null when
   no photo exists in that slot. Nothing is cropped, resized or re-saved.
   ========================================================================== */

const ARK_IMAGE_EXTS = [
  "jpg", "jpeg", "png", "webp", "avif", "gif", "jfif", "bmp",
  "JPG", "JPEG", "PNG", "WEBP",           // servers are case-sensitive
];
const ARK_HEIC_EXTS = ["heic", "HEIC", "heif", "HEIF"];
const ARK_HEIC_LIB = "assets/js/vendor/heic2any.min.js";

const arkLearnedExt = {};   // remembers the format used in each folder
let arkHeicPromise = null;

/* Encode every path segment so names with spaces ("bed 1.jpg") work. */
function arkEncodePath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function arkLoadImg(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("not found"));
    img.src = url;
  });
}

/* Resolves with the first promise that succeeds, or null if all fail. */
function arkFirstSuccess(promises) {
  return new Promise(resolve => {
    let left = promises.length;
    if (!left) return resolve(null);
    promises.forEach(p =>
      p.then(resolve, () => { if (--left === 0) resolve(null); })
    );
  });
}

function arkLoadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error("script failed"));
    document.head.appendChild(s);
  });
}

async function arkLoadHeic(url, root) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("not found");
  const blob = await res.blob();
  if (!window.heic2any) {
    arkHeicPromise = arkHeicPromise || arkLoadScript(root + ARK_HEIC_LIB);
    await arkHeicPromise;
  }
  let out = await window.heic2any({ blob, toType: "image/jpeg", quality: 0.92 });
  if (Array.isArray(out)) out = out[0];
  const objectUrl = URL.createObjectURL(out);
  const img = await arkLoadImg(objectUrl);
  return { img, url: objectUrl };
}

/**
 * @param {string} base  path without extension, relative to the current page
 * @param {string} folderKey  any string identifying the folder (for format memory)
 * @param {string} root  "" on the homepage, "../" inside /categories/
 */
async function arkFindPhoto(base, folderKey, root = "") {
  const encoded = arkEncodePath(base);
  const tryExt = ext =>
    arkLoadImg(`${encoded}.${ext}`).then(img => ({ img, url: `${encoded}.${ext}`, ext }));

  // 1) Most likely format first (the one that worked for the last photo).
  const first = arkLearnedExt[folderKey] || ARK_IMAGE_EXTS[0];
  let hit = await tryExt(first).catch(() => null);

  // 2) Otherwise try every other format at once.
  if (!hit) {
    hit = await arkFirstSuccess(
      ARK_IMAGE_EXTS.filter(e => e !== first).map(tryExt)
    );
  }

  // 3) Finally iPhone HEIC / HEIF (converted in the browser).
  if (!hit) {
    hit = await arkFirstSuccess(
      ARK_HEIC_EXTS.map(ext => arkLoadHeic(`${encoded}.${ext}`, root))
    );
  } else {
    arkLearnedExt[folderKey] = hit.ext;
  }

  if (!hit) return null;
  return {
    img: hit.img,
    url: hit.url,
    w: hit.img.naturalWidth || 4,
    h: hit.img.naturalHeight || 3,
  };
}
