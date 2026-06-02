import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-heading" });
const roboto = Roboto({ weight: ['400', '500', '700'], subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Official Election Assistant Portal",
  description: "Your official guide to the election process, voting steps, and deadlines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${roboto.variable}`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
