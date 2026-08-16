import React from 'react';
import { Module } from '../types';
import { ChevronRight, Clock } from 'lucide-react';

interface ModuleGridProps {
  modules: Module[];
  onSelectModule: (moduleId: string) => void;
}

export const ModuleGrid: React.FC<ModuleGridProps> = React.memo(({ modules, onSelectModule }) => {
  const sortedModules = React.useMemo(() => {
    const enabled = (modules || []).filter((m) => m.enabled !== false);
    return [...enabled].sort((a, b) => a.order - b.order);
  }, [modules]);

  return (
    <div className="px-4 py-2">
      <div className="grid grid-cols-2 gap-3">
        {sortedModules.map((mod) => {
          const isLarge = mod.size === 'large' || mod.size === 'banner';
          const isSmall = mod.size === 'small';

          return (
            <div
              key={mod.id}
              onClick={() => onSelectModule(mod.id)}
              style={{ background: mod.bgColor || '#f8f9fa' }}
              className={`relative rounded-3xl p-4 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-98 border border-white/40 flex flex-col justify-between ${
                isLarge ? 'col-span-2 min-h-[130px]' : isSmall ? 'col-span-1 min-h-[120px]' : 'col-span-1 min-h-[145px]'
              }`}
            >
              {/* Top Text Content */}
              <div className="z-10 max-w-[75%]">
                <h3 className="text-slate-900 font-black text-base sm:text-lg leading-snug tracking-tight mb-0.5">
                  {mod.name}
                </h3>
                {mod.description && (
                  <p className="text-slate-700 font-semibold text-xs leading-tight opacity-90 mb-2 line-clamp-2">
                    {mod.description}
                  </p>
                )}
              </div>

              {/* Bottom Time Badge or Arrow */}
              <div className="z-10 mt-auto flex items-center justify-between">
                {mod.time && (
                  <div className="bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-xl text-[11px] font-extrabold text-slate-800 flex items-center gap-1 shadow-2xs">
                    <Clock className="w-3 h-3 text-slate-600" />
                    <span>{mod.time}</span>
                  </div>
                )}

                {isSmall && (
                  <div className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-slate-800 shadow-2xs ml-auto">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Background Icon / Image Illustration */}
              <div className="absolute right-1 bottom-1 opacity-80 pointer-events-none select-none">
                {mod.image ? (
                  <img src={mod.image} alt={mod.name} className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md" />
                ) : mod.icon && (mod.icon.startsWith('http') || mod.icon.startsWith('data:')) ? (
                  <img src={mod.icon} alt={mod.name} className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md" />
                ) : (
                  <span className="text-5xl sm:text-6xl opacity-40 transform rotate-[-10deg] block">{mod.icon}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

