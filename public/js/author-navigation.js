/**
 * Author Navigation Handler
 * Handles click events on author sections in idea cards
 */

document.addEventListener('DOMContentLoaded', function() {
  // Handle author clicks in idea cards
  const authorElements = document.querySelectorAll('.author-clickable');
  
  authorElements.forEach(element => {
    element.addEventListener('click', function(event) {
      // Prevent the parent card click from triggering
      event.preventDefault();
      event.stopPropagation();
      
      // Get the user ID from data attribute
      const userId = this.getAttribute('data-user-id');
      
      // Only navigate if userId exists and is not empty or undefined
      if (userId && userId !== '' && userId !== 'undefined' && userId !== 'null') {
        // Navigate to author page
        window.location.href = `/author/${userId}`;
      } else {
        console.warn('Invalid user ID for author navigation:', userId);
      }
    });
  });
});