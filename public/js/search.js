/**
 * SearchManager - Universal search functionality for idea cards
 * Provides search, filtering, and highlighting capabilities
 */
class SearchManager {
  constructor(config = {}) {
    this.config = {
      searchInputId: config.searchInputId,
      gridId: config.gridId,
      searchFields: config.searchFields || ['title', 'description'],
      emptyMessage: config.emptyMessage || 'No results found',
      emptySubMessage: config.emptySubMessage || 'Try different keywords.',
      debounceDelay: config.debounceDelay || 300,
      highlightResults: config.highlightResults !== false, // default true
      showEmptyState: config.showEmptyState !== false, // default true
      ...config
    };
    
    this.originalItems = [];
    this.currentItems = [];
    this.searchInput = null;
    this.grid = null;
    this.emptyStateElement = null;
    
    this.init();
  }
  
  /**
   * Initialize the search manager
   */
  init() {
    this.searchInput = document.getElementById(this.config.searchInputId);
    this.grid = document.getElementById(this.config.gridId);
    
    if (!this.searchInput || !this.grid) {
      console.warn(`SearchManager: Could not find elements with IDs ${this.config.searchInputId} or ${this.config.gridId}`);
      return;
    }
    
    // Store original items
    this.originalItems = Array.from(this.grid.querySelectorAll('.idea-card'));
    this.currentItems = [...this.originalItems];
    
    this.bindEvents();
  }
  
  /**
   * Bind search input events
   */
  bindEvents() {
    if (!this.searchInput) return;
    
    // Debounced search handler
    const debouncedSearch = this.debounce((searchTerm) => {
      this.removeHighlights();
      this.performSearch(searchTerm);
    }, this.config.debounceDelay);
    
    // Search input event listener
    this.searchInput.addEventListener('input', (e) => {
      debouncedSearch(e.target.value);
    });
    
    // Clear search on escape key
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.target.value = '';
        this.removeHighlights();
        this.performSearch('');
      }
    });
  }
  
  /**
   * Perform search operation
   * @param {string} searchTerm - The search term to filter by
   */
  performSearch(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (term === '') {
      // Show all items if search is empty
      this.showAllItems();
      return;
    }
    
    // Filter items based on search term
    let matchCount = 0;
    this.currentItems.forEach(card => {
      if (this.matchesSearchTerm(card, term)) {
        card.style.display = 'block';
        matchCount++;
        
        if (this.config.highlightResults) {
          this.highlightSearchTerm(card, term);
        }
      } else {
        card.style.display = 'none';
      }
    });
    
    // Show empty state if needed
    if (this.config.showEmptyState) {
      this.toggleEmptyState(matchCount === 0);
    }
    
    // Emit search event
    this.emitEvent('search', {
      term: searchTerm,
      matchCount: matchCount,
      totalItems: this.currentItems.length
    });
  }
  
  /**
   * Check if a card matches the search term
   * @param {HTMLElement} card - The idea card element
   * @param {string} term - The search term (lowercase)
   * @returns {boolean} - True if the card matches
   */
  matchesSearchTerm(card, term) {
    for (const field of this.config.searchFields) {
      const content = this.getCardFieldContent(card, field);
      if (content && content.toLowerCase().includes(term)) {
        return true;
      }
    }
    return false;
  }
  
  /**
   * Get content from a card field
   * @param {HTMLElement} card - The idea card element
   * @param {string} field - The field name (title, description, author)
   * @returns {string} - The field content
   */
  getCardFieldContent(card, field) {
    const selectors = {
      'title': '.idea-title',
      'description': '.idea-description',
      'author': '.author-name, .idea-author'
    };
    
    const element = card.querySelector(selectors[field]);
    return element ? element.textContent : '';
  }
  
  /**
   * Highlight search terms in card content
   * @param {HTMLElement} card - The idea card element
   * @param {string} term - The search term
   */
  highlightSearchTerm(card, term) {
    const fieldsToHighlight = this.config.searchFields.filter(field => 
      ['title', 'description'].includes(field)
    );
    
    fieldsToHighlight.forEach(field => {
      const element = card.querySelector(this.getFieldSelector(field));
      if (element) {
        const originalText = element.textContent;
        const highlightedText = originalText.replace(
          new RegExp(`(${this.escapeRegExp(term)})`, 'gi'),
          '<mark>$1</mark>'
        );
        if (originalText !== highlightedText) {
          element.innerHTML = highlightedText;
        }
      }
    });
  }
  
  /**
   * Get CSS selector for a field
   * @param {string} field - The field name
   * @returns {string} - The CSS selector
   */
  getFieldSelector(field) {
    const selectors = {
      'title': '.idea-title',
      'description': '.idea-description',
      'author': '.author-name, .idea-author'
    };
    return selectors[field] || '';
  }
  
  /**
   * Remove all highlights from search results
   */
  removeHighlights() {
    if (!this.grid) return;
    
    const highlights = this.grid.querySelectorAll('mark');
    highlights.forEach(mark => {
      mark.outerHTML = mark.innerHTML;
    });
  }
  
  /**
   * Show all items (reset search)
   */
  showAllItems() {
    this.currentItems.forEach(card => {
      card.style.display = 'block';
    });
    
    if (this.config.showEmptyState) {
      this.toggleEmptyState(false);
    }
    
    this.emitEvent('reset', {
      totalItems: this.currentItems.length
    });
  }
  
  /**
   * Toggle empty state visibility
   * @param {boolean} show - Whether to show empty state
   */
  toggleEmptyState(show) {
    if (show) {
      this.showEmptyState();
    } else {
      this.hideEmptyState();
    }
  }
  
  /**
   * Show empty state when no results found
   */
  showEmptyState() {
    if (!this.emptyStateElement) {
      this.createEmptyState();
    }
    
    this.emptyStateElement.style.display = 'block';
    this.grid.style.display = 'none';
  }
  
  /**
   * Hide empty state
   */
  hideEmptyState() {
    if (this.emptyStateElement) {
      this.emptyStateElement.style.display = 'none';
    }
    this.grid.style.display = 'grid';
  }
  
  /**
   * Create empty state element
   */
  createEmptyState() {
    this.emptyStateElement = document.createElement('div');
    this.emptyStateElement.className = 'search-empty-state empty-state';
    this.emptyStateElement.innerHTML = `
      <div class="empty-state-content">
        <div class="empty-state-icon">
          <i class="fas fa-search"></i>
        </div>
        <h3 class="empty-state-title">${this.config.emptyMessage}</h3>
        <p class="empty-state-message">${this.config.emptySubMessage}</p>
      </div>
    `;
    
    this.grid.parentNode.appendChild(this.emptyStateElement);
  }
  
  /**
   * Apply additional filters to the current search results
   * @param {Function} filterFn - Filter function that takes a card element and returns boolean
   */
  applyFilter(filterFn) {
    const searchTerm = this.searchInput ? this.searchInput.value : '';
    
    // First apply search filter, then additional filter
    this.currentItems.forEach(card => {
      const matchesSearch = searchTerm === '' || this.matchesSearchTerm(card, searchTerm.toLowerCase());
      const matchesFilter = filterFn(card);
      
      if (matchesSearch && matchesFilter) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
    
    // Update empty state
    const visibleCount = this.currentItems.filter(card => 
      card.style.display !== 'none'
    ).length;
    
    if (this.config.showEmptyState) {
      this.toggleEmptyState(visibleCount === 0);
    }
  }
  
  /**
   * Reset all filters and search
   */
  reset() {
    if (this.searchInput) {
      this.searchInput.value = '';
    }
    this.removeHighlights();
    this.showAllItems();
  }
  
  /**
   * Emit custom events
   * @param {string} eventName - The event name
   * @param {Object} data - The event data
   */
  emitEvent(eventName, data) {
    const event = new CustomEvent(`search:${eventName}`, {
      detail: data,
      bubbles: true
    });
    
    if (this.searchInput) {
      this.searchInput.dispatchEvent(event);
    }
  }
  
  /**
   * Debounce utility function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} - Debounced function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  /**
   * Escape special regex characters
   * @param {string} string - String to escape
   * @returns {string} - Escaped string
   */
  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  /**
   * Destroy the search manager and clean up event listeners
   */
  destroy() {
    if (this.searchInput) {
      this.searchInput.removeEventListener('input', this.performSearch);
      this.searchInput.removeEventListener('keydown', this.performSearch);
    }
    
    if (this.emptyStateElement && this.emptyStateElement.parentNode) {
      this.emptyStateElement.parentNode.removeChild(this.emptyStateElement);
    }
    
    this.removeHighlights();
    this.showAllItems();
  }
}

// Make SearchManager available globally
window.SearchManager = SearchManager;