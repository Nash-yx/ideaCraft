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
  
  // ===== POPULAR TAGS FUNCTIONALITY =====
  
  // Handle popular tag button clicks
  document.addEventListener('click', function(e) {
    if (e.target.closest('.popular-tag-btn')) {
      const button = e.target.closest('.popular-tag-btn');
      const tagName = button.dataset.tag;
      
      if (tagName) {
        // Find the search input and form
        const searchInput = document.querySelector('input[name="q"]');
        const searchForm = document.querySelector('.search-form');
        
        if (searchInput && searchForm) {
          // Fill the search input with tag name
          searchInput.value = tagName;
          
          // Add visual feedback
          button.style.opacity = '0.5';
          
          // Submit the form to trigger search
          searchForm.submit();
        }
      }
    }
  });
  
  // Add hover effects for popular tag buttons
  const popularTagBtns = document.querySelectorAll('.popular-tag-btn');
  popularTagBtns.forEach(btn => {
    btn.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-1px)';
    });
    
    btn.addEventListener('mouseleave', function() {
      this.style.transform = '';
    });
  });
  
  // ===== FAVORITES FUNCTIONALITY =====
  
  // Handle favorite button and area clicks
  document.addEventListener('click', function(e) {
    // 阻止整個收藏區域的點擊事件冒泡
    if (e.target.closest('.idea-favorite')) {
      e.preventDefault();
      e.stopPropagation();
      
      // 只有點擊收藏按鈕才觸發收藏功能
      if (e.target.closest('.favorite-btn')) {
        const button = e.target.closest('.favorite-btn');
        const ideaId = button.getAttribute('data-idea-id');
        
        if (ideaId && !button.disabled) {
          toggleFavorite(ideaId, button);
        }
      }
    }
  });
  
  /**
   * Toggle favorite status for an idea
   * @param {string} ideaId - The ID of the idea to favorite/unfavorite
   * @param {HTMLElement} buttonElement - The favorite button element
   */
  async function toggleFavorite(ideaId, buttonElement) {
    // Prevent multiple simultaneous requests
    if (buttonElement.disabled) return;
    
    // 保存原始 ideaId，防止在過程中被修改
    const originalIdeaId = ideaId;
    
    buttonElement.disabled = true;
    const isFavorited = buttonElement.classList.contains('favorited');
    const heartIcon = buttonElement.querySelector('i');
    
    try {
      // Optimistic UI update
      updateFavoriteUI(buttonElement, !isFavorited);
      
      // API request - 使用保存的 ideaId
      const url = `/ideas/${originalIdeaId}/favorite`;
      const method = isFavorited ? 'DELETE' : 'POST';
      
      // Get CSRF token from meta tag
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        }
      });
      
      const result = await response.json();
      
      if (!result.success) {
        // Revert optimistic update
        updateFavoriteUI(buttonElement, isFavorited);
      } else {
        // Add success animation
        buttonElement.classList.add('pulse');
        setTimeout(() => {
          buttonElement.classList.remove('pulse');
        }, 300);
      }
    } catch (error) {
      // Revert optimistic update
      updateFavoriteUI(buttonElement, isFavorited);
    } finally {
      // Re-enable button
      setTimeout(() => {
        buttonElement.disabled = false;
      }, 300); // Small delay to prevent rapid clicking
    }
  }
  
  /**
   * Update favorite button UI
   * @param {HTMLElement} buttonElement - The favorite button element  
   * @param {boolean} isFavorited - Whether the idea is favorited
   */
  function updateFavoriteUI(buttonElement, isFavorited) {
    const heartIcon = buttonElement.querySelector('i');
    
    if (isFavorited) {
      buttonElement.classList.add('favorited');
      buttonElement.title = 'Remove from favorites';
      buttonElement.setAttribute('aria-label', 'Remove from favorites');
      heartIcon.className = 'fas fa-heart';
    } else {
      buttonElement.classList.remove('favorited');
      buttonElement.title = 'Add to favorites';
      buttonElement.setAttribute('aria-label', 'Add to favorites');
      heartIcon.className = 'far fa-heart';
    }
  }
  
});