import React from 'react';
import { Activity, Cpu, BarChart3, BookOpen, RotateCcw, Box, HelpCircle, Volume2, VolumeX } from 'lucide-react';
import { soundFx } from '../utils/soundFx';

export type NavTab = 'console' | 'dyno3d' | 'markov' | 'benchmarks' | 'chat' | 'dossier';

interface HeaderProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onResetSensors: () => void;
  onOpenGuide?: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onResetSensors,
  onOpenGuide,
  isMuted = false,
  onToggleMute,
}) => {
  const handleTab = (tab: NavTab) => {
    soundFx.playClick(680, 0.04, 0.035);
    onTabChange(tab);
  };

  return (
    <header className="border-b border-sky-500/30 bg-[#060a14]/95 backdrop-blur-md sticky top-0 z-30 shadow-[0_6px_24px_-10px_rgba(14,165,233,0.35)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Brand Wordmark (Single Text Element) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 hud-chamfer bg-sky-500/15 border border-sky-400/50 flex items-center justify-center text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.25)]">
              <Activity className="w-4 h-4" />
            </div>
            <div className="font-display text-base sm:text-lg font-bold tracking-wider uppercase text-slate-100 whitespace-nowrap">
              Engine Telemetry HUD
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            <button
              type="button"
              onClick={() => handleTab('console')}
              className={`relative flex items-center gap-1.5 px-3 py-2 text-xs font-display tracking-wider uppercase transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer active:scale-[0.97] ${
                activeTab === 'console'
                  ? 'bg-sky-500/15 text-sky-300 border border-sky-400/50 font-bold shadow-[0_0_14px_rgba(56,189,248,0.2)] hud-chamfer'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded border border-transparent'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Telemetry Console</span>
            </button>

            <button
              type="button"
              onClick={() => handleTab('dyno3d')}
              className={`relative flex items-center gap-1.5 px-3 py-2 text-xs font-display tracking-wider uppercase transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer active:scale-[0.97] ${
                activeTab === 'dyno3d'
                  ? 'bg-sky-500/15 text-sky-300 border border-sky-400/50 font-bold shadow-[0_0_14px_rgba(56,189,248,0.2)] hud-chamfer'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded border border-transparent'
              }`}
            >
              <Box className="w-3.5 h-3.5 text-amber-400" />
              <span>3D Dyno Stage</span>
            </button>

            <button
              type="button"
              onClick={() => handleTab('markov')}
              className={`relative flex items-center gap-1.5 px-3 py-2 text-xs font-display tracking-wider uppercase transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer active:scale-[0.97] ${
                activeTab === 'markov'
                  ? 'bg-sky-500/15 text-sky-300 border border-sky-400/50 font-bold shadow-[0_0_14px_rgba(56,189,248,0.2)] hud-chamfer'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded border border-transparent'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Markov Model</span>
            </button>

            <button
              type="button"
              onClick={() => handleTab('benchmarks')}
              className={`relative flex items-center gap-1.5 px-3 py-2 text-xs font-display tracking-wider uppercase transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer active:scale-[0.97] ${
                activeTab === 'benchmarks'
                  ? 'bg-sky-500/15 text-sky-300 border border-sky-400/50 font-bold shadow-[0_0_14px_rgba(56,189,248,0.2)] hud-chamfer'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded border border-transparent'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Benchmarks</span>
            </button>

            <button
              type="button"
              onClick={() => handleTab('chat')}
              className={`relative flex items-center gap-2 px-3 py-1.5 text-xs font-display tracking-wider uppercase transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer active:scale-[0.97] ${
                activeTab === 'chat'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/50 font-bold shadow-[0_0_14px_rgba(16,185,129,0.22)] hud-chamfer'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded border border-transparent'
              }`}
            >
              <img
                src="/src/assets/images/dino_chatbot_avatar_1794497151901.jpg"
                alt="Dino Chatbot Avatar"
                className="w-5 h-5 rounded-full object-cover border border-emerald-400/60 shadow-sm"
              />
              <span>Dino Chatbot</span>
            </button>

            <button
              type="button"
              onClick={() => handleTab('dossier')}
              className={`relative flex items-center gap-1.5 px-3 py-2 text-xs font-display tracking-wider uppercase transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer active:scale-[0.97] ${
                activeTab === 'dossier'
                  ? 'bg-sky-500/15 text-sky-300 border border-sky-400/50 font-bold shadow-[0_0_14px_rgba(56,189,248,0.2)] hud-chamfer'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded border border-transparent'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Dossier</span>
            </button>
          </nav>

          {/* Zone 3: Guide / Audio / Reset */}
          <div className="flex items-center gap-2 shrink-0">
            {onToggleMute && (
              <button
                type="button"
                onClick={onToggleMute}
                className="p-2 text-slate-300 bg-slate-900/90 border border-slate-700/80 rounded hover:border-sky-500/50 hover:text-sky-300 transition-all cursor-pointer active:scale-95"
                title={isMuted ? 'Unmute HUD Audio FX' : 'Mute HUD Audio FX'}
                aria-label={isMuted ? 'Unmute HUD Audio FX' : 'Mute HUD Audio FX'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-500" /> : <Volume2 className="w-3.5 h-3.5 text-sky-400" />}
              </button>
            )}

            {onOpenGuide && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick(740, 0.04, 0.035);
                  onOpenGuide();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold text-sky-300 bg-sky-950/50 border border-sky-400/45 hud-chamfer hover:bg-sky-900/60 hover:text-white transition-all whitespace-nowrap shrink-0 shadow-[0_0_12px_rgba(56,189,248,0.18)] cursor-pointer active:scale-[0.97]"
                title="Open Showcase User Guide"
              >
                <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                <span>User Guide</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                soundFx.playClick(520, 0.06, 0.04);
                onResetSensors();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold text-slate-200 bg-slate-900 border border-slate-700/90 hud-chamfer hover:bg-slate-800 hover:border-amber-400/50 hover:text-white transition-all whitespace-nowrap shrink-0 shadow-sm cursor-pointer active:scale-[0.97]"
              title="Reset all 6 sensors to standard baseline defaults"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Mobile / Medium Tab Navigation */}
        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto py-2 border-t border-slate-800/60 text-xs no-scrollbar">
          <button
            type="button"
            onClick={() => handleTab('console')}
            className={`px-3 py-1.5 rounded font-display uppercase tracking-wide whitespace-nowrap shrink-0 ${
              activeTab === 'console' ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40' : 'text-slate-400'
            }`}
          >
            Telemetry
          </button>
          <button
            type="button"
            onClick={() => handleTab('dyno3d')}
            className={`px-3 py-1.5 rounded font-display uppercase tracking-wide whitespace-nowrap shrink-0 ${
              activeTab === 'dyno3d' ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40' : 'text-slate-400'
            }`}
          >
            3D Dyno
          </button>
          <button
            type="button"
            onClick={() => handleTab('markov')}
            className={`px-3 py-1.5 rounded font-display uppercase tracking-wide whitespace-nowrap shrink-0 ${
              activeTab === 'markov' ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40' : 'text-slate-400'
            }`}
          >
            Markov Model
          </button>
          <button
            type="button"
            onClick={() => handleTab('benchmarks')}
            className={`px-3 py-1.5 rounded font-display uppercase tracking-wide whitespace-nowrap shrink-0 ${
              activeTab === 'benchmarks' ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40' : 'text-slate-400'
            }`}
          >
            Benchmarks
          </button>
          <button
            type="button"
            onClick={() => handleTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-display uppercase tracking-wide whitespace-nowrap shrink-0 ${
              activeTab === 'chat' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40' : 'text-slate-400'
            }`}
          >
            <img
              src="/src/assets/images/dino_chatbot_avatar_1794497151901.jpg"
              alt="Dino"
              className="w-4 h-4 rounded-full object-cover"
            />
            <span>Dino Chatbot</span>
          </button>
          <button
            type="button"
            onClick={() => handleTab('dossier')}
            className={`px-3 py-1.5 rounded font-display uppercase tracking-wide whitespace-nowrap shrink-0 ${
              activeTab === 'dossier' ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40' : 'text-slate-400'
            }`}
          >
            Dossier
          </button>
        </div>
      </div>
    </header>
  );
};
