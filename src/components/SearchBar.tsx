import React from 'react';
import { Search, Mic, X } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeModuleName?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, onSearchChange, activeModuleName }) => {
  return (
    <div className="px-4 py-2">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={activeModuleName ? `Search for '${activeModuleName}'` : "Search for 'Shop', 'Food', 'Grocery'..."}
          className="w-full pl-10 pr-10 py-2.5 bg-slate-100/90 border border-transparent rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all shadow-inner"
        />
        {searchQuery ? (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button className="absolute right-3 p-1 text-slate-400 hover:text-emerald-600">
            <Mic className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
