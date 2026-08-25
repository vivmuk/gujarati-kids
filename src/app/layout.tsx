import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // The riso paper is the app's ground in every state, including the notch
  // and the pull-to-refresh overscroll.
  themeColor: "#f6efdd",
};

const DESCRIPTION =
  "Learn Gujarati by ear. 47 letters, 283 words, 48 stories and 9 nursery rhymes, every one of them spoken aloud, illustrated, and free to tap at.";

export const metadata: Metadata = {
  metadataBase: new URL("https://gujarati-kids.vercel.app"),
  title: "ગુજરાતી શીખો — Learn Gujarati for Kids",
  description: DESCRIPTION,
  applicationName: "ગુજરાતી શીખો",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ગુજરાતી શીખો",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "ગુજરાતી શીખો — Learn Gujarati for Kids",
    description: DESCRIPTION,
    images: [{ url: "/images/og.png", width: 1200, height: 630, alt: "ગુજરાતી શીખો — Learn Gujarati" }],
    type: "website",
    locale: "gu_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "ગુજરાતી શીખો — Learn Gujarati for Kids",
    description: DESCRIPTION,
    images: ["/images/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="gu" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* ====================================================================
        THESIS: A Gujarati primer printed as a two-colour riso zine, where the
        interface is made of the same ink as the 690 illustrations inside it.
        It refuses the rounded-card pastel kids-app grid.
        OWN-WORLD: Saffron #ef5a23 and indigo #1d3c6e on cream #f6efdd paper
        with visible fibre grain. Hard 2.5px ink keylines, flat offset
        second-pass shadows, halftone screens, Ajrakh lozenge borders. Noto
        Sans Gujarati leads; Space Grotesk supports. All marks drawn as SVG —
        no emoji anywhere in the chrome.
        STORY: A child opens it, sees the one letter they were on, taps it,
        hears it, and keeps going. Nothing asks them to read first.
        FIRST VIEWPORT: Guju and the Gujarati masthead, then the indigo
        Continue card with the letter's picture and a saffron play button,
        then the six section tiles alternating saffron and indigo.
        FORM: Inherited and unified from the incumbent Riso-Folk world
        (established-world extension; no direction roll).
        FINISH: unreviewed and undocumented is unfinished; this build ends with
        the finish review, the verdict, and DESIGN.md
        ==================================================================== */}
        {children}
      </body>
    </html>
  );
}
