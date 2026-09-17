"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/store";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Smartphone,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Package,
  Search,
  LucideIcon,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { NotificationBell } from "@/components/notifications";
import { RoleSwitcher } from "@/components/role-switcher";
import { Button } from "@/components/ui";
import Image from "next/image";
import { logo1 } from "../../../public";

const ADMIN_NAVIGATION = [
  { label: "Overview", href: "/admin", icon: "LayoutDashboard" },
  { label: "Users", href: "/admin/users", icon: "Users" },
  { label: "Roles", href: "/admin/roles", icon: "Shield" },
  { label: "Services", href: "/admin/services", icon: "Package" },
  { label: "Numbers", href: "/admin/numbers", icon: "Smartphone" },
  { label: "Transactions", href: "/admin/transactions", icon: "CreditCard" },
  { label: "Credits", href: "/admin/credits", icon: "BarChart3" },
];

const ADMIN_ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  Shield,
  Package,
  Smartphone,
  CreditCard,
  BarChart3,
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    window.location.href = "/auth/login";
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        className="hidden md:flex flex-col w-64 border-r border-border bg-card-background"
        initial={{ x: -256 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border flex items-center gap-2">
          <Image
            src={logo1}
            alt="Femoj Logo"
            width={40}
            height={40}
            priority
            className="h-10 w-auto"
          />
          <span className="font-bold text-lg">Femoj Admin</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {ADMIN_NAVIGATION.map((item) => {
            const isActive = pathname === item.href;
            const Icon = ADMIN_ICONS[item.icon] || Settings;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors border-l-4 ${
                  isActive
                    ? "bg-blue-50 text-primary border-l-primary"
                    : "text-muted-foreground hover:bg-muted border-l-transparent"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border space-y-3 bg-blue-50">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-700 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-md">
              {user?.first_name?.charAt(0) || "A"}
              {user?.last_name?.charAt(0) || ""}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              className="justify-start gap-2"
            >
              <Shield className="w-4 h-4" />
              Switch to User
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            onClick={handleLogout}
            className="justify-start gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="border-b border-border bg-background h-16 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-muted rounded-lg"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-muted px-3 py-2 rounded-lg flex-1 max-w-md">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm w-full"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <RoleSwitcher />
            <NotificationBell />
            <Link
              href="/admin/settings"
              className="p-2 hover:bg-muted rounded-lg"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 mx-auto w-full">{children}</div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <motion.div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </motion.div>
      )}

      {/* Mobile Sidebar Drawer */}
      <motion.aside
        className="fixed left-0 top-0 h-screen w-64 border-r border-border bg-white z-50 md:hidden flex flex-col shadow-lg"
        initial={{ x: -256 }}
        animate={{ x: sidebarOpen ? 0 : -256 }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <Image
              src={logo1}
              alt="Femoj Logo"
              width={32}
              height={32}
              priority
              className="h-8 w-auto"
            />
            <span className="font-bold text-lg">Femoj Admin</span>
          </div>
          <button onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {ADMIN_NAVIGATION.map((item) => {
            const isActive = pathname === item.href;
            const Icon = ADMIN_ICONS[item.icon] || Settings;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors border-l-4 ${
                  isActive
                    ? "bg-blue-50 text-primary border-l-primary"
                    : "text-muted-foreground hover:bg-muted border-l-transparent"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border space-y-3 bg-blue-50">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-700 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-md">
              {user?.first_name?.charAt(0) || "A"}
              {user?.last_name?.charAt(0) || ""}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              className="justify-start gap-2"
            >
              <Shield className="w-4 h-4" />
              Switch to User
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            onClick={handleLogout}
            className="justify-start gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </motion.aside>
    </div>
  );
}
