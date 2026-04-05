import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body"
});

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading"
});

export const metadata: Metadata = {
  title: "Cloaka",
  description: "Business payment operating system for Nigerian SMEs."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${bodyFont.variable} ${headingFont.variable} font-[family-name:var(--font-body)] text-[var(--color-ink)] antialiased`}
      >
        <Script
          id="sanitize-extension-attributes"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                const shouldStrip = (name) =>
                  name === 'bis_skin_checked' ||
                  name === 'bis_register' ||
                  name.startsWith('__processed_');

                const stripFromElement = (element) => {
                  if (!(element instanceof Element)) return;
                  for (const attribute of Array.from(element.attributes)) {
                    if (shouldStrip(attribute.name)) {
                      element.removeAttribute(attribute.name);
                    }
                  }
                };

                const stripTree = (root) => {
                  if (!(root instanceof Element)) return;
                  stripFromElement(root);
                  root.querySelectorAll('*').forEach(stripFromElement);
                };

                stripTree(document.documentElement);

                const observer = new MutationObserver((mutations) => {
                  for (const mutation of mutations) {
                    if (mutation.type === 'attributes') {
                      stripFromElement(mutation.target);
                    }

                    mutation.addedNodes.forEach((node) => {
                      if (node instanceof Element) {
                        stripTree(node);
                      }
                    });
                  }
                });

                observer.observe(document.documentElement, {
                  subtree: true,
                  childList: true,
                  attributes: true
                });
              })();
            `
          }}
        />
        {children}
      </body>
    </html>
  );
}
