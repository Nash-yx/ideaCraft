// Explore page functionality
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('exploreSearch');
  const ideasGrid = document.getElementById('exploreIdeasGrid');
  const ideaCards = document.querySelectorAll('.idea-card');
  
  if (!searchInput || !ideasGrid) return;

  // Store original ideas for filtering
  const originalIdeas = Array.from(ideaCards);
  
  // Debounce function to limit search frequency
  function debounce(func, wait) {
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
  
  // Search functionality
  function performSearch(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (term === '') {
      // Show all ideas if search is empty
      originalIdeas.forEach(card => {
        card.style.display = 'block';
      });
      return;
    }
    
    // Filter ideas based on search term
    originalIdeas.forEach(card => {
      const title = card.querySelector('.idea-title')?.textContent?.toLowerCase() || '';
      const description = card.querySelector('.idea-description')?.textContent?.toLowerCase() || '';
      const author = card.querySelector('.idea-author')?.textContent?.toLowerCase() || '';
      
      // Search in title, description, and author
      const matches = title.includes(term) || 
                     description.includes(term) || 
                     author.includes(term);
      
      if (matches) {
        card.style.display = 'block';
        // Highlight search terms (optional)
        highlightSearchTerm(card, term);
      } else {
        card.style.display = 'none';
      }
    });
    
    // Show empty state if no results
    showEmptyStateIfNeeded();
  }
  
  // Highlight search terms in results
  function highlightSearchTerm(card, term) {
    // Simple highlighting - could be enhanced
    const title = card.querySelector('.idea-title');
    const description = card.querySelector('.idea-description');
    
    if (title) {
      const originalTitle = title.textContent;
      const highlightedTitle = originalTitle.replace(
        new RegExp(`(${term})`, 'gi'),
        '<mark>$1</mark>'
      );
      if (originalTitle !== highlightedTitle) {
        title.innerHTML = highlightedTitle;
      }
    }
  }
  
  // Remove highlights
  function removeHighlights() {
    const highlights = document.querySelectorAll('.idea-card mark');
    highlights.forEach(mark => {
      mark.outerHTML = mark.innerHTML;
    });
  }
  
  // Show empty state when no results found
  function showEmptyStateIfNeeded() {
    const visibleCards = Array.from(originalIdeas).filter(card => 
      card.style.display !== 'none'
    );
    
    let emptyState = document.querySelector('.search-empty-state');
    
    if (visibleCards.length === 0) {
      if (!emptyState) {
        emptyState = document.createElement('div');
        emptyState.className = 'search-empty-state empty-state';
        emptyState.innerHTML = `
          <div class="empty-state-content">
            <div class="empty-state-icon">
              <i class="fas fa-search"></i>
            </div>
            <h3 class="empty-state-title">No ideas found</h3>
            <p class="empty-state-message">Try different keywords or browse all public ideas.</p>
          </div>
        `;
        ideasGrid.parentNode.appendChild(emptyState);
      }
      emptyState.style.display = 'block';
      ideasGrid.style.display = 'none';
    } else {
      if (emptyState) {
        emptyState.style.display = 'none';
      }
      ideasGrid.style.display = 'grid';
    }
  }
  
  // Debounced search handler
  const debouncedSearch = debounce((searchTerm) => {
    removeHighlights();
    performSearch(searchTerm);
  }, 300);
  
  // Search input event listener
  searchInput.addEventListener('input', function(e) {
    debouncedSearch(e.target.value);
  });
  
  // Clear search on escape key
  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      e.target.value = '';
      removeHighlights();
      performSearch('');
    }
  });
  
  // Idea card hover effects (reuse from home.js)
  originalIdeas.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
});