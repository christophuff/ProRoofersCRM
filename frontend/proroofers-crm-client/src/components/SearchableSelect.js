import React, { useState, useRef, useEffect } from 'react';
import '../styles/searchableSelect.css';

const SearchableSelect = ({ 
  options = [], // Default to empty array
  value, 
  onChange, 
  placeholder, 
  displayKey, 
  valueKey,
  required = false,
  name = '' // Add name prop for onChange handling
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const containerRef = useRef(null);

  useEffect(() => {
    // Add safety checks for undefined/null values
    const filtered = options.filter(option => {
      if (!option || !option[displayKey]) return false;
      
      const displayValue = option[displayKey].toString().toLowerCase();
      const search = searchTerm.toLowerCase();
      return displayValue.includes(search);
    });
    setFilteredOptions(filtered);
  }, [searchTerm, options, displayKey]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Find selected option with safety check
  const selectedOption = options && options.length > 0 
    ? options.find(option => option && option[valueKey] === value) 
    : null;

  const handleSelect = (selectedValue) => {
    // Create proper event object for onChange
    const event = {
      target: {
        name: name,
        value: selectedValue
      }
    };
    onChange(event);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="searchable-select" ref={containerRef}>
      <input
        type="text"
        className="form-input"
        placeholder={selectedOption ? selectedOption[displayKey] : placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsOpen(true)}
        required={required}
        autoComplete="off"
      />
      
      {isOpen && (
        <div className="searchable-options">
          {value && (
            <div 
              className="searchable-option clear-option"
              onClick={() => handleSelect('')}
            >
              <em>Clear selection</em>
            </div>
          )}
          
          {filteredOptions.slice(0, 10).map((option) => (
            <div
              key={option[valueKey]}
              className="searchable-option"
              onClick={() => handleSelect(option[valueKey])}
            >
              {option[displayKey]}
            </div>
          ))}
          
          {filteredOptions.length > 10 && (
            <div className="searchable-option disabled">
              ... {filteredOptions.length - 10} more results (type to narrow down)
            </div>
          )}
          
          {filteredOptions.length === 0 && searchTerm && (
            <div className="searchable-option disabled">
              No results found for "{searchTerm}"
            </div>
          )}
          
          {options.length === 0 && (
            <div className="searchable-option disabled">
              No options available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;