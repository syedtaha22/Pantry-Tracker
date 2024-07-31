import { Poppins } from "next/font/google";
import "./globals.css";

// Import the Poppins font with necessary weights
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata = {
  title: "Pantry Pal",
  description: "Effortlessly manage your pantry with Pantry Pal. Track, add, and organize your items with a user-friendly interface designed to simplify your life.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.className}>{children}</body>
    </html>
  );
}
