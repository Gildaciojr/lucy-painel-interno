"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Logo from "../components/Logo";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token && pathname !== "/login") {
      router.push("/login");
    } else if (token && pathname === "/login") {
      router.push("/users");
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_id");
    router.push("/login");
  };

  if (!isAuthenticated && pathname !== "/login") {
    return (
      <html lang="pt-BR">
        <body className={inter.className}>
          <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center p-6 bg-white rounded-xl shadow-md">
              Carregando...
            </div>
          </div>
        </body>
      </html>
    );
  }

  if (pathname === "/login") {
    return (
      <html lang="pt-BR">
        <body className={inter.className}>{children}</body>
      </html>
    );
  }

  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-gray-100">
          <aside className="w-64 bg-purple-200 shadow-lg p-4">
            <div className="mb-8">
              <Logo />
            </div>
            <Sidebar />
          </aside>
          <div className="flex-1 p-8">
            <Header />
            <main>{children}</main>
            {isAuthenticated && (
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleLogout}
                  className="p-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
