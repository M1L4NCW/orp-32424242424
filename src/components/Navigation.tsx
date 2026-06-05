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
    { id: "home", label: "Home", icon: Plane },
    { id: "staff", label: "Personeelsportaal", icon: User },
    { id: "klu", label: "KLu Rijksportaal", icon: Shield },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/95 border-b border-slate-800/80 backdrop-blur-md text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Brand */}
          <div className="flex items-center cursor-pointer" onClick={() => setCurrentTab("home")}>
            <Logo size="sm" showText={true} />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1 lg:space-x-2">
            {buttonItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-[#ea580c] text-white shadow-lg shadow-[#ea580c]/15"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden bg-slate-950 border-b border-slate-800 px-2 pt-2 pb-4 space-y-1">
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
                className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  isActive
                    ? "bg-[#ea580c] text-white"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}
