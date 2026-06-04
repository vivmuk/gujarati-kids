import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFA63D" },
  ],
};

export const metadata: Metadata = {
  title: "ગુજરાતી શીખો — Learn Gujarati for Kids",
  description:
    "A beautiful, interactive app for kids to learn Gujarati with AI-powered speech, images, and stories. Based on the Natural Approach.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/images/home.webp",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ગુજરાતી શીખો",
  },
  openGraph: {
    title: "ગુજરાતી શીખો — Learn Gujarati for Kids",
    description: "Fun, interactive Gujarati learning with AI speech, images & stories!",
    images: ["/images/home.webp"],
    type: "website",
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
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@300;400;500;600;700;800&family=Nunito:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
