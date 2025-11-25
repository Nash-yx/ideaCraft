// Favorites page functionality
document.addEventListener('DOMContentLoaded', function() {
  // Initialize search functionality using SearchManager
  const favoritesSearch = new SearchManager({
    searchInputId: 'favoritesSearch',
    gridId: 'favoritesIdeasGrid',
    searchFields: ['title', 'description', 'tags', 'author-name'],
    emptyMessage: 'No favorites found',
    emptySubMessage: 'Try different keywords or load all favorites to search.',
    debounceDelay: 300
  });
  
  // Listen to search events
  const searchInput = document.getElementById('favoritesSearch');
  if (searchInput) {
    searchInput.addEventListener('search:search', function(e) {
      console.log('Favorites search:', e.detail);
    });
    
    searchInput.addEventListener('search:reset', function(e) {
      console.log('Favorites search reset:', e.detail);
    });
  }
  
  // Store manager instance
  window.favoritesSearchManager = favoritesSearch;

  // Sort functionality
  const sortDropdown = document.getElementById('favoritesSort');
  if (sortDropdown) {
    sortDropdown.addEventListener('change', function() {
      const sortType = this.value;
      sortFavorites(sortType);
    });
  }

  // Smart loading functionality
  const loadAllToSearchBtn = document.getElementById('loadAllToSearch');
  const loadAllFavoritesBtn = document.getElementById('loadAllFavorites');

  if (loadAllToSearchBtn) {
    loadAllToSearchBtn.addEventListener('click', function() {
      loadAllFavorites(true); // Load all and focus search
    });
  }

  if (loadAllFavoritesBtn) {
    loadAllFavoritesBtn.addEventListener('click', function() {
      loadAllFavorites(false); // Just load all
    });
  }

  // Unfavorite functionality
  document.addEventListener('click', function(e) {
    if (e.target.closest('.unfavorite-btn')) {
      e.preventDefault();
      e.stopPropagation();
      
      const button = e.target.closest('.unfavorite-btn');
      const ideaId = button.dataset.ideaId;
      
      if (ideaId) {
        handleUnfavorite(ideaId, button);
      }
    }
  });

  // Author navigation functionality (inherited from explore.js pattern)
  document.addEventListener('click', function(e) {
    const authorInfo = e.target.closest('.author-clickable');
    if (authorInfo) {
      e.preventDefault();
      e.stopPropagation();
      
      const userId = authorInfo.dataset.userId;
      if (userId) {
        window.location.href = `/author/${userId}`;
      }
    }
  });
});

/**
 * Sort favorites by different criteria
 * @param {string} sortType - The sort type: 'recent', 'oldest', 'popular', 'author'
 */
function sortFavorites(sortType) {
  const grid = document.getElementById('favoritesIdeasGrid');
  if (!grid) return;

  const cards = Array.from(grid.children);
  
  cards.sort((a, b) => {
    switch (sortType) {
      case 'recent':
        // Sort by favorited time (newest first)
        const timeA = getCardFavoritedTime(a);
        const timeB = getCardFavoritedTime(b);
        return new Date(timeB) - new Date(timeA);
        
      case 'oldest':
        // Sort by favorited time (oldest first)
        const timeA2 = getCardFavoritedTime(a);
        const timeB2 = getCardFavoritedTime(b);
        return new Date(timeA2) - new Date(timeB2);
        
      case 'popular':
        // Sort by view count + favorite count combined
        const popularityA = getCardPopularity(a);
        const popularityB = getCardPopularity(b);
        return popularityB - popularityA;
        
      case 'author':
        // Sort by author name alphabetically
        const authorA = getCardAuthorName(a);
        const authorB = getCardAuthorName(b);
        return authorA.localeCompare(authorB);
        
      default:
        return 0;
    }
  });

  // Re-append sorted cards to grid
  cards.forEach(card => grid.appendChild(card));

  // Add visual feedback
  grid.style.opacity = '0.5';
  setTimeout(() => {
    grid.style.opacity = '1';
  }, 150);
}

/**
 * Get favorited time from card element
 * @param {Element} card - The card element
 * @returns {string} - The favorited time
 */
function getCardFavoritedTime(card) {
  const timeElement = card.querySelector('.favorited-time span');
  return timeElement ? timeElement.textContent : '';
}

/**
 * Get popularity score (view count + favorite count) from card
 * @param {Element} card - The card element  
 * @returns {number} - The popularity score
 */
function getCardPopularity(card) {
  const viewCount = parseInt(card.querySelector('[data-view-count]')?.dataset.viewCount || '0');
  const favoriteCount = parseInt(card.querySelector('[data-favorite-count]')?.dataset.favoriteCount || '0');
  return viewCount + favoriteCount * 2; // Weight favorites more than views
}

/**
 * Get author name from card element
 * @param {Element} card - The card element
 * @returns {string} - The author name
 */
function getCardAuthorName(card) {
  const authorElement = card.querySelector('.author-name');
  return authorElement ? authorElement.textContent.trim() : '';
}

/**
 * Load all favorites with optional search focus
 * @param {boolean} focusSearch - Whether to focus search after loading
 */
function loadAllFavorites(focusSearch = false) {
  const currentUrl = new URL(window.location);
  currentUrl.searchParams.set('loadAll', 'true');
  
  // Show loading state
  const loadingSection = document.querySelector('.smart-loading-section');
  if (loadingSection) {
    loadingSection.innerHTML = `
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Loading all favorites...</span>
      </div>
    `;
  }
  
  // Navigate to load all
  window.location.href = currentUrl.toString() + (focusSearch ? '#search' : '');
}

/**
 * Handle unfavorite action
 * @param {string} ideaId - The idea ID to unfavorite
 * @param {Element} button - The button element
 */
async function handleUnfavorite(ideaId, button) {
  try {
    // Add loading state
    const originalContent = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    button.disabled = true;

    // Get CSRF token
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    // Send unfavorite request
    const response = await fetch(`/ideas/${ideaId}/favorite`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      }
    });

    if (response.ok) {
      // Remove the card from the grid with animation
      const card = button.closest('.idea-card');
      if (card) {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
          card.remove();
          updateStatsAfterUnfavorite();
          
          // Reload page to show flash message from backend
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }, 200);
      }
    } else {
      throw new Error('Failed to unfavorite');
    }

  } catch (error) {
    console.error('Error unfavoriting idea:', error);
    
    // Restore button state
    button.innerHTML = originalContent;
    button.disabled = false;
    
    // Reload page to show error message from backend
    window.location.reload();
  }
}

/**
 * Update statistics after unfavoriting an idea
 */
function updateStatsAfterUnfavorite() {
  const totalFavoritesElement = document.querySelector('.favorites-stats .stat-number');
  if (totalFavoritesElement) {
    const currentCount = parseInt(totalFavoritesElement.textContent) || 0;
    totalFavoritesElement.textContent = Math.max(0, currentCount - 1);
  }

  // Check if grid is empty and show empty state
  const grid = document.getElementById('favoritesIdeasGrid');
  if (grid && grid.children.length === 0) {
    showEmptyState();
  }
}

/**
 * Show empty state when no favorites remain
 */
function showEmptyState() {
  const ideasContent = document.querySelector('.ideas-content');
  if (ideasContent) {
    ideasContent.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-content">
          <div class="empty-state-icon">
            <i class="fas fa-heart"></i>
          </div>
          <h3 class="empty-state-title">No favorite ideas yet</h3>
          <p class="empty-state-message">Start exploring and save ideas that inspire you!</p>
          <a href="/explore" class="btn btn-primary">
            <i class="fas fa-search"></i>
            Explore Ideas
          </a>
        </div>
      </div>
    `;
  }
}

