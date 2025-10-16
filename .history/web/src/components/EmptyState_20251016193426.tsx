"use client";

import { Search, Filter, Calendar, MapPin, AlertCircle, RefreshCcw } from 'lucide-react';

interface EmptyStateProps {
  type: 'search' | 'filter' | 'no-data' | 'error';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  searchQuery?: string;
  filters?: {
    category?: string;
    location?: string;
    dateRange?: string;
  };
}

export function EmptyState({ 
  type, 
  title, 
  message, 
  action, 
  searchQuery, 
  filters 
}: EmptyStateProps) {
  const getIcon = () => {
    switch (type) {
      case 'search':
        return <Search className="text-gray-400" size={64} />;
      case 'filter':
        return <Filter className="text-gray-400" size={64} />;
      case 'error':
        return <AlertCircle className="text-red-400" size={64} />;
      case 'no-data':
      default:
        return <Calendar className="text-gray-400" size={64} />;
    }
  };

  const hasActiveFilters = () => {
    if (!filters) return false;
    return Object.values(filters).some(filter => filter && filter !== 'all');
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-6">
        {getIcon()}
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-300 max-w-md mx-auto mb-6 leading-relaxed">{message}</p>
      
      {/* Search/Filter Context */}
      {searchQuery && (
        <div className="mb-4 p-3 bg-white/5 rounded-xl border border-white/10">
          <p className="text-gray-400 text-sm">
            Searched for: <span className="text-white font-semibold">"{searchQuery}"</span>
          </p>
        </div>
      )}
      
      {hasActiveFilters() && filters && (
        <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10 max-w-md">
          <p className="text-gray-400 text-sm mb-2">Active filters:</p>
          <div className="flex flex-wrap gap-2">
            {filters.category && filters.category !== 'all' && (
              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                {filters.category}
              </span>
            )}
            {filters.location && filters.location !== 'all' && (
              <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs flex items-center gap-1">
                <MapPin size={10} />
                {filters.location}
              </span>
            )}
            {filters.dateRange && (
              <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs flex items-center gap-1">
                <Calendar size={10} />
                {filters.dateRange}
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Action Button */}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105"
        >
          <RefreshCcw size={16} />
          {action.label}
        </button>
      )}
      
      {/* Suggestions */}
      <div className="mt-8 max-w-lg">
        <p className="text-gray-400 text-sm mb-3">Try:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {type === 'search' && (
            <>
              <div className="text-gray-300">• Check your spelling</div>
              <div className="text-gray-300">• Use different keywords</div>
              <div className="text-gray-300">• Try broader search terms</div>
              <div className="text-gray-300">• Remove some filters</div>
            </>
          )}
          
          {type === 'filter' && (
            <>
              <div className="text-gray-300">• Clear some filters</div>
              <div className="text-gray-300">• Try different categories</div>
              <div className="text-gray-300">• Expand date range</div>
              <div className="text-gray-300">• Check other locations</div>
            </>
          )}
          
          {type === 'no-data' && (
            <>
              <div className="text-gray-300">• Check back later</div>
              <div className="text-gray-300">• Browse other categories</div>
              <div className="text-gray-300">• Create your own event</div>
              <div className="text-gray-300">• Subscribe for updates</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Specific empty state components for common use cases
export function SearchEmptyState({ 
  searchQuery, 
  onClearSearch 
}: { 
  searchQuery: string; 
  onClearSearch: () => void; 
}) {
  return (
    <EmptyState
      type="search"
      title="No events found"
      message={`We couldn't find any events matching your search. Try adjusting your search terms or browse our featured events.`}
      searchQuery={searchQuery}
      action={{
        label: 'Clear Search',
        onClick: onClearSearch,
      }}
    />
  );
}

export function FilterEmptyState({ 
  filters, 
  onClearFilters 
}: { 
  filters: any; 
  onClearFilters: () => void; 
}) {
  return (
    <EmptyState
      type="filter"
      title="No events match your filters"
      message="Try adjusting your filters to see more events, or clear them to browse all available events."
      filters={filters}
      action={{
        label: 'Clear All Filters',
        onClick: onClearFilters,
      }}
    />
  );
}

export function NoEventsState({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <EmptyState
      type="no-data"
      title="No events available"
      message="There are currently no events to display. Check back soon for exciting new events!"
      action={onRefresh ? {
        label: 'Refresh',
        onClick: onRefresh,
      } : undefined}
    />
  );
}

export function ErrorState({ 
  onRetry, 
  errorMessage 
}: { 
  onRetry: () => void; 
  errorMessage?: string; 
}) {
  return (
    <EmptyState
      type="error"
      title="Something went wrong"
      message={errorMessage || "We're having trouble loading the events. Please try again."}
      action={{
        label: 'Try Again',
        onClick: onRetry,
      }}
    />
  );
}
