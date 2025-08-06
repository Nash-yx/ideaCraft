// Home page functionality
document.addEventListener('DOMContentLoaded', function() {
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