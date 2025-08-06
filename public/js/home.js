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
      // Dark mode colors (authentic shadcn/ui warmer tones)
      root.style.setProperty('--bg-primary', '#1f1f1f');        // Card backgrounds (warmer gray for authenticity)
      root.style.setProperty('--bg-secondary', '#0a0a0a');      // Body background (deepest)
      root.style.setProperty('--bg-tertiary', '#111111');      // Main content areas (warmer middle layer)
      root.style.setProperty('--neutral-50', '#262626');       // Dark surfaces (warmer)
      root.style.setProperty('--neutral-100', '#2d2d2d');      // Slightly lighter surfaces  
      root.style.setProperty('--neutral-200', '#3f3f3f');      // Borders and dividers (warmer)
      root.style.setProperty('--neutral-300', '#525252');      // Disabled elements
      root.style.setProperty('--neutral-400', '#6b6b6b');      // Placeholder text (shadcn/ui authentic)
      root.style.setProperty('--neutral-500', '#909090');      // Secondary text (better contrast)
      root.style.setProperty('--neutral-600', '#d1d1d1');      // Primary text (refined)
      root.style.setProperty('--neutral-700', '#e4e4e4');      // Primary text (medium)
      root.style.setProperty('--neutral-800', '#f4f4f4');      // Primary text (bright)
      root.style.setProperty('--neutral-900', '#ffffff');      // Pure white for maximum contrast
      
      // Additional shadcn/ui inspired variables
      root.style.setProperty('--primary-500', '#3b82f6');      // Primary blue
      root.style.setProperty('--primary-600', '#2563eb');      // Darker primary blue
      
      // Blue and red color palette for dark mode
      root.style.setProperty('--blue-50', '#1e3a8a');          // Dark blue background for hover
      root.style.setProperty('--blue-500', '#3b82f6');         // Primary blue
      root.style.setProperty('--blue-600', '#2563eb');         // Darker blue
      root.style.setProperty('--blue-700', '#1d4ed8');         // Even darker blue
      root.style.setProperty('--red-50', '#7f1d1d');           // Dark red background for hover
      root.style.setProperty('--red-600', '#dc2626');          // Primary red
      
      // Dark mode card-specific variables (refined shadcn/ui style)
      root.style.setProperty('--card-border-dark', 'rgba(255, 255, 255, 0.04)');  // More subtle borders
      root.style.setProperty('--card-shadow-dark', '0 2px 8px rgba(0, 0, 0, 0.25)');  // Refined shadows
      root.style.setProperty('--card-hover-bg', '#252525');     // Warmer hover background
      root.style.setProperty('--card-hover-shadow', '0 4px 16px rgba(0, 0, 0, 0.35)');  // Elegant hover shadow
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
      
      // Additional variables for light mode
      root.style.setProperty('--primary-500', '#3b82f6');      // Primary blue
      root.style.setProperty('--primary-600', '#2563eb');      // Darker primary blue
      
      // Blue and red color palette for light mode (reset to defaults)
      root.style.setProperty('--blue-50', '#EFF6FF');          // Light blue background for hover
      root.style.setProperty('--blue-500', '#3B82F6');         // Primary blue
      root.style.setProperty('--blue-600', '#2563EB');         // Darker blue
      root.style.setProperty('--blue-700', '#1D4ED8');         // Even darker blue
      root.style.setProperty('--red-50', '#FEF2F2');           // Light red background for hover
      root.style.setProperty('--red-600', '#DC2626');          // Primary red
    }
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
  
  
  
  // Edit functionality - navigate to edit page
  const editButtons = document.querySelectorAll('.edit-item');
  editButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Close dropdown menu first
      const dropdown = this.closest('.idea-dropdown-menu');
      if (dropdown) {
        dropdown.classList.remove('show');
      }
      
      const ideaId = this.getAttribute('data-id');
      
      // Navigate to edit page
      window.location.href = `/ideas/${ideaId}/edit`;
    });
  });
  




  // Delete idea buttons
  const deleteButtons = document.querySelectorAll('.delete-item');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Close dropdown menu first
      const dropdown = this.closest('.idea-dropdown-menu');
      if (dropdown) {
        dropdown.classList.remove('show');
      }
      
      const ideaId = this.getAttribute('data-id');
      const ideaCard = this.closest('.idea-card');
      const ideaTitle = ideaCard.querySelector('.idea-title').textContent;
      
      // 確認對話框
      const confirmed = confirm(`Are you sure you want to delete "${ideaTitle}"?\n\nThis action cannot be undone.`);
      
      if (confirmed) {
        // 顯示loading狀態
        this.disabled = true;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        // 發送刪除請求
        fetch(`/ideas/${ideaId}`, {
          method: 'DELETE',
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        })
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            return response.json().then(data => {
              throw new Error(data.message || 'Failed to delete idea');
            });
          }
        })
        .then(data => {
          if (data.success) {
            // 直接重定向到 /ideas 頁面，讓後端 flash message 處理成功訊息
            window.location.href = '/ideas';
          } else {
            throw new Error(data.message || 'Failed to delete idea');
          }
        })
        .catch(error => {
          console.error('Error:', error);
          alert(`Failed to delete idea: ${error.message}`);
          
          // 重置按鈕狀態
          this.disabled = false;
          this.innerHTML = '<i class="fas fa-trash"></i>';
        });
      }
    });
  });
  
  // Dropdown menu functionality
  const menuButtons = document.querySelectorAll('.idea-menu-btn');
  const dropdownMenus = document.querySelectorAll('.idea-dropdown-menu');
  
  // Toggle dropdown menu
  menuButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault(); // Prevent default link navigation
      e.stopPropagation();
      const ideaId = this.getAttribute('data-id');
      const dropdown = document.querySelector(`.idea-dropdown-menu[data-id="${ideaId}"]`);
      
      // Close all other dropdowns first
      dropdownMenus.forEach(menu => {
        if (menu !== dropdown) {
          menu.classList.remove('show');
        }
      });
      
      // Toggle current dropdown
      dropdown.classList.toggle('show');
    });
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.idea-menu-wrapper')) {
      dropdownMenus.forEach(menu => {
        menu.classList.remove('show');
      });
    }
  });
  
  // Close dropdown on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      dropdownMenus.forEach(menu => {
        menu.classList.remove('show');
      });
    }
  });
});