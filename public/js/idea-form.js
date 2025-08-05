// Shared functionality for idea edit and create forms
document.addEventListener('DOMContentLoaded', function() {
  // Toggle switch functionality
  const toggleSwitch = document.getElementById('visibilityToggle');
  const hiddenInput = document.getElementById('isPublic');
  const privateLabel = document.querySelector('.private-label');
  const publicLabel = document.querySelector('.public-label');
  const privateHint = document.querySelector('.private-hint');
  const publicHint = document.querySelector('.public-hint');
  
  if (toggleSwitch) {
    toggleSwitch.addEventListener('click', function() {
      const isActive = this.classList.contains('active');
      
      if (isActive) {
        // Switch to private
        this.classList.remove('active');
        hiddenInput.value = 'false';
        privateLabel.classList.add('active');
        publicLabel.classList.remove('active');
        privateHint.classList.add('active');
        publicHint.classList.remove('active');
      } else {
        // Switch to public
        this.classList.add('active');
        hiddenInput.value = 'true';
        privateLabel.classList.remove('active');
        publicLabel.classList.add('active');
        privateHint.classList.remove('active');
        publicHint.classList.add('active');
      }
    });
  }
  
  // Generic form submission handling
  // Auto-detect form type by checking for common form patterns
  const editForm = document.getElementById('editIdeaForm');
  const createForm = document.getElementById('createIdeaForm');
  const form = editForm || createForm;
  
  if (form) {
    form.addEventListener('submit', function(e) {
      const submitButton = this.querySelector('button[type="submit"]');
      const originalText = submitButton.innerHTML;
      
      // Determine loading text based on form type
      const isEditForm = form.id === 'editIdeaForm';
      const loadingText = isEditForm 
        ? '<i class="fas fa-spinner fa-spin"></i> Updating...'
        : '<i class="fas fa-spinner fa-spin"></i> Creating...';
      
      submitButton.disabled = true;
      submitButton.innerHTML = loadingText;
      
      // Form will submit normally, so we don't prevent default
      // The disabled state and loading text provide user feedback
    });
  }
});