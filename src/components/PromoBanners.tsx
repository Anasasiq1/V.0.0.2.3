import React from 'react';
import { PromoBanner } from '../types';
import { ArrowRight } from 'lucide-react';

interface PromoBannersProps {
  banners: PromoBanner[];
  onSelectBanner: (banner: PromoBanner) => void;
}

export const PromoBanners: React.FC<PromoBannersProps> = ({ banners, onSelectBanner }) => {
  if (!banners || banners.length === 0) return null;

  return (
    <div className="px-4 py-2">
      <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth">
        {banners.map((banner) => (
          <div
            key={banner.id}
            onClick={() => onSelectBanner(banner)}
            style={{ background: banner.bgGradient }}
            className="min-w-[85%] sm:min-w-[280px] p-4 rounded-3xl relative overflow-hidden cursor-pointer transition-all duration-200 active:scale-98 shadow-sm flex flex-col justify-between border border-white/50"
          >
            <div className="z-10 max-w-[70%]">
              <h3 className="text-slate-900 font-extrabold text-lg leading-tight mb-1">
                {banner.title}
              </h3>
              <p className="text-slate-700 font-semibold text-xs leading-snug opacity-90 mb-3">
                {banner.subtitle}
              </p>
              <button className="bg-white text-slate-900 px-3.5 py-1.5 rounded-2xl text-xs font-black flex items-center gap-1 shadow-xs hover:bg-slate-50 transition-colors">
                <span>{banner.btnText}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-900" />
              </button>
            </div>

            {/* Background Image/Icon */}
            <div className="absolute -right-3 -bottom-3 text-7xl opacity-25 pointer-events-none select-none transform rotate-[-12deg]">
              {banner.icon}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
