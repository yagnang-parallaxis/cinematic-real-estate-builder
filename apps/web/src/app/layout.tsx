import type { Metadata } from "next";
import type { ReactNode } from "react";

import { bootSeenBootstrapScript } from "@cinematic/section-library/loading-logic";

import { accentFont, bodyFont, displayFont } from "./fonts";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aurelia Residences",
  description: "A cinematic prototype for a boutique residential development.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} ${accentFont.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: bootSeenBootstrapScript(),
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
