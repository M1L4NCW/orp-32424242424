import React from "react";
import { ShieldAlert, Award, MessageSquare } from "lucide-react";
import Logo from "./Logo";

export default function Footer({ setCurrentTab }: { setCurrentTab: (tab: string) => void }) {
  return (
    <footer className="w-full px-4 sm:px-6 pb-8 pt-4 bg-gradient-to-t from-slate-950/80 to-transparent">
      <div className="max-w-7xl mx-auto bg-slate-950/40 border border-slate-900/80 backdrop-blur-2xl rounded-[32px] p-8 sm:p-12 text-slate-400">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Logo & Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="cursor-pointer transform hover:scale-[1.01] transition-transform inline-block" onClick={() => setCurrentTab("home")}>
              <Logo size="sm" showText={true} />
            </div>
            <p className="text-xs sm:text-sm leading-relaxed max-w-sm font-light">
              Luchtvaart Centrum voor Oranjestad. De grootste hub voor vliegbrevetten, helikoptertrainingen en showroom hangars in Oranjestad.
            </p>
            <div className="pt-2">
              <span className="font-display font-black italic text-slate-300 block text-xs tracking-wider border-l-2 border-l-slate-400 pl-3">
                "Jouw reis Begint in de lucht"
              </span>
            </div>
            <div className="flex items-center space-x-2.5 text-[11px] text-slate-500 font-mono">
              <ShieldAlert className="h-4 w-4 text-slate-400" />
              <span>Gelicenseerd luchtvaartsysteem van Luchtvaart Centrum Oranjestad</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-bold mb-5 text-xs tracking-widest font-mono uppercase">Informatie & Portalen</h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li>
                <button onClick={() => setCurrentTab("staff")} className="hover:text-white text-slate-300 font-semibold cursor-pointer text-left transition-colors font-mono tracking-wide">
                  🔐 STAFF PORTAL
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab("klu")} className="hover:text-white text-slate-300 font-semibold cursor-pointer text-left transition-colors font-mono tracking-wide">
                  🎖️ KLU PORTAL
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-slate-300 font-bold text-xs tracking-widest font-mono uppercase">Direct Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2.5">
                <MessageSquare className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs mb-2 leading-relaxed">Vragen of examens inplannen? Open een ticket in Discord:</span>
                  <a 
                    href="https://discord.gg/FACgeTSrAR" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white text-xs font-mono font-black uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition-all hover:scale-105"
                  >
                    Open Discord Ticket
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 text-[11px] text-slate-500 font-mono">
          <p>© {new Date().getFullYear()} Luchtvaart Oranjestad. Alle rechten voorbehouden.</p>
          <div className="flex flex-wrap gap-4 sm:gap-6 justify-center">
            <span className="flex items-center space-x-1.5 opacity-40">
              <Award className="h-4 w-4 text-slate-400" />
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
