export const metadata = {
  title: "YouTube Clip Maker",
  description: "Create and share YouTube clips easily",
};

import "./globals.css";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <header className="mb-8">
            <h1 className="text-2xl font-bold">YouTube Clip Maker</h1>
            <p className="text-sm text-gray-600">
              Generate shareable clip links with start/end times.
            </p>
          </header>
          {children}
          <footer className="mt-12 text-center text-xs text-gray-500">
            Built for agentic-1d727343
          </footer>
        </div>
      </body>
    </html>
  );
}
