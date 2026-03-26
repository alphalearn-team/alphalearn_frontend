import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import '@mantine/spotlight/styles.css';
import "./globals.css";

import type { Metadata } from "next";
import { Roboto_Mono } from "next/font/google";


import { AuthProvider } from "@/lib/auth/client/AuthContext";
import { Notifications } from "@mantine/notifications";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";


const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AlphaLearn",
  description: "Learn concepts and build lessons with community moderation.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript forceColorScheme="dark" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${robotoMono.variable} antialiased`}
      >
        <MantineProvider 
            forceColorScheme="dark"
            theme={{
                fontFamily: "var(--font-roboto-mono), monospace",
                headings: {
                fontFamily: "var(--font-roboto-mono), monospace",
                },
            }}
        >
          <AuthProvider>
            <Notifications position="bottom-right" />
            {children}
          </AuthProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
