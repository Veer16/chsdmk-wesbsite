// Form Module
export function initForm() {
    const form = document.getElementById('quoteForm');
    const messageField = document.getElementById('message');
    const charCount = document.getElementById('charCount');
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const submitLoader = document.getElementById('submitLoader');
    
    // Character counter for message field
    if (messageField && charCount) {
        messageField.addEventListener('input', () => {
            charCount.textContent = messageField.value.length;
        });
    }
    
    // Form validation and submission
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Clear previous errors
            clearErrors();
            
            // Get form data
            const formData = {
                firstName: document.getElementById('firstName').value.trim(),
                lastName: document.getElementById('lastName').value.trim() || undefined,
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim() || undefined,
                service: document.getElementById('service').value || undefined,
                message: document.getElementById('message').value.trim() || undefined
            };
            
            // Validate form
            const errors = validateForm(formData);
            
            if (Object.keys(errors).length > 0) {
                displayErrors(errors);
                return;
            }
            
            // Remove undefined values
            Object.keys(formData).forEach(key => {
                if (formData[key] === undefined) {
                    delete formData[key];
                }
            });
            
            // Submit form
            try {
                submitBtn.disabled = true;
                submitText.classList.add('hidden');
                submitLoader.classList.remove('hidden');
                
                const response = await fetch('/api/quotes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to submit quote request');
                }
                
                // Success
                showToast('Quote request submitted! We\'ll get back to you within 24 hours.', 'success');
                form.reset();
                charCount.textContent = '0';
                
            } catch (error) {
                showToast('Error submitting quote request. Please try again.', 'error');
                console.error('Form submission error:', error);
            } finally {
                submitBtn.disabled = false;
                submitText.classList.remove('hidden');
                submitLoader.classList.add('hidden');
            }
        });
    }
}

// Validate form data (matching Zod schema from shared/schema.ts exactly)
function validateForm(data) {
    const errors = {};
    
    // Trim all string inputs
    if (typeof data.firstName === 'string') data.firstName = data.firstName.trim();
    if (typeof data.lastName === 'string') data.lastName = data.lastName.trim();
    if (typeof data.email === 'string') data.email = data.email.trim();
    if (typeof data.phone === 'string') data.phone = data.phone.trim();
    if (typeof data.service === 'string') data.service = data.service.trim();
    if (typeof data.message === 'string') data.message = data.message.trim();
    
    // First name is required with minimum length of 1
    if (!data.firstName || data.firstName.length === 0) {
        errors.firstName = 'First name is required';
    }
    
    // Email is required and must be valid
    if (!data.email || data.email.length === 0) {
        errors.email = 'Email address is required';
    } else if (!isValidEmail(data.email)) {
        errors.email = 'Please enter a valid email address';
    }
    
    // Phone is optional (no validation - server accepts any string)
    // Service is optional (no validation - server accepts any string)
    
    // Message is optional but must be <= 500 characters if provided
    if (data.message && data.message.length > 500) {
        errors.message = 'Message must be 500 characters or less';
    }
    
    return errors;
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Display validation errors
function displayErrors(errors) {
    Object.keys(errors).forEach(field => {
        const errorElement = document.getElementById(`${field}Error`);
        const inputElement = document.getElementById(field);
        
        if (errorElement && inputElement) {
            errorElement.textContent = errors[field];
            errorElement.classList.add('show');
            inputElement.classList.add('error');
        }
    });
}

// Clear all errors
function clearErrors() {
    const errorElements = document.querySelectorAll('.form-error');
    const inputElements = document.querySelectorAll('.form-input, .form-select, .form-textarea');
    
    errorElements.forEach(el => {
        el.textContent = '';
        el.classList.remove('show');
    });
    
    inputElements.forEach(el => {
        el.classList.remove('error');
    });
}

// Toast timer reference
let toastTimer = null;

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastContent = document.getElementById('toastContent');
    
    if (toast && toastContent) {
        // Clear any existing timer
        if (toastTimer) {
            clearTimeout(toastTimer);
            toastTimer = null;
        }
        
        // Hide immediately if showing, wait for transition to complete
        if (!toast.classList.contains('hidden')) {
            toast.classList.add('hidden');
            // Wait for transition to complete before showing new toast
            toast.addEventListener('transitionend', function showNewToast() {
                toast.removeEventListener('transitionend', showNewToast);
                displayToast();
            }, { once: true });
        } else {
            displayToast();
        }
        
        function displayToast() {
            // Update content and styling
            toastContent.textContent = message;
            toast.className = `toast ${type}`;
            toast.classList.remove('hidden');
            
            // Schedule auto-hide
            toastTimer = setTimeout(() => {
                toast.classList.add('hidden');
                toastTimer = null;
            }, 5000);
        }
    }
}
