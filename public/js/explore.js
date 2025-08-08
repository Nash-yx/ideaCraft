// Explore page functionality with backend search
document.addEventListener('DOMContentLoaded', function() {
  
  // Progressive Enhancement for search form
  const searchForm = document.querySelector('.search-form');
  const searchInput = searchForm?.querySelector('input[name="q"]');
  const searchButton = searchForm?.querySelector('.search-submit-btn');
  
  if (searchForm && searchInput) {
    // Add loading state on form submission
    searchForm.addEventListener('submit', function(e) {
      // Show loading state
      if (searchButton) {
        const originalHtml = searchButton.innerHTML;
        searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        searchButton.disabled = true;
        
        // Reset button after a timeout as fallback
        setTimeout(() => {
          searchButton.innerHTML = originalHtml;
          searchButton.disabled = false;
        }, 5000);
      }
      
      // Add loading class to search input
      searchInput.classList.add('searching');
    });
    
    // Auto-focus search input if there's a search query
    const urlParams = new URLSearchParams(window.location.search);
    const currentQuery = urlParams.get('q');
    if (currentQuery && searchInput.value) {
      // Move cursor to end of input
      searchInput.focus();
      searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
    }
    
    // Enhanced keyboard shortcuts
    searchInput.addEventListener('keydown', function(e) {
      // Clear search on Escape
      if (e.key === 'Escape') {
        if (this.value) {
          this.value = '';
        } else {
          // If already empty, navigate to explore page
          window.location.href = '/explore';
        }
      }
    });
  }
  
  // Idea card hover effects
  const ideaCards = document.querySelectorAll('.idea-card');
  ideaCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
  
  // Clear search link enhancement
  const clearSearchLink = document.querySelector('.clear-search-link');
  if (clearSearchLink) {
    clearSearchLink.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Add smooth transition
      this.style.opacity = '0.5';
      
      // Navigate to explore page
      window.location.href = '/explore';
    });
  }
  
  console.log('Explore page with backend search initialized');
});