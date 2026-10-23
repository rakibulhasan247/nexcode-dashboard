import type { Metadata } from "next";
import { DM_Sans, Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["600"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["500"],
});

export const metadata: Metadata = {
  title: "NexCode Reports",
  description: "Build and track revenue reports across sales, marketing and support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} ${dmSans.variable} font-sans antialiased`}>
        <noscript>
          <style>{"[data-animate]{visibility:visible!important}"}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
