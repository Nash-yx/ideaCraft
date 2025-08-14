// Tag Management System
class TagManager {
  constructor() {
    this.tags = [];
    this.maxTags = 3;
    this.tagColors = ['tag-blue', 'tag-orange', 'tag-green', 'tag-purple', 'tag-pink'];
    
    // DOM elements
    this.selectedTagsContainer = document.getElementById('selectedTags');
    this.addTagBtn = document.getElementById('addTagBtn');
    this.tagsInput = document.getElementById('tagsInput');
    
    if (!this.selectedTagsContainer || !this.addTagBtn || !this.tagsInput) {
      console.warn('TagManager: Required DOM elements not found');
      return;
    }
    
    this.initializeExistingTags();
    this.bindEvents();
  }
  
  initializeExistingTags() {
    // Load existing tags from DOM
    const existingTags = this.selectedTagsContainer.querySelectorAll('.tag-badge');
    existingTags.forEach(tagElement => {
      const tagName = tagElement.dataset.tag;
      if (tagName && !this.tags.includes(tagName)) {
        this.tags.push(tagName);
      }
    });
    
    this.updateHiddenInput();
    this.updateAddButtonVisibility();
  }
  
  bindEvents() {
    // Add tag button click
    this.addTagBtn.addEventListener('click', () => {
      this.showTagInput();
    });
    
    // Remove tag click (event delegation)
    this.selectedTagsContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-tag')) {
        const tagName = e.target.dataset.tag;
        this.removeTag(tagName);
      }
    });
  }
  
  showTagInput() {
    const tagName = prompt('Enter a tag name (max 25 characters):');
    if (tagName) {
      this.addTag(tagName.trim());
    }
  }
  
  addTag(tagName) {
    // Validate tag name
    if (!this.validateTagName(tagName)) {
      alert('Invalid tag name. Please use only letters, numbers, spaces, and hyphens. Maximum length is 25 characters.');
      return;
    }
    
    // Check if already exists
    if (this.tags.includes(tagName)) {
      alert('This tag already exists.');
      return;
    }
    
    // Check tag limit
    if (this.tags.length >= this.maxTags) {
      alert(`You can only add up to ${this.maxTags} tags.`);
      return;
    }
    
    // Add tag to array
    this.tags.push(tagName);
    
    // Create and append tag element
    this.createTagElement(tagName);
    
    // Update form data
    this.updateHiddenInput();
    this.updateAddButtonVisibility();
  }
  
  removeTag(tagName) {
    // Remove from array
    const index = this.tags.indexOf(tagName);
    if (index > -1) {
      this.tags.splice(index, 1);
    }
    
    // Remove from DOM
    const tagElement = this.selectedTagsContainer.querySelector(`[data-tag="${tagName}"]`);
    if (tagElement) {
      tagElement.remove();
    }
    
    // Update form data
    this.updateHiddenInput();
    this.updateAddButtonVisibility();
  }
  
  createTagElement(tagName) {
    const tagElement = document.createElement('span');
    const tagIndex = this.tags.indexOf(tagName);
    tagElement.className = `tag-badge ${this.getTagColor(tagIndex)}`;
    tagElement.dataset.tag = tagName;
    tagElement.innerHTML = `
      ${tagName}
      <span class="remove-tag" data-action="remove" data-tag="${tagName}">&times;</span>
    `;
    
    this.selectedTagsContainer.appendChild(tagElement);
  }
  
  getTagColor(index = 0) {
    // Cycle through available colors based on tag index (same as backend)
    return this.tagColors[index % this.tagColors.length];
  }
  
  validateTagName(tagName) {
    // Allow letters, numbers, spaces, and hyphens
    // Length between 1-25 characters for better display
    const regex = /^[a-zA-Z0-9\s\-]{1,25}$/;
    return regex.test(tagName);
  }
  
  updateHiddenInput() {
    // Convert tags array to JSON for form submission
    this.tagsInput.value = JSON.stringify(this.tags);
  }
  
  updateAddButtonVisibility() {
    if (this.tags.length >= this.maxTags) {
      this.addTagBtn.classList.add('hidden');
    } else {
      this.addTagBtn.classList.remove('hidden');
    }
  }
  
  // Public method to get current tags (for testing)
  getTags() {
    return [...this.tags];
  }
  
  // Public method to clear all tags (for testing)
  clearTags() {
    this.tags = [];
    this.selectedTagsContainer.innerHTML = '';
    this.updateHiddenInput();
    this.updateAddButtonVisibility();
  }
}

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
  
  // Initialize TagManager
  const tagManager = new TagManager();

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