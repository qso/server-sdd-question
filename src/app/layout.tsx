import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "服务端开发 AI 研发提效问卷",
  description: "收集服务端开发同学的时间分配数据",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          {children}
        </div>
      </body>
    </html>
  );
}
