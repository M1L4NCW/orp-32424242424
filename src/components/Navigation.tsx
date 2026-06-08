import React from "react";
import { Award, SlidersHorizontal, User, Plane, ShoppingBag, Shield } from "lucide-react";
import Logo from "./Logo";

interface NavigationProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export default function Navigation({ currentTab, setCurrentTab }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // standard icons for navigation buttons
  const buttonItems = [
    { id: "home", label: "Home Overzicht", icon: Plane },
    { id: "staff", label: "Personeelsportaal", icon: User },
    { id: "klu", label: "KLu Rijksportaal", icon: Shield },
  ];

  return (
    <div className="sticky top-0 z-50 w-full px-4 sm:px-6 py-4 bg-gradient-to-b from-slate-950/80 to-transparent">
      <nav className="max-w-7xl mx-auto bg-slate-950/70 hover:bg-slate-950/90 border border-slate-900/80 hover:border-slate-500/30 backdrop-blur-2xl rounded-[24px] text-white shadow-2xl transition-all duration-300">
        <div className="px-5 sm:px-8">
          <div className="flex items-center justify-between h-18 sm:h-20">
            {/* Logo Brand */}
            <div className="flex items-center cursor-pointer transform hover:scale-[1.02] transition-transform duration-200" onClick={() => setCurrentTab("home")}>
              <Logo size="sm" showText={true} />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 sm:space-x-1.5 bg-slate-900/40 p-1.5 rounded-full border border-slate-900">
              {buttonItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-btn-${item.id}`}
                    onClick={() => setCurrentTab(item.id)}
                    className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-bold font-mono uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "bg-slate-100 text-slate-950 shadow-lg shadow-white/5 scale-100"
                        : "text-slate-400 hover:bg-slate-900/70 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
              >
                <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu dropdown */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden px-4 pb-5 pt-1 space-y-1.5 border-t border-slate-900">
            {buttonItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 w-full px-5 py-3.5 rounded-2xl text-xs font-bold font-mono uppercase tracking-widest transition-all cursor-pointer ${
                    isActive
                      ? "bg-slate-100 text-slate-950 font-black shadow-lg shadow-white/5"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </nav>
    </div>
  );
}
