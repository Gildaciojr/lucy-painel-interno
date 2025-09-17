"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaUser,
  FaChartBar,
  FaSyncAlt,
  FaExclamationTriangle,
  FaUserCog,
} from "react-icons/fa";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  text: string;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, text }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${isActive ? "bg-blue-600 text-white shadow-md" : "text-gray-700 hover:bg-gray-200"}`}
    >
      <div className="text-xl">{icon}</div>
      <span className="text-sm font-semibold">{text}</span>
    </Link>
  );
};

export default function AdminNavigation() {
  return (
    <nav className="flex flex-col p-6 space-y-2">
      <NavItem href="/users" icon={<FaUser />} text="Usuários" />
      <NavItem href="/engagement" icon={<FaChartBar />} text="Engajamento" />
      <NavItem href="/conversion" icon={<FaSyncAlt />} text="Conversão" />
      <NavItem
        href="/support"
        icon={<FaExclamationTriangle />}
        text="Suporte"
      />
      <NavItem href="/admins" icon={<FaUserCog />} text="Administradores" />
    </nav>
  );
}
