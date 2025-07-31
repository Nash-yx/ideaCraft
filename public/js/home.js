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
  
  // Search functionality (placeholder - to be implemented)
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      // TODO: Implement search functionality
    });
  }
  
  // Filter functionality (placeholder - to be implemented)
  const tagFilter = document.getElementById('tagFilter');
  const sortFilter = document.getElementById('sortFilter');
  
  if (tagFilter) {
    tagFilter.addEventListener('change', function() {
      const selectedTag = this.value;
      // TODO: Implement tag filtering
    });
  }
  
  if (sortFilter) {
    sortFilter.addEventListener('change', function() {
      const sortBy = this.value;
      // TODO: Implement sorting functionality
    });
  }
  
  // Edit functionality
  const editModal = document.getElementById('editIdeaModal');
  const editModalClose = editModal.querySelector('.modal-close');
  const editModalCancel = editModal.querySelector('.modal-cancel');
  const editIdeaForm = document.getElementById('editIdeaForm');
  
  // Open edit modal function
  function openEditModal() {
    editModal.classList.add('show');
    document.body.style.overflow = 'hidden'; // 防止背景滾動
    // Focus on title input
    setTimeout(() => {
      document.getElementById('editIdeaTitle').focus();
    }, 100);
  }
  
  // Close edit modal function
  function closeEditModal() {
    editModal.classList.remove('show');
    document.body.style.overflow = '';  // 恢復背景滾動
    // Reset form
    editIdeaForm.reset();
  }
  
  // Event listeners for closing edit modal
  if (editModalClose) {
    editModalClose.addEventListener('click', closeEditModal);
  }
  
  if (editModalCancel) {
    editModalCancel.addEventListener('click', closeEditModal);
  }
  
  // Close edit modal when clicking outside
  editModal.addEventListener('click', function(e) {
    if (e.target === editModal) {
      closeEditModal();
    }
  });
  
  // Edit idea buttons
  const editButtons = document.querySelectorAll('.footer-btn[title="Edit"]');
  editButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const ideaId = this.getAttribute('data-id');
      
      // Fetch idea data
      fetch(`/ideas/${ideaId}`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            const idea = data.idea;
            
            // Fill form with idea data
            document.getElementById('editIdeaId').value = idea.id;
            document.getElementById('editIdeaTitle').value = idea.title;
            document.getElementById('editIdeaContent').value = idea.content;
            document.getElementById('editIdeaPublic').checked = idea.isPublic;
            
            // Open modal
            openEditModal();
          } else {
            alert('Failed to load idea data');
          }
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Failed to load idea data');
        });
    });
  });
  
  // Handle edit form submission
  if (editIdeaForm) {
    editIdeaForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const ideaId = document.getElementById('editIdeaId').value;
      const formData = new FormData(this);
      const submitButton = this.querySelector('button[type="submit"]');
      const originalText = submitButton.innerHTML;
      
      // Convert FormData to URLSearchParams for proper encoding
      const params = new URLSearchParams();
      for (const [key, value] of formData.entries()) {
        if (key !== 'ideaId') { // Skip the ideaId from body
          params.append(key, value);
        }
      }
      
      // Show loading state
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
      
      // Submit form
      fetch(`/ideas/${ideaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: params.toString()
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          return response.json().then(data => {
            throw new Error(data.message || 'Failed to update idea');
          });
        }
      })
      .then(data => {
        if (data.success) {
          // Close modal first
          closeEditModal();
          
          // Show success message
          showSuccessMessage('Idea updated successfully!');
          
          // Wait a bit then redirect to refresh data
          setTimeout(() => {
            window.location.href = '/ideas';
          }, 1000);
        } else {
          throw new Error(data.message || 'Failed to update idea');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert(`Failed to update idea: ${error.message}`);
        
        // Reset button state
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
      });
    });
  }
  
  // Idea Preview Modal functionality
  const previewModal = document.getElementById('ideaPreviewModal');
  const previewModalClose = previewModal.querySelector('.modal-close');
  const expandBtn = document.getElementById('expandToFullPage');
  let currentPreviewIdeaId = null;

  // Open preview modal function
  function openPreviewModal(ideaData) {
    document.getElementById('previewIdeaTitle').textContent = ideaData.title;
    document.getElementById('previewIdeaContent').textContent = ideaData.content || 'No content provided.';
    document.getElementById('previewIdeaDate').textContent = formatDate(ideaData.createdAt);
    
    // Set visibility status
    const visibilityElement = document.getElementById('previewIdeaVisibility');
    if (ideaData.isPublic) {
      visibilityElement.innerHTML = '<span class="visibility-tag public"><i class="fas fa-globe"></i> Public</span>';
    } else {
      visibilityElement.innerHTML = '<span class="visibility-tag private"><i class="fas fa-lock"></i> Private</span>';
    }
    
    currentPreviewIdeaId = ideaData.id;
    previewModal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  // Close preview modal function
  function closePreviewModal() {
    previewModal.classList.remove('show');
    document.body.style.overflow = '';
    currentPreviewIdeaId = null;
  }

  // Format date helper function
  function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  }

  // Event listeners for preview modal
  if (previewModalClose) {
    previewModalClose.addEventListener('click', closePreviewModal);
  }

  // Close preview modal when clicking outside
  previewModal.addEventListener('click', function(e) {
    if (e.target === previewModal) {
      closePreviewModal();
    }
  });

  // Expand to full page functionality
  if (expandBtn) {
    expandBtn.addEventListener('click', function() {
      if (currentPreviewIdeaId) {
        window.location.href = `/ideas/${currentPreviewIdeaId}`;
      }
    });
  }

  // Quick edit functionality
  const quickEditBtn = document.getElementById('quickEditBtn');
  if (quickEditBtn) {
    quickEditBtn.addEventListener('click', function() {
      if (currentPreviewIdeaId) {
        // Close preview modal first
        closePreviewModal();
        
        // Trigger edit functionality for current idea
        const editButton = document.querySelector(`.footer-btn[title="Edit"][data-id="${currentPreviewIdeaId}"]`);
        if (editButton) {
          editButton.click();
        }
      }
    });
  }

  // Quick delete functionality
  const quickDeleteBtn = document.getElementById('quickDeleteBtn');
  if (quickDeleteBtn) {
    quickDeleteBtn.addEventListener('click', function() {
      if (currentPreviewIdeaId) {
        // Close preview modal first
        closePreviewModal();
        
        // Trigger delete functionality for current idea
        const deleteButton = document.querySelector(`.footer-btn[title="Delete"][data-id="${currentPreviewIdeaId}"]`);
        if (deleteButton) {
          deleteButton.click();
        }
      }
    });
  }

  // Idea card click functionality for preview
  const previewIdeaCards = document.querySelectorAll('.idea-card');
  previewIdeaCards.forEach(card => {
    card.addEventListener('click', function(e) {
      // Don't trigger if clicking on action buttons
      if (e.target.closest('.idea-actions') || e.target.closest('.idea-footer-actions')) {
        return;
      }
      
      const ideaId = this.getAttribute('data-id');
      
      // Fetch idea data and show preview
      fetch(`/ideas/${ideaId}`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          openPreviewModal(data.idea);
        } else {
          alert('Failed to load idea');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Failed to load idea');
      });
    });
  });

  // Keyboard shortcuts for preview modal
  document.addEventListener('keydown', function(e) {
    if (previewModal.classList.contains('show')) {
      if (e.key === 'Escape') {
        closePreviewModal();
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        // Ctrl+Enter to expand to full page
        if (currentPreviewIdeaId) {
          window.location.href = `/ideas/${currentPreviewIdeaId}`;
        }
      } else if (e.key === 'e' && (e.ctrlKey || e.metaKey)) {
        // Ctrl+E to edit
        e.preventDefault();
        if (quickEditBtn) quickEditBtn.click();
      }
    }
  });

  // Delete idea buttons
  const deleteButtons = document.querySelectorAll('.footer-btn[title="Delete"]');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
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
            // 顯示成功訊息
            showSuccessMessage('Idea deleted successfully!');
            
            // 短暫延遲後刷新頁面以更新統計數據
            setTimeout(() => {
              window.location.reload();
            }, 1000);
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
  
  // Pin action buttons (placeholder for future pin functionality)
  const actionButtons = document.querySelectorAll('.action-btn');
  actionButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const action = this.getAttribute('title').toLowerCase();
      if (action === 'pin') {
        // TODO: Implement pin functionality
        console.log('Pin functionality to be implemented');
      }
    });
  });
});