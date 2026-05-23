import React from "react";
import { ShieldAlert, Award, MessageSquare } from "lucide-react";
import Logo from "./Logo";

export default function Footer({ setCurrentTab }: { setCurrentTab: (tab: string) => void }) {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-t-slate-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Logo & Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="cursor-pointer" onClick={() => setCurrentTab("home")}>
              <Logo size="sm" showText={true} />
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              Luchtvaart Centrum voor Oranjestad. De grootste hub voor vliegbrevetten, helikoptertrainingen en showroom hangars in Oranjestad.
            </p>
            <div className="pt-2">
              <span className="font-display font-bold italic text-slate-200 block text-xs tracking-wider border-l-2 border-l-[#ea580c] pl-3">
                "Jouw reis Begint in de lucht"
              </span>
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-slate-500 font-mono">
              <ShieldAlert className="h-4 w-4 text-[#ea580c]" />
              <span>Gelicenseerd luchtvaartsysteem van Luchtvaart Centrum Oranjestad</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider font-display uppercase">Snelkoppelingen</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => setCurrentTab("brevetten")} className="hover:text-white transition-colors cursor-pointer text-left">
                  Vliegbrevetten Hub
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab("marketplace")} className="hover:text-white transition-colors cursor-pointer text-left">
                  Voorraad & Hangar
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab("staff")} className="hover:text-white transition-colors text-brand-500 hover:text-brand-400 font-semibold cursor-pointer text-left">
                  Personeelsportaal (🔐)
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3.5">
            <h4 className="text-white font-semibold text-sm tracking-wider font-display uppercase text-[#ea580c]">Oranjestad Vliegveld</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2.5">
                <MessageSquare className="h-4 w-4 text-[#ea580c] shrink-0 mt-0.5" />
                <div>
                  <span className="block mb-1">Onze Discord community</span>
                  <a 
                    href="https://discord.gg/your-invite-link" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-1.5 bg-[#ea580c]/10 border border-[#ea580c]/30 hover:bg-[#ea580c]/20 text-[#ea580c] text-xs font-mono font-semibold px-2.5 py-1 rounded transition-colors"
                  >
                    Open een Discord Ticket
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Luchtvaart Oranjestad. Alle rechten voorbehouden.</p>
          <div className="flex space-x-6">
            <span className="flex items-center space-x-1.5 grayscale opacity-50">
              <Award className="h-4.5 w-4.5 text-brand-500" />
              <span>FAA & EASA Compliant</span>
            </span>
            <a href="#" className="hover:text-slate-300 transition-colors">Algemene Voorwaarden</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Beleid</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
