"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Formik, Form } from 'formik';
import { eventFilterValidationSchema } from '@/validations/schemas';
import { FormField, FormSelect, FormCheckbox, FormButton } from './FormComponents';

interface EventFilters {
  search: string;
  category: string;
  location: string;
  priceMin: number | '';
  priceMax: number | '';
  startDate: string;
  endDate: string;
  isFree?: boolean;
}

interface EventSearchFormProps {
  onFiltersChange: (filters: EventFilters) => void;
  initialFilters?: Partial<EventFilters>;
  className?: string;
}

// Custom hook for debounced value
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const EventSearchForm: React.FC<EventSearchFormProps> = ({
  onFiltersChange,
  initialFilters = {},
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  
  // Debounce search term with 300ms delay
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const initialValues: EventFilters = {
    search: '',
    category: '',
    location: '',
    priceMin: '',
    priceMax: '',
    startDate: '',
    endDate: '',
    isFree: undefined,
    ...initialFilters,
  };

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'MUSIC', label: '🎵 Music & Concerts' },
    { value: 'TECHNOLOGY', label: '💻 Technology' },
    { value: 'BUSINESS', label: '💼 Business' },
    { value: 'SPORTS', label: '⚽ Sports' },
    { value: 'ARTS', label: '🎨 Arts & Culture' },
    { value: 'FOOD', label: '🍕 Food & Drink' },
    { value: 'EDUCATION', label: '📚 Education' },
    { value: 'HEALTH', label: '🏥 Health' },
    { value: 'OTHER', label: '🎪 Other' },
  ];

  const popularLocations = [
    { value: '', label: 'All Locations' },
    { value: 'Jakarta', label: 'Jakarta' },
    { value: 'Surabaya', label: 'Surabaya' },
    { value: 'Bandung', label: 'Bandung' },
    { value: 'Bali', label: 'Bali' },
    { value: 'Yogyakarta', label: 'Yogyakarta' },
    { value: 'Semarang', label: 'Semarang' },
    { value: 'Medan', label: 'Medan' },
  ];

  // Handle search with debounce
  useEffect(() => {
    if (debouncedSearchTerm !== initialFilters.search) {
      onFiltersChange({ 
        ...initialValues, 
        search: debouncedSearchTerm 
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

  const handleFilterSubmit = useCallback((values: EventFilters) => {
    // Clean up empty values
    const cleanFilters = Object.entries(values).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key as keyof EventFilters] = value;
      }
      return acc;
    }, {} as Partial<EventFilters>);

    onFiltersChange(cleanFilters as EventFilters);
  }, [onFiltersChange]);

  const handleReset = (resetForm: () => void) => {
    resetForm();
    setSearchTerm('');
    onFiltersChange(initialValues);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <Formik
        initialValues={initialValues}
        validationSchema={eventFilterValidationSchema}
        onSubmit={handleFilterSubmit}
        enableReinitialize
      >
        {({ values, resetForm, setFieldValue }) => (
          <Form className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search events by name, description, or organizer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-lg"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormSelect
                name="category"
                label="Category"
                options={categoryOptions}
              />
              
              <FormSelect
                name="location"
                label="Location"
                options={popularLocations}
              />
              
              <div className="flex items-end">
                <FormCheckbox
                  name="isFree"
                  label="Free Events Only"
                />
              </div>
              
              <div className="flex items-end">
                <FormButton
                  type="button"
                  variant="secondary"
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  className="w-full"
                >
                  {isAdvancedOpen ? 'Hide Filters' : 'Advanced Filters'}
                </FormButton>
              </div>
            </div>

            {/* Advanced Filters */}
            {isAdvancedOpen && (
              <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Advanced Filters
                </h3>
                
                {/* Price Range */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    name="priceMin"
                    label="Min Price (IDR)"
                    type="number"
                    placeholder="e.g., 10000"
                  />
                  <FormField
                    name="priceMax"
                    label="Max Price (IDR)"
                    type="number"
                    placeholder="e.g., 500000"
                  />
                </div>
                
                {/* Date Range */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    name="startDate"
                    label="From Date"
                    type="date"
                  />
                  <FormField
                    name="endDate"
                    label="To Date"
                    type="date"
                  />
                </div>
                
                {/* Filter Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <FormButton
                    type="submit"
                    variant="primary"
                    className="flex-1"
                  >
                    Apply Filters
                  </FormButton>
                  
                  <FormButton
                    type="button"
                    variant="secondary"
                    onClick={() => handleReset(resetForm)}
                    className="flex-1 sm:flex-initial"
                  >
                    Reset All
                  </FormButton>
                </div>
              </div>
            )}

            {/* Active Filters Display */}
            {Object.values(values).some(value => value !== '' && value !== null && value !== undefined) && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                  Active Filters:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(values).map(([key, value]) => {
                    if (!value || value === '') return null;
                    
                    let displayValue = value.toString();
                    if (key === 'category') displayValue = categoryOptions.find(opt => opt.value === value)?.label || value;
                    if (key === 'isFree' && value) displayValue = 'Free Events';
                    if (key === 'priceMin') displayValue = `Min: IDR ${Number(value).toLocaleString('id-ID')}`;
                    if (key === 'priceMax') displayValue = `Max: IDR ${Number(value).toLocaleString('id-ID')}`;
                    
                    return (
                      <span
                        key={key}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
                      >
                        {displayValue}
                        <button
                          type="button"
                          onClick={() => setFieldValue(key, key === 'isFree' ? false : '')}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </Form>
        )}
      </Formik>
    </div>
  );
};
