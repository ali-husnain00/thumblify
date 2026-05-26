import { MenuIcon, XIcon, LogOutIcon, Info } from "lucide-react";
import { useContext, useState, useEffect } from "react"; 
import { motion, AnimatePresence } from "motion/react";
import { navlinks } from "../data/navlinks.js";
import { NavLink, useNavigate } from "react-router-dom";
import { context } from "../Context/Context.jsx";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotice, setShowNotice] = useState(true); 
  const navigate = useNavigate();
  const { user, logout } = useContext(context);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotice(false);
    }, 20000); 

    return () => clearTimeout(timer); 
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setShowProfileMenu(false);
      setIsOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getUserInitial = () => {
    if (!user?.username) return "?";
    return user.username.charAt(0).toUpperCase();
  };

  const noticeText = "Backend is hosted on Render (a free platform), so the first request (like Login, Register, or Generating an image) will take some extra time to respond. Thank you for your patience.";

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-50 flex flex-col bg-zinc-950/20 backdrop-blur-md">
        
        {/* AnimatePresence allows layout collapsing when item drops from DOM */}
        <AnimatePresence>
          {showNotice && (
            <motion.div 
              initial={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0, borderBottomWidth: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-full border-b border-zinc-900/50 text-[11px] font-medium tracking-wide py-2 overflow-hidden whitespace-nowrap select-none flex items-center bg-zinc-950/40"
            >
              <div className="pl-6 pr-3 flex items-center gap-1.5 shrink-0 z-10 bg-transparent text-zinc-300 font-semibold tracking-wider text-[12px]">
                <Info size={14} className="text-pink-500" />
                <span className="text-zinc-400">Note:</span>
              </div>
              
              {/* Continuous Text Scroller */}
              <div className="relative w-full overflow-hidden flex items-center">
                <motion.div 
                  className="flex gap-24 pr-24 text-zinc-300/90"
                  animate={{ x: [0, -950] }}
                  transition={{
                    ease: "linear",
                    duration: 26,
                    repeat: Infinity,
                  }}
                >
                  <span>{noticeText}</span>
                  <span>{noticeText}</span>
                  <span>{noticeText}</span>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Layer */}
        <motion.nav
          className="relative w-full flex items-center justify-between py-4 px-6 md:px-16 lg:px-24 xl:px-32 bg-transparent"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1 }}
        >
          <NavLink to="/">
            <img
              className="h-8.5 w-auto"
              src="/logo.svg"
              alt="Thumblify"
              width={130}
              height={34}
            />
          </NavLink>

          <div className="hidden md:flex items-center gap-8 transition duration-500">
            {navlinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.href}
                className="hover:text-pink-500 transition text-sm text-zinc-300"
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 focus:outline-none active:scale-95 transition"
                >
                  {user.avatar || user.profilePic ? (
                    <img
                      src={user.avatar || user.profilePic}
                      alt={user.username || "User profile"}
                      className="size-9 rounded-full object-cover border border-pink-500"
                    />
                  ) : (
                    <div className="size-9 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-semibold select-none shadow-md">
                      {getUserInitial()}
                    </div>
                  )}
                </button>

                {/* Desktop Profile Dropdown Menu */}
                <AnimatePresence>
                  {showProfileMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowProfileMenu(false)} 
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 mt-2.5 w-52 bg-zinc-950/95 backdrop-blur-md border border-zinc-800/80 rounded-xl shadow-2xl p-2 z-50 text-sm"
                      >
                        <div className="px-3 py-2.5 border-b border-zinc-800/60 mb-1">
                          <p className="font-semibold text-white truncate">
                            @{user.username || "user"}
                          </p>
                          <p className="text-xs text-zinc-400 truncate mt-0.5">{user.email}</p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-zinc-900 rounded-lg transition text-left font-medium"
                        >
                          <LogOutIcon size={15} />
                          Logout
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 active:scale-95 transition-all rounded-full text-white text-sm font-medium"
              >
                Get Started
              </button>
            )}
          </div>

          <button onClick={() => setIsOpen(true)} className="md:hidden">
            <MenuIcon size={26} className="active:scale-90 transition text-zinc-300" />
          </button>
        </motion.nav>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-100 bg-black/40 backdrop-blur flex flex-col items-center justify-center text-lg gap-8 md:hidden transition-transform duration-400 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {user && (
          <div className="flex flex-col items-center gap-2 mb-4">
            {user.avatar || user.profilePic ? (
              <img
                src={user.avatar || user.profilePic}
                alt={user.username}
                className="size-16 rounded-full object-cover border-2 border-pink-500"
              />
            ) : (
              <div className="size-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg select-none">
                {getUserInitial()}
              </div>
            )}
            <p className="font-semibold text-white mt-1">@{user.username}</p>
            <p className="text-xs text-zinc-400">{user.email}</p>
          </div>
        )}

        {navlinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.href}
            onClick={() => setIsOpen(false)}
            className="hover:text-pink-500 transition text-zinc-300"
          >
            {link.name}
          </NavLink>
        ))}

        {/* Mobile Auth Links */}
        {user ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-400 hover:text-red-500 transition font-medium"
          >
            <LogOutIcon size={20} />
            Logout
          </button>
        ) : (
          <NavLink
            onClick={() => setIsOpen(false)}
            to="/login"
            className="hover:text-pink-500 transition text-zinc-300"
          >
            Login
          </NavLink>
        )}

        <button
          onClick={() => setIsOpen(false)}
          className="active:ring-3 active:ring-white aspect-square size-10 p-1 items-center justify-center bg-pink-600 hover:bg-pink-700 transition text-white rounded-md flex"
        >
          <XIcon />
        </button>
      </div>
    </>
  );
}