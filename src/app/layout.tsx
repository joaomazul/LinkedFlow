import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { ClerkProvider } from '@clerk/nextjs'
// import { dark } from '@clerk/themes'

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "LinkedFlow",
  description: "LinkedIn Content & Engagement Flow",
};

import { KeyboardShortcutsProvider } from "@/components/providers/KeyboardShortcutsProvider";
import { OnboardingGuard } from "@/components/providers/OnboardingGuard";
import { env } from "@/env";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#5b6ef5',
          borderRadius: '0.75rem',
        },
      }}
      signInFallbackRedirectUrl={process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL}
      signUpFallbackRedirectUrl={process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL}
    >
      <html lang="pt-BR">
        <body
          className={`${bricolage.variable} ${instrument.variable} font-instrument bg-lf-bg text-lf-text antialiased`}
        >
          <TooltipProvider>
            <Providers>
              <KeyboardShortcutsProvider>
                <OnboardingGuard defaultAccountId={env.UNIPILE_LINKEDIN_ACCOUNT_ID}>
                  {children}
                </OnboardingGuard>
              </KeyboardShortcutsProvider>
            </Providers>
            <Toaster position="bottom-right" theme="light" closeButton />
          </TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
