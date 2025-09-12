// Explore page functionality with backend search
document.addEventListener('DOMContentLoaded', function() {
  
  // Progressive Enhancement for search form
  const mainSearchForm = document.querySelector('.search-form');
  const searchInput = mainSearchForm?.querySelector('input[name="q"]');
  const searchButton = mainSearchForm?.querySelector('.search-submit-btn');
  
  if (mainSearchForm && searchInput) {
    // Add loading state on form submission
    mainSearchForm.addEventListener('submit', function(e) {
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
  
  // Handle favorite button clicks (both old and new integrated buttons)
  document.addEventListener('click', function(e) {
    // Handle old favorite button style
    if (e.target.closest('.idea-favorite')) {
      e.preventDefault();
      e.stopPropagation();
      
      if (e.target.closest('.favorite-btn')) {
        const button = e.target.closest('.favorite-btn');
        const ideaId = button.getAttribute('data-idea-id');
        
        if (ideaId && !button.disabled) {
          toggleFavorite(ideaId, button);
        }
      }
    }
    
    // Handle new integrated favorite button with count
    if (e.target.closest('.favorite-btn-with-count')) {
      e.preventDefault();
      e.stopPropagation();
      
      const button = e.target.closest('.favorite-btn-with-count');
      const ideaId = button.getAttribute('data-idea-id');
      
      if (ideaId && !button.disabled) {
        toggleFavorite(ideaId, button);
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
   * Update favorite button UI and statistics
   * @param {HTMLElement} buttonElement - The favorite button element  
   * @param {boolean} isFavorited - Whether the idea is favorited
   */
  function updateFavoriteUI(buttonElement, isFavorited) {
    const heartIcon = buttonElement.querySelector('i');
    const isIntegratedButton = buttonElement.classList.contains('favorite-btn-with-count');
    
    if (isFavorited) {
      buttonElement.classList.add('favorited');
      buttonElement.title = 'Remove from favorites';
      buttonElement.setAttribute('aria-label', 'Remove from favorites');
      heartIcon.className = 'fas fa-heart';
      
      // For integrated button, update the count within the button
      if (isIntegratedButton) {
        const countElement = buttonElement.querySelector('[data-favorite-count]');
        if (countElement) {
          updateStatCount(countElement, 1);
        }
      } else {
        // For old button style, find external count element
        const ideaCard = buttonElement.closest('.idea-card');
        const favoriteCountElement = ideaCard?.querySelector('[data-favorite-count]');
        if (favoriteCountElement) {
          updateStatCount(favoriteCountElement, 1);
        }
      }
    } else {
      buttonElement.classList.remove('favorited');
      buttonElement.title = 'Add to favorites';
      buttonElement.setAttribute('aria-label', 'Add to favorites');
      heartIcon.className = 'far fa-heart';
      
      // For integrated button, update the count within the button
      if (isIntegratedButton) {
        const countElement = buttonElement.querySelector('[data-favorite-count]');
        if (countElement) {
          updateStatCount(countElement, -1);
        }
      } else {
        // For old button style, find external count element
        const ideaCard = buttonElement.closest('.idea-card');
        const favoriteCountElement = ideaCard?.querySelector('[data-favorite-count]');
        if (favoriteCountElement) {
          updateStatCount(favoriteCountElement, -1);
        }
      }
    }
  }
  
  /**
   * Update statistic count display
   * @param {HTMLElement} statElement - The stat count element
   * @param {number} change - The change amount (+1 or -1)
   */
  function updateStatCount(statElement, change) {
    const currentCount = parseInt(statElement.getAttribute('data-favorite-count') || '0');
    const newCount = Math.max(0, currentCount + change); // Ensure non-negative
    
    // Update data attribute
    statElement.setAttribute('data-favorite-count', newCount.toString());
    
    // Update displayed text using formatNumber helper
    statElement.textContent = formatNumberJS(newCount);
  }
  
  /**
   * JavaScript version of formatNumber helper (matching handlebars helper)
   * @param {number} num - Number to format
   * @returns {string} Formatted number string
   */
  function formatNumberJS(num) {
    if (!num || isNaN(num)) return '0';
    const number = parseInt(num);
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (number >= 1000) {
      return (number / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return number.toString();
  }
  
  // ===== INFINITE SCROLL FUNCTIONALITY =====
  
  // Infinite scroll state management
  const infiniteScrollState = {
    isLoading: false,
    hasMore: true,
    currentCursor: null,
    searchQuery: new URLSearchParams(window.location.search).get('q') || ''
  };

  // Initialize infinite scroll state with smart detection
  function initializeInfiniteScrollState() {
    const existingIdeas = document.querySelectorAll('.idea-card');
    const existingCount = existingIdeas.length;
    
    // Smart initialization logic
    if (existingCount === 0) {
      infiniteScrollState.hasMore = false;
    } else {
      infiniteScrollState.hasMore = true;
    }
  }
  
  // Initialize state after DOM is ready
  initializeInfiniteScrollState();
  
  /**
   * Initialize infinite scroll functionality
   */
  function initInfiniteScroll() {
    const ideasGrid = document.getElementById('exploreIdeasGrid');
    if (!ideasGrid) {
      console.error('❌ Ideas grid not found');
      return;
    }
    
    // Create sentinel element for intersection observer
    const sentinel = createSentinel();
    ideasGrid.parentNode.appendChild(sentinel);
    
    // Initialize intersection observer
    const observer = new IntersectionObserver(
      handleIntersection,
      {
        root: null,
        rootMargin: '200px', // Trigger 200px before reaching the sentinel
        threshold: 0.1
      }
    );
    
    observer.observe(sentinel);
    
    // Store references for cleanup if needed
    infiniteScrollState.observer = observer;
    infiniteScrollState.sentinel = sentinel;
  }
  
  /**
   * Create sentinel element for intersection detection
   * @returns {HTMLElement} The sentinel element
   */
  function createSentinel() {
    const sentinel = document.createElement('div');
    sentinel.id = 'infinite-scroll-sentinel';
    sentinel.style.height = '1px';
    sentinel.style.background = 'transparent';
    sentinel.style.width = '100%';
    return sentinel;
  }
  
  /**
   * Handle intersection observer callback
   * @param {IntersectionObserverEntry[]} entries - Observer entries
   */
  function handleIntersection(entries) {
    const [entry] = entries;
    
    // Only trigger if sentinel is visible and we're not already loading
    if (entry.isIntersecting && 
        !infiniteScrollState.isLoading && 
        infiniteScrollState.hasMore) {
      
      // Debounce to prevent multiple rapid calls
      if (infiniteScrollState.loadTimeout) {
        clearTimeout(infiniteScrollState.loadTimeout);
      }
      
      infiniteScrollState.loadTimeout = setTimeout(() => {
        loadMoreIdeas();
      }, 100); // 100ms debounce
    }
  }
  
  /**
   * Load more ideas from the API
   */
  async function loadMoreIdeas() {
    if (infiniteScrollState.isLoading || !infiniteScrollState.hasMore) {
      return;
    }
    
    infiniteScrollState.isLoading = true;
    showLoadingIndicator();
    
    try {
      const params = new URLSearchParams({
        limit: '10',
        q: infiniteScrollState.searchQuery
      });
      
      if (infiniteScrollState.currentCursor) {
        params.set('cursor', infiniteScrollState.currentCursor);
      }
      
      const response = await fetch(`/api/explore/ideas?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.ideas && data.ideas.length > 0) {
        appendNewIdeas(data.ideas);
        infiniteScrollState.currentCursor = data.nextCursor;
        infiniteScrollState.hasMore = data.hasMore;
        
        if (!data.hasMore) {
          showEndMessage();
        }
      } else {
        infiniteScrollState.hasMore = false;
        showEndMessage();
      }
      
    } catch (error) {
      console.error('Error loading more ideas:', error);
      showErrorState(error);
    } finally {
      infiniteScrollState.isLoading = false;
      hideLoadingIndicator();
    }
  }
  
  /**
   * Show loading indicator
   */
  function showLoadingIndicator() {
    let indicator = document.getElementById('infinite-scroll-loading');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'infinite-scroll-loading';
      indicator.className = 'infinite-scroll-loading';
      indicator.innerHTML = `
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <span class="loading-text">Loading more ideas...</span>
        </div>
      `;
      
      const sentinel = infiniteScrollState.sentinel;
      sentinel.parentNode.insertBefore(indicator, sentinel);
    }
    
    indicator.style.display = 'block';
  }
  
  /**
   * Hide loading indicator
   */
  function hideLoadingIndicator() {
    const indicator = document.getElementById('infinite-scroll-loading');
    if (indicator) {
      indicator.style.display = 'none';
    }
  }
  
  /**
   * Show end of content message
   */
  function showEndMessage() {
    let endMessage = document.getElementById('infinite-scroll-end');
    if (!endMessage) {
      endMessage = document.createElement('div');
      endMessage.id = 'infinite-scroll-end';
      endMessage.className = 'infinite-scroll-end';
      endMessage.innerHTML = `
        <div class="end-message">
          <i class="fas fa-check-circle"></i>
          <span>You've reached the end!</span>
        </div>
      `;
      
      const sentinel = infiniteScrollState.sentinel;
      sentinel.parentNode.insertBefore(endMessage, sentinel);
    }
    
    endMessage.style.display = 'block';
  }
  
  /**
   * Show error state with retry option
   * @param {Error} error - The error that occurred
   */
  function showErrorState(error) {
    let errorElement = document.getElementById('infinite-scroll-error');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.id = 'infinite-scroll-error';
      errorElement.className = 'infinite-scroll-error';
      errorElement.innerHTML = `
        <div class="error-content">
          <i class="fas fa-exclamation-triangle"></i>
          <span class="error-message">Failed to load more ideas</span>
          <button class="retry-btn" onclick="retryLoadMore()">
            <i class="fas fa-redo"></i>
            Try Again
          </button>
        </div>
      `;
      
      const sentinel = infiniteScrollState.sentinel;
      sentinel.parentNode.insertBefore(errorElement, sentinel);
    }
    
    errorElement.style.display = 'block';
  }
  
  /**
   * Global retry function for error state
   */
  window.retryLoadMore = function() {
    const errorElement = document.getElementById('infinite-scroll-error');
    if (errorElement) {
      errorElement.style.display = 'none';
    }
    
    // Reset loading state and try again
    infiniteScrollState.isLoading = false;
    loadMoreIdeas();
  };
  
  /**
   * Append new ideas to the grid (with duplicate detection)
   * @param {Array} ideas - Array of idea objects from API
   */
  function appendNewIdeas(ideas) {
    const ideasGrid = document.getElementById('exploreIdeasGrid');
    if (!ideasGrid) return;
    
    // Get existing idea IDs to prevent duplicates
    const existingIdeas = new Set();
    const existingCards = ideasGrid.querySelectorAll('.idea-card[data-idea-id]');
    existingCards.forEach(card => {
      const ideaId = card.getAttribute('data-idea-id');
      if (ideaId) {
        existingIdeas.add(parseInt(ideaId));
      }
    });
    
    // Filter out duplicate ideas
    const newIdeas = ideas.filter(idea => {
      const isDuplicate = existingIdeas.has(idea.id);
      if (isDuplicate) {
        console.warn('⚠️ Duplicate idea detected and filtered out:', idea.id, idea.title);
      }
      return !isDuplicate;
    });
    
    // Only append non-duplicate ideas
    newIdeas.forEach(idea => {
      const ideaCardHTML = generateIdeaCardHTML(idea);
      ideasGrid.insertAdjacentHTML('beforeend', ideaCardHTML);
    });
    
    // Add hover effects to new cards
    const newCards = ideasGrid.querySelectorAll('.idea-card:not([data-hover-initialized])');
    newCards.forEach(card => {
      card.setAttribute('data-hover-initialized', 'true');
      card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
      });
      
      card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
      });
    });
  }
  
  /**
   * Generate HTML for an idea card (client-side templating)
   * @param {Object} idea - Idea object from API
   * @returns {string} HTML string for the idea card
   */
  function generateIdeaCardHTML(idea) {
    const borderColor = getBorderColorJS(Math.floor(Math.random() * 8)); // Random border color
    const viewCount = formatNumberJS(idea.viewCount || 0);
    const favoriteCount = formatNumberJS(idea.favoriteCount || 0);
    const heartIcon = idea.isFavorited ? 'fas fa-heart' : 'far fa-heart';
    const favoritedClass = idea.isFavorited ? 'favorited' : '';
    
    // Generate tags HTML with proper styling (use tag index like Handlebars)
    const tagsHTML = idea.tags && idea.tags.length > 0 
      ? idea.tags.map((tag, index) => {
          const tagColor = getTagColorJS(index);
          const tagName = truncateTagJS(tag.name, 10);
          return `<span class="tag-badge ${tagColor}" title="${escapeHTML(tag.name)}">${escapeHTML(tagName)}</span>`;
        }).join('')
      : '';
    
    // Truncate content like Handlebars helper
    const truncatedContent = idea.content.length > 40 
      ? idea.content.substring(0, 40) + '...' 
      : idea.content;
    
    return `
      <a href="/explore?share=${idea.shareLink}" class="idea-card" data-border="${borderColor}" data-idea-id="${idea.id}">
        <div class="idea-top-right">
          <div class="idea-stats-corner">
            <span class="stat-item">
              <i class="fas fa-eye"></i>
              <span class="stat-count" data-view-count="${idea.viewCount || 0}">${viewCount}</span>
            </span>
            <button 
              class="favorite-btn-with-count ${favoritedClass}"
              data-idea-id="${idea.id}"
              title="${idea.isFavorited ? 'Remove from favorites' : 'Add to favorites'}"
              aria-label="${idea.isFavorited ? 'Remove from favorites' : 'Add to favorites'}"
            >
              <i class="${heartIcon}"></i>
              <span class="stat-count" data-favorite-count="${idea.favoriteCount || 0}">${favoriteCount}</span>
            </button>
          </div>
        </div>
        
        <div class="idea-color-bar" data-color="${borderColor}"></div>
        
        <div class="idea-content">
          <h3 class="idea-title">${escapeHTML(idea.title)}</h3>
          <p class="idea-description">${escapeHTML(truncatedContent)}</p>
          
          <div class="idea-footer">
            <div class="idea-author-info ${idea.User?.id ? 'author-clickable' : ''}" ${idea.User?.id ? `data-user-id="${idea.User.id}"` : ''}>
              <img src="${idea.User?.avatar || '/img/default-avatar.svg'}" alt="${escapeHTML(idea.User?.name || 'Anonymous')}" class="author-avatar">
              <span class="author-name">${escapeHTML(idea.User?.name || 'Anonymous')}</span>
            </div>
            ${tagsHTML ? `<div class="idea-tags">${tagsHTML}</div>` : ''}
          </div>
        </div>
      </a>
    `;
  }
  
  function getBorderColorJS(index) {
    const colors = ['purple', 'green', 'red', 'blue', 'orange', 'teal', 'pink', 'indigo'];
    return colors[index % colors.length];
  }
  
  function getTagColorJS(index) {
    // Match Handlebars helper color order exactly
    const tagColors = ['tag-blue', 'tag-orange', 'tag-green', 'tag-purple', 'tag-pink'];
    return tagColors[index % tagColors.length];
  }

  function truncateTagJS(tagName, maxLength = 10) {
    if (!tagName) return '';
    if (tagName.length <= maxLength) return tagName;
    return tagName.substring(0, maxLength - 2) + '...';
  }
  
  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  function escapeHTML(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Initialize infinite scroll when DOM is ready
  if (document.getElementById('exploreIdeasGrid')) {
    initInfiniteScroll();
  }
  
  // ===== BACK TO TOP FUNCTIONALITY =====
  
  /**
   * Initialize back to top button
   */
  function initBackToTop() {
    // Check if button already exists
    if (document.querySelector('.back-to-top')) {
      return;
    }
    
    // Create back to top button
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    backToTopBtn.title = 'Back to top';
    backToTopBtn.setAttribute('aria-label', 'Back to top');
    
    document.body.appendChild(backToTopBtn);
    
    // Show/hide button based on scroll position
    let scrollTimeout;
    window.addEventListener('scroll', function() {
      // Use requestAnimationFrame for smooth performance
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      scrollTimeout = setTimeout(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const shouldShow = scrollTop > 200; // Show after scrolling 200px
        
        if (shouldShow && !backToTopBtn.classList.contains('visible')) {
          backToTopBtn.classList.add('visible');
        } else if (!shouldShow && backToTopBtn.classList.contains('visible')) {
          backToTopBtn.classList.remove('visible');
        }
      }, 10);
    });
    
    // Handle click to scroll to top
    backToTopBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  // Initialize back to top button
  initBackToTop();
  
  // ===== SEARCH INTEGRATION WITH INFINITE SCROLL =====
  
  /**
   * Handle search form submission to reset infinite scroll
   */
  const searchFormForInfiniteScroll = document.querySelector('.search-form');
  if (searchFormForInfiniteScroll) {
    searchFormForInfiniteScroll.addEventListener('submit', function() {
      // Reset infinite scroll state when searching
      infiniteScrollState.currentCursor = null;
      infiniteScrollState.hasMore = true;
      infiniteScrollState.isLoading = false;
      
      // Update search query from form
      const searchInput = searchFormForInfiniteScroll.querySelector('input[name="q"]');
      if (searchInput) {
        infiniteScrollState.searchQuery = searchInput.value.trim();
      }
      
      // Hide any existing infinite scroll elements
      const elements = [
        'infinite-scroll-loading',
        'infinite-scroll-end', 
        'infinite-scroll-error'
      ];
      
      elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.style.display = 'none';
        }
      });
    });
  }
  
  // ===== MOBILE OPTIMIZATION =====
  
  /**
   * Adjust infinite scroll behavior for mobile devices
   */
  function optimizeForMobile() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      // Adjust root margin for mobile (trigger earlier)
      if (infiniteScrollState.observer) {
        infiniteScrollState.observer.disconnect();
        
        const observer = new IntersectionObserver(
          handleIntersection,
          {
            root: null,
            rootMargin: '150px', // Smaller margin for mobile
            threshold: 0.1
          }
        );
        
        observer.observe(infiniteScrollState.sentinel);
        infiniteScrollState.observer = observer;
      }
    }
  }
  
  // Apply mobile optimization on load and resize
  optimizeForMobile();
  window.addEventListener('resize', function() {
    // Debounce resize events
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(optimizeForMobile, 250);
  });
  
});