import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppSessionProvider } from "@/components/session-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RoLearn — Professional network for Roblox creators",
  description:
    "The developer network for Roblox creators. Publish work, find gigs, recruit teams, and build reputation.",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://img.icons8.com" />
        <link rel="dns-prefetch" href="https://img.icons8.com" />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <NavigationProgress />
          <AppSessionProvider>{children}</AppSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
