// Home page functionality
document.addEventListener('DOMContentLoaded', function() {
  // Dark mode toggle functionality
  const darkModeToggle = document.getElementById('darkModeToggle');
  const body = document.body;
  const root = document.documentElement;
  
  // Check for saved dark mode preference
  const savedDarkMode = localStorage.getItem('darkMode');
  if (savedDarkMode === 'enabled') {
    enableDarkMode();
    darkModeToggle.checked = true;
  }
  
  // Toggle dark mode
  darkModeToggle.addEventListener('change', function() {
    if (this.checked) {
      enableDarkMode();
      localStorage.setItem('darkMode', 'enabled');
    } else {
      disableDarkMode();
      localStorage.setItem('darkMode', 'disabled');
    }
  });
  
  function enableDarkMode() {
    body.classList.add('dark-mode');
    updateCSSVariables(true);
  }
  
  function disableDarkMode() {
    body.classList.remove('dark-mode');
    updateCSSVariables(false);
  }
  
  function updateCSSVariables(isDark) {
    if (isDark) {
      // Dark mode colors
      root.style.setProperty('--bg-primary', '#1F2937');
      root.style.setProperty('--bg-secondary', '#111827');
      root.style.setProperty('--bg-tertiary', '#374151');
      root.style.setProperty('--neutral-50', '#374151');
      root.style.setProperty('--neutral-100', '#4B5563');
      root.style.setProperty('--neutral-200', '#6B7280');
      root.style.setProperty('--neutral-300', '#9CA3AF');
      root.style.setProperty('--neutral-400', '#D1D5DB');
      root.style.setProperty('--neutral-500', '#E5E7EB');
      root.style.setProperty('--neutral-600', '#F3F4F6');
      root.style.setProperty('--neutral-700', '#F9FAFB');
      root.style.setProperty('--neutral-800', '#FFFFFF');
      root.style.setProperty('--neutral-900', '#FFFFFF');
    } else {
      // Light mode colors (reset to defaults)
      root.style.setProperty('--bg-primary', '#FFFFFF');
      root.style.setProperty('--bg-secondary', '#F5F5F7');
      root.style.setProperty('--bg-tertiary', '#FAFAFA');
      root.style.setProperty('--neutral-50', '#F9FAFB');
      root.style.setProperty('--neutral-100', '#F3F4F6');
      root.style.setProperty('--neutral-200', '#E5E7EB');
      root.style.setProperty('--neutral-300', '#D1D5DB');
      root.style.setProperty('--neutral-400', '#9CA3AF');
      root.style.setProperty('--neutral-500', '#6B7280');
      root.style.setProperty('--neutral-600', '#4B5563');
      root.style.setProperty('--neutral-700', '#374151');
      root.style.setProperty('--neutral-800', '#1F2937');
      root.style.setProperty('--neutral-900', '#111827');
    }
  }
  
  // View toggle functionality (Grid vs List)
  const viewButtons = document.querySelectorAll('.view-btn');
  const ideasGrid = document.querySelector('.ideas-grid');
  
  viewButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all view buttons
      viewButtons.forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked button
      this.classList.add('active');
      
      // Toggle grid/list view
      const viewType = this.getAttribute('data-view');
      if (viewType === 'list') {
        ideasGrid.classList.add('list-view');
      } else {
        ideasGrid.classList.remove('list-view');
      }
    });
  });
  
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
  
  // Modal functionality
  const modal = document.getElementById('createIdeaModal');
  const createIdeaBtn = document.querySelector('.create-idea-btn');
  const emptyStateBtn = document.querySelector('.empty-state-btn');
  const modalClose = document.querySelector('.modal-close');
  const modalCancel = document.querySelector('.modal-cancel');
  const createIdeaForm = document.getElementById('createIdeaForm');
  
  // Open modal function
  function openModal() {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    // Focus on title input
    setTimeout(() => {
      document.getElementById('ideaTitle').focus();
    }, 100);
  }
  
  // Close modal function
  function closeModal() {
    modal.classList.remove('show');
    document.body.style.overflow = '';
    // Reset form
    createIdeaForm.reset();
  }
  
  // Show success message function
  function showSuccessMessage(message) {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = 'flash-message success-message';
    messageEl.innerHTML = `
      <div class="flash-content">
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
      </div>
    `;
    
    // Add to page
    document.body.appendChild(messageEl);
    
    // Show with animation
    setTimeout(() => {
      messageEl.classList.add('show');
    }, 100);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      messageEl.classList.remove('show');
      setTimeout(() => {
        if (messageEl.parentNode) {
          messageEl.parentNode.removeChild(messageEl);
        }
      }, 300);
    }, 3000);
  }
  
  // Event listeners for opening modal
  if (createIdeaBtn) {
    createIdeaBtn.addEventListener('click', openModal);
  }
  
  if (emptyStateBtn) {
    emptyStateBtn.addEventListener('click', openModal);
  }
  
  // Event listeners for closing modal
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }
  
  if (modalCancel) {
    modalCancel.addEventListener('click', closeModal);
  }
  
  // Close modal when clicking outside
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // Close modal with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      closeModal();
    }
  });
  
  // Form submission
  if (createIdeaForm) {
    createIdeaForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const submitButton = this.querySelector('button[type="submit"]');
      const originalText = submitButton.innerHTML;
      
      // Convert FormData to URLSearchParams for proper encoding
      const params = new URLSearchParams();
      for (const [key, value] of formData.entries()) {
        params.append(key, value);
      }
      
      // Show loading state
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
      
      // Submit form
      fetch('/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      })
      .then(response => {
        if (response.redirected || response.ok) {
          // Close modal first
          closeModal();
          
          // Show success message
          showSuccessMessage('Idea created successfully!');
          
          // Wait a bit then redirect to refresh data
          setTimeout(() => {
            window.location.href = '/ideas';
          }, 1000);
        } else {
          throw new Error('Failed to create idea');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Failed to create idea. Please try again.');
        
        // Reset button state
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
      });
    });
  }
  
  // Search functionality
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      // Placeholder for search functionality
      console.log('Searching for:', searchTerm);
    });
  }
  
  // Filter functionality
  const tagFilter = document.getElementById('tagFilter');
  const sortFilter = document.getElementById('sortFilter');
  
  if (tagFilter) {
    tagFilter.addEventListener('change', function() {
      const selectedTag = this.value;
      // Placeholder for tag filtering functionality
      console.log('Filtering by tag:', selectedTag);
    });
  }
  
  if (sortFilter) {
    sortFilter.addEventListener('change', function() {
      const sortBy = this.value;
      // Placeholder for sorting functionality
      console.log('Sorting by:', sortBy);
    });
  }
  
  // Idea action buttons
  const actionButtons = document.querySelectorAll('.action-btn');
  actionButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const action = this.getAttribute('title').toLowerCase();
      // Placeholder for idea actions
      console.log('Idea action:', action);
    });
  });
});