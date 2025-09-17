import React from "react";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="w-full bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <Logo />
      <nav className="space-x-4 text-sm text-gray-600">
        Painel Administrativo
      </nav>
    </header>
  );
}
