import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import useAuthStore from "@/store/useAuthStore";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Tag,
  Bookmark,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Layers,
  Package,
  User,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

type SidebarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const { user, logout } = useAuthStore();
  // const isAdmin = checkIsAdmin();

  return (
    <motion.aside
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex flex-col border-r border-slate-700/50 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl transition-all duration-300",
        open ? "w-64" : "w-20"
      )}
      initial={{ width: open ? 256 : 80 }}
      animate={{ width: open ? 256 : 80 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="flex items-center justify-between p-4 h-16 bg-gradient-to-r from-[#29beb3] via-slate-700 to-[#a96bde] border-b border-slate-600/50">
        <motion.div
          className={cn(
            "flex items-center overflow-hidden",
            open ? "w-auto opacity-100" : "w-0 opacity-0"
          )}
          initial={{ opacity: open ? 1 : 0, width: open ? "auto" : 0 }}
          animate={{ opacity: open ? 1 : 0, width: open ? "auto" : 0 }}
          transition={{ duration: 0.2 }}
        >
          <span className="font-bold text-xl text-white drop-shadow-lg">
            BabyShop Admin
          </span>
        </motion.div>

        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(!open)}
            className="rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white border border-white/20 hover:border-white/30 backdrop-blur-sm"
          >
            <motion.div
              animate={{ rotate: open ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              {open ? (
                <ChevronLeft size={20} />
              ) : (
                <ChevronRight className="rotate-180" size={20} />
              )}
            </motion.div>
          </Button>
        </motion.div>
      </div>

      <div className="flex flex-col gap-1 flex-1 p-3 bg-gradient-to-b from-slate-900/50 to-slate-800/50">
        <NavItem
          to="/dashboard"
          icon={<LayoutDashboard size={20} />}
          label="Dashboard"
          open={open}
          end={true}
        />
        <NavItem
          to="/dashboard/account"
          icon={<User size={20} />}
          label="Account"
          open={open}
        />
        <NavItem
          to="/dashboard/users"
          icon={<Users size={20} />}
          label="Users"
          open={open}
        />
        <NavItem
          to="/dashboard/orders"
          icon={<Package size={20} />}
          label="Orders"
          open={open}
        />
        <NavItem
          to="/dashboard/invoices"
          icon={<FileText size={20} />}
          label="Invoices"
          open={open}
        />
        <NavItem
          to="/dashboard/banners"
          icon={<Layers size={20} />}
          label="Banners"
          open={open}
        />
        <NavItem
          to="/dashboard/products"
          icon={<ShoppingBag size={20} />}
          label="Products"
          open={open}
        />
        <NavItem
          to="/dashboard/categories"
          icon={<Tag size={20} />}
          label="Categories"
          open={open}
        />
        <NavItem
          to="/dashboard/brands"
          icon={<Bookmark size={20} />}
          label="Brands"
          open={open}
        />
      </div>

      <div className="p-4 border-t border-slate-600/50 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800">
        <motion.div
          className={cn(
            "flex items-center gap-3 mb-4",
            open ? "justify-start" : "justify-center"
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#29beb3] to-[#a96bde] flex items-center justify-center text-white font-semibold overflow-hidden shadow-lg ring-2 ring-white/20">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.name}
                className="h-full w-full object-cover"
              />
            ) : (
              user?.name?.charAt(0).toUpperCase()
            )}
          </div>

          <AnimatePresence>
            {open && (
              <motion.div
                className="flex flex-col"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-sm font-medium text-white truncate max-w-[150px]">
                  {user?.name}
                </span>
                <span className="text-xs text-[#29beb3] capitalize font-medium bg-slate-700/50 px-2 py-1 rounded-full backdrop-blur-sm">
                  {user?.role}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size={open ? "default" : "icon"}
            onClick={logout}
            className="w-full border-red-500/30 hover:bg-red-600/20 hover:border-red-400/50 text-red-400 hover:text-red-300 transition-colors bg-red-600/10 backdrop-blur-sm"
          >
            <LogOut size={16} className={cn("mr-2", !open && "mr-0")} />
            {open && "Logout"}
          </Button>
        </motion.div>
      </div>
    </motion.aside>
  );
}

type NavItemProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
  open: boolean;
  end?: boolean;
};

function NavItem({ to, icon, label, open, end = false }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center py-3 px-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
          "hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 hover:text-white hover:shadow-lg hover:backdrop-blur-sm",
          isActive
            ? "bg-gradient-to-r from-[#29beb3]/20 to-[#a96bde]/20 text-white shadow-lg shadow-[#29beb3]/20 scale-105 ring-1 ring-[#29beb3]/30 border border-white/10 backdrop-blur-sm"
            : "text-slate-300 hover:scale-102",
          !open && "justify-center"
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Background glow effect for active item */}
          {isActive && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#29beb3]/30 to-[#a96bde]/30 opacity-30 blur-xl rounded-xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}

          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={cn(
              "relative z-10 transition-colors duration-200",
              !open && "mr-0",
              open && "mr-3",
              isActive ? "text-white" : "text-slate-300 group-hover:text-white"
            )}
          >
            {icon}
          </motion.div>

          <AnimatePresence>
            {open && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "relative z-10 font-medium",
                  isActive
                    ? "text-white"
                    : "text-slate-300 group-hover:text-white"
                )}
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Active indicator dot */}
          {isActive && !open && (
            <motion.div
              className="absolute -right-1 top-1/2 w-2 h-2 bg-gradient-to-br from-[#29beb3] to-[#a96bde] rounded-full shadow-lg"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}
