// The BYOK shim (public/byok.js) installs this on window so every client fetch
// can carry the visitor's own Venice key. Declared once, here, so the components
// read it without a cast and `next build` type-checks.
export {};

declare global {
  interface Window {
    getVeniceKey?: () => string | null;
  }
}
