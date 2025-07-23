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
  
  // Tab switching functionality
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all tabs
      tabButtons.forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked tab
      this.classList.add('active');
    });
  });
  
  // Task card hover effects
  const taskCards = document.querySelectorAll('.task-card');
  taskCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
  
  // Create task button functionality
  const createTaskBtn = document.querySelector('.create-task-btn');
  if (createTaskBtn) {
    createTaskBtn.addEventListener('click', function() {
      // Placeholder for create task functionality
      alert('Create task functionality would be implemented here');
    });
  }
  
  // Column menu buttons
  const columnMenuBtns = document.querySelectorAll('.column-menu-btn');
  columnMenuBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      // Placeholder for column menu functionality
      console.log('Column menu clicked');
    });
  });
  
  // Add member button
  const addMemberBtn = document.querySelector('.add-member-btn');
  if (addMemberBtn) {
    addMemberBtn.addEventListener('click', function() {
      // Placeholder for add member functionality
      alert('Add member functionality would be implemented here');
    });
  }
});