import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {default:"EduConnect",template:"EduConnect | %s"},
  description: "A modern website for students",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased ${cn("bg-white dark:bg-[#313338]" )}`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem = {false}
          storageKey="educonnect-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
