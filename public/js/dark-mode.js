// Universal dark mode functionality for all pages
document.addEventListener('DOMContentLoaded', function() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  
  if (!darkModeToggle) return; // Exit if toggle doesn't exist on this page
  
  const body = document.body;
  const root = document.documentElement;
  
  // Check for saved dark mode preference and sync toggle state
  const savedDarkMode = localStorage.getItem('darkMode');
  if (savedDarkMode === 'enabled') {
    // Dark mode is already applied by the inline script, just sync toggle state
    darkModeToggle.checked = true;
    // Ensure CSS variables are consistent
    updateCSSVariables(true);
  } else {
    // Ensure light mode variables are applied
    updateCSSVariables(false);
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
    root.classList.add('dark-mode');
    updateCSSVariables(true);
  }
  
  function disableDarkMode() {
    body.classList.remove('dark-mode');
    root.classList.remove('dark-mode');
    updateCSSVariables(false);
  }
  
  function updateCSSVariables(isDark) {
    if (isDark) {
      // Dark mode colors (authentic shadcn/ui warmer tones)
      root.style.setProperty('--bg-primary', '#1f1f1f');        
      root.style.setProperty('--bg-secondary', '#0a0a0a');      
      root.style.setProperty('--bg-tertiary', '#111111');      
      root.style.setProperty('--neutral-50', '#262626');       
      root.style.setProperty('--neutral-100', '#2d2d2d');      
      root.style.setProperty('--neutral-200', '#3f3f3f');      
      root.style.setProperty('--neutral-300', '#525252');      
      root.style.setProperty('--neutral-400', '#6b6b6b');      
      root.style.setProperty('--neutral-500', '#909090');      
      root.style.setProperty('--neutral-600', '#d1d1d1');      
      root.style.setProperty('--neutral-700', '#e4e4e4');      
      root.style.setProperty('--neutral-800', '#f4f4f4');      
      root.style.setProperty('--neutral-900', '#ffffff');      
      
      // Additional shadcn/ui inspired variables
      root.style.setProperty('--primary-500', '#3b82f6');      
      root.style.setProperty('--primary-600', '#2563eb');      
      
      // Blue and red color palette for dark mode
      root.style.setProperty('--blue-50', '#1e3a8a');          
      root.style.setProperty('--blue-500', '#3b82f6');         
      root.style.setProperty('--blue-600', '#2563eb');         
      root.style.setProperty('--blue-700', '#1d4ed8');         
      root.style.setProperty('--red-50', '#7f1d1d');           
      root.style.setProperty('--red-600', '#dc2626');          
      
      // Dark mode card-specific variables
      root.style.setProperty('--card-border-dark', 'rgba(255, 255, 255, 0.04)');  
      root.style.setProperty('--card-shadow-dark', '0 2px 8px rgba(0, 0, 0, 0.25)');  
      root.style.setProperty('--card-hover-bg', '#252525');     
      root.style.setProperty('--card-hover-shadow', '0 4px 16px rgba(0, 0, 0, 0.35)');  
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
      root.style.setProperty('--primary-500', '#3b82f6');      
      root.style.setProperty('--primary-600', '#2563eb');      
      
      // Blue and red color palette for light mode (reset to defaults)
      root.style.setProperty('--blue-50', '#EFF6FF');          
      root.style.setProperty('--blue-500', '#3B82F6');         
      root.style.setProperty('--blue-600', '#2563EB');         
      root.style.setProperty('--blue-700', '#1D4ED8');         
      root.style.setProperty('--red-50', '#FEF2F2');           
      root.style.setProperty('--red-600', '#DC2626');          
    }
  }
});