import React, { useState } from 'react';
import { Module } from '../types';
import { Layers, ChevronDown, Check, ArrowRight, X } from 'lucide-react';

export interface ModuleSwitcherProps {
  modules: Module[];
  activeModuleId: string;
  onSelectModule: (moduleId: string) => void;
  variant?: 'inline' | 'compact' | 'floating';
  className?: string;
}

export const ModuleSwitcher: React.FC<ModuleSwitcherProps> = ({
  modules,
  activeModuleId,
  onSelectModule,
  variant = 'inline',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const enabledModules = (modules || [])
    .filter((m) => m.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const activeModule = enabledModules.find((m) => m.id === activeModuleId);

  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black transition-all cursor-pointer shadow-2xs border border-slate-200/60 dark:border-slate-700/60"
        >
          <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="truncate max-w-[110px]">{activeModule ? activeModule.name : 'Switch Module'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs" onClick={() => setIsOpen(false)} />
            <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-2.5 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" /> Select Module
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto no-scrollbar space-y-1">
                {enabledModules.map((mod) => {
                  const isSelected = mod.id === activeModuleId;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => {
                        onSelectModule(mod.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold border border-emerald-200 dark:border-emerald-800'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-lg shrink-0">{mod.icon || '📦'}</span>
                        <div className="truncate">
                          <p className="text-xs truncate">{mod.name}</p>
                          {mod.time && <p className="text-[10px] text-slate-400 font-medium">{mod.time}</p>}
                        </div>
                      </div>
                      {isSelected ? (
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Inline Horizontal Switcher Bar
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1.5 px-0.5">
        <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-500 uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          <span>Switch Module</span>
        </div>
        <span className="text-[10px] font-bold text-slate-400">
          {enabledModules.length} Available
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {enabledModules.map((mod) => {
          const isSelected = mod.id === activeModuleId;
          return (
            <button
              key={mod.id}
              onClick={() => onSelectModule(mod.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-102'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              <span className="text-sm">{mod.icon || '📦'}</span>
              <span>{mod.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
