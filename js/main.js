// Main JavaScript Entry Point
import { initNavigation } from './modules/navigation.js';
import { initForm } from './modules/form.js';

// Initialize all modules when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initForm();
    
    console.log('TriCity Builders website initialized');
});
