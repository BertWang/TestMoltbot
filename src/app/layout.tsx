import type { Metadata } from "next";
import { Merriweather, Inter } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/sonner"

const serif = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-serif",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Moltbot - 智慧筆記歸檔",
  description: "結合 OCR 與 AI 的智慧筆記整理系統",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body
        className={`${serif.variable} ${sans.variable} antialiased font-sans bg-stone-50 text-stone-900 selection:bg-stone-200 selection:text-stone-900`}
      >
        <SidebarProvider>
          <AppSidebar />
          <main className="flex-1 min-h-screen relative flex flex-col transition-all duration-300 ease-in-out">
            <div className="absolute top-4 left-4 z-50 md:hidden">
                <SidebarTrigger />
            </div>
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </main>
          <Toaster position="bottom-right" theme="light" />
        </SidebarProvider>
      </body>
    </html>
  );
}
