import { useState, useRef, useEffect } from 'react';
import { Search, Clock, Save, X, Star } from 'lucide-react';
import { useSearchStore } from '@stores/search-store';
import { useRecentItemsStore } from '@stores/recent-items-store';
import { useNavigate } from 'react-router-dom';

export const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { addToHistory, getRecentSearches, getSavedSearches } = useSearchStore();
  const { getRecentItems } = useRecentItemsStore();

  const recentSearches = getRecentSearches(5);
  const savedSearches = getSavedSearches();
  const recentItems = getRecentItems(5);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSearch = (query: string) => {
    if (!query.trim()) return;

    addToHistory(query);
    // In a real app, this would navigate to a search results page
    // For now, we'll just close the dropdown
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      participant: 'text-blue-600 bg-blue-50',
      dataset: 'text-purple-600 bg-purple-50',
      schema: 'text-green-600 bg-green-50',
      vocabulary: 'text-orange-600 bg-orange-50',
      policy: 'text-red-600 bg-red-50',
      contract: 'text-indigo-600 bg-indigo-50',
      compliance: 'text-yellow-600 bg-yellow-50',
      transaction: 'text-pink-600 bg-pink-50',
      clearing: 'text-teal-600 bg-teal-50',
      app: 'text-cyan-600 bg-cyan-50',
      connector: 'text-lime-600 bg-lime-50',
    };
    return colors[type] || 'text-neutral-600 bg-neutral-50';
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search across all services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-4 py-2.5 bg-neutral-100 border border-neutral-200 rounded-lg focus:outline-none focus:bg-white focus:border-primary-500 transition-colors text-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-neutral-200 z-50 max-h-96 overflow-y-auto">
          {/* Search Suggestions */}
          {searchQuery && (
            <div className="p-3 border-b border-neutral-100">
              <button
                onClick={() => handleSearch(searchQuery)}
                className="w-full text-left px-3 py-2 hover:bg-neutral-50 rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                <Search size={16} className="text-neutral-400" />
                <span className="font-medium text-neutral-900">Search for "{searchQuery}"</span>
              </button>
            </div>
          )}

          {/* Recent Items */}
          {recentItems.length > 0 && !searchQuery && (
            <div className="p-3 border-b border-neutral-100">
              <p className="text-xs font-semibold text-neutral-600 px-3 py-1.5 uppercase tracking-wide">
                Recently Viewed
              </p>
              <div className="space-y-1">
                {recentItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.path);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-neutral-50 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Star size={14} className="text-neutral-400 flex-shrink-0" />
                    <span className="text-sm text-neutral-900 flex-1 truncate">{item.title}</span>
                    <span className={`text-xs px-2 py-1 rounded ${getTypeColor(item.type)}`}>
                      {item.type}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && !searchQuery && (
            <div className="p-3 border-b border-neutral-100">
              <p className="text-xs font-semibold text-neutral-600 px-3 py-1.5 uppercase tracking-wide">
                Recent Searches
              </p>
              <div className="space-y-1">
                {recentSearches.map((query, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSearchQuery(query)}
                    className="w-full text-left px-3 py-2 hover:bg-neutral-50 rounded-lg transition-colors flex items-center gap-2 text-sm"
                  >
                    <Clock size={14} className="text-neutral-400" />
                    <span className="text-neutral-700">{query}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Saved Searches */}
          {savedSearches.length > 0 && !searchQuery && (
            <div className="p-3">
              <p className="text-xs font-semibold text-neutral-600 px-3 py-1.5 uppercase tracking-wide">
                Saved Searches
              </p>
              <div className="space-y-1">
                {savedSearches.slice(0, 5).map((search) => (
                  <button
                    key={search.id}
                    onClick={() => setSearchQuery(search.query)}
                    className="w-full text-left px-3 py-2 hover:bg-neutral-50 rounded-lg transition-colors flex items-center gap-2 text-sm"
                  >
                    <Save size={14} className="text-primary-600" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 truncate">{search.name}</p>
                      <p className="text-xs text-neutral-500 truncate">{search.query}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!searchQuery && recentSearches.length === 0 && savedSearches.length === 0 && recentItems.length === 0 && (
            <div className="p-8 text-center text-neutral-500 text-sm">
              <p>No recent searches or items</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
