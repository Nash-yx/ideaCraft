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
  
  // Create idea button functionality
  const createIdeaBtn = document.querySelector('.create-idea-btn');
  if (createIdeaBtn) {
    createIdeaBtn.addEventListener('click', function() {
      // Placeholder for create idea functionality
      alert('Create idea functionality would be implemented here');
    });
  }
  
  // Empty state button functionality
  const emptyStateBtn = document.querySelector('.empty-state-btn');
  if (emptyStateBtn) {
    emptyStateBtn.addEventListener('click', function() {
      // Placeholder for create first idea functionality
      alert('Create your first idea functionality would be implemented here');
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