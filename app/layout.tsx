import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Your IP Address | Địa chỉ IP của bạn",
  description: "Check your public IP address and browser information.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
