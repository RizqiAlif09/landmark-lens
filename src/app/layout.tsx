import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Landmark Lens AR",
  description: "AI-powered photo tourism app",
  icons: {
    icon: "/logo.ico", // Secara otomatis membaca dari folder public/logo.ico
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
