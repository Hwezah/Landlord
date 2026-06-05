import { LocationProvider } from "@/app/_components/LocationProvider";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/app/providers/auth-provider";
import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Find Your Space | Uganda's Property Platform",
  description: "Find rental houses, office spaces and shops across Uganda",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        inter.variable,
        "font-sans",
        geist.variable,
      )}
    >
      <body className={`${inter.className} min-h-full flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <LocationProvider>{children}</LocationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
