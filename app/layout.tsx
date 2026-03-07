import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Discord - Login",
  description: "Login to Discord",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#36393f] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
