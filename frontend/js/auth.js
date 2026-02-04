// Toast Notification System
const Toast = {
    container: null,

    init() {
        // Create toast container if it doesn't exist
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    },

    show(message, type = 'info', title = '') {
        this.init();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: 'fa-check',
            error: 'fa-times',
            warning: 'fa-exclamation',
            info: 'fa-info'
        };

        const titles = {
            success: title || 'Success',
            error: title || 'Error',
            warning: title || 'Warning',
            info: title || 'Info'
        };

        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${icons[type]}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${titles[type]}</div>
                <p class="toast-message">${message}</p>
            </div>
            <button class="toast-close">&times;</button>
            <div class="toast-progress"></div>
        `;

        this.container.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Close button handler
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.hide(toast));

        // Auto hide after 3 seconds
        setTimeout(() => this.hide(toast), 3000);

        return toast;
    },

    hide(toast) {
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 400);
    },

    success(message, title) {
        return this.show(message, 'success', title);
    },

    error(message, title) {
        return this.show(message, 'error', title);
    },

    warning(message, title) {
        return this.show(message, 'warning', title);
    },

    info(message, title) {
        return this.show(message, 'info', title);
    }
};

// Success Modal
function showSuccessModal(title, message, redirectUrl) {
    // Remove existing modal if any
    const existingModal = document.querySelector('.success-overlay');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'success-overlay';
    modal.innerHTML = `
        <div class="success-modal">
            <div class="success-icon">
                <i class="fas fa-check"></i>
            </div>
            <h2>${title}</h2>
            <p>${message}</p>
            <button class="btn btn-primary" id="successContinueBtn">
                Continue to Dashboard
            </button>
        </div>
    `;

    document.body.appendChild(modal);

    // Show modal with animation
    requestAnimationFrame(() => {
        modal.classList.add('show');
    });

    // Handle continue button
    const continueBtn = modal.querySelector('#successContinueBtn');
    continueBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
            if (redirectUrl) {
                window.location.href = redirectUrl;
            }
        }, 300);
    });

    // Auto redirect after 3 seconds
    setTimeout(() => {
        if (modal.classList.contains('show')) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
                if (redirectUrl) {
                    window.location.href = redirectUrl;
                }
            }, 300);
        }
    }, 3000);
}

// Role selection
document.addEventListener('DOMContentLoaded', function() {
    const roleOptions = document.querySelectorAll('.role-option');
    const roleInput = document.getElementById('role');
    const licenseGroup = document.getElementById('licenseGroup');

    if (roleOptions.length > 0) {
        roleOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Remove selected class from all options
                roleOptions.forEach(opt => opt.classList.remove('selected'));

                // Add selected class to clicked option
                this.classList.add('selected');

                // Update hidden input value
                const role = this.getAttribute('data-role');
                roleInput.value = role;

                // Show/hide license field for doctors
                if (licenseGroup) {
                    if (role === 'doctor') {
                        licenseGroup.style.display = 'block';
                        licenseGroup.querySelector('input').setAttribute('required', '');
                    } else {
                        licenseGroup.style.display = 'none';
                        licenseGroup.querySelector('input').removeAttribute('required');
                    }
                }

                // Update form labels based on role
                updateFormForRole(role);
            });
        });

        // Select first option by default
        if (roleOptions.length > 0 && !roleInput.value) {
            roleOptions[0].click();
        }
    }

    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            let isValid = true;
            const inputs = form.querySelectorAll('input[required]');

            inputs.forEach(input => {
                const errorElement = input.parentElement.querySelector('.error-message');

                if (!input.value.trim()) {
                    showError(input, 'This field is required', errorElement);
                    isValid = false;
                } else if (input.type === 'email' && !isValidEmail(input.value)) {
                    showError(input, 'Please enter a valid email address', errorElement);
                    isValid = false;
                } else if (input.type === 'password' && input.value.length < 6) {
                    showError(input, 'Password must be at least 6 characters', errorElement);
                    isValid = false;
                } else if (input.id === 'confirmPassword') {
                    const password = form.querySelector('#password');
                    if (password && input.value !== password.value) {
                        showError(input, 'Passwords do not match', errorElement);
                        isValid = false;
                    } else {
                        clearError(input, errorElement);
                    }
                } else if (input.id === 'nida' && input.value.length < 15) {
                    showError(input, 'NIDA number must be at least 15 digits', errorElement);
                    isValid = false;
                } else {
                    clearError(input, errorElement);
                }
            });

            if (isValid) {
                simulateFormSubmission(form);
            } else {
                Toast.error('Please fix the errors in the form', 'Validation Error');
            }
        });
    });

    // Real-time validation for inputs
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            const errorElement = this.parentElement.querySelector('.error-message');

            if (!this.value.trim() && this.hasAttribute('required')) {
                showError(this, 'This field is required', errorElement);
            } else if (this.type === 'email' && this.value && !isValidEmail(this.value)) {
                showError(this, 'Please enter a valid email address', errorElement);
            } else if (this.type === 'password' && this.value && this.value.length < 6) {
                showError(this, 'Password must be at least 6 characters', errorElement);
            } else {
                clearError(this, errorElement);
            }
        });

        // Clear error on input
        input.addEventListener('input', function() {
            const errorElement = this.parentElement.querySelector('.error-message');
            clearError(this, errorElement);
        });
    });
});

function updateFormForRole(role) {
    // Update form labels based on selected role
    const nidaLabel = document.querySelector('label[for="nida"]');
    const licenseLabel = document.querySelector('label[for="license"]');

    if (nidaLabel && role === 'patient') {
        nidaLabel.innerHTML = 'NIDA Number <span class="required">*</span>';
    } else if (licenseLabel && role === 'doctor') {
        licenseLabel.innerHTML = 'Medical License Number <span class="required">*</span>';
    }
}

function showError(input, message, errorElement) {
    input.classList.add('error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

function clearError(input, errorElement) {
    input.classList.remove('error');
    if (errorElement) {
        errorElement.classList.remove('show');
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

async function simulateFormSubmission(form) {
  const submitBtn = form.querySelector('button[type="submit"]');
  const btnText = submitBtn.querySelector('.btn-text') || submitBtn;
  const originalHTML = submitBtn.innerHTML;

  // Show loading state
  submitBtn.classList.add('btn-loading');
  submitBtn.innerHTML = `<span class="btn-text">${originalHTML}</span>`;
  submitBtn.disabled = true;

  try {
    // Get form data
    const formData = new FormData(form);
    const userData = Object.fromEntries(formData);
    
    // Add wallet address if connected
    if (window.afyaChainBlockchain && window.afyaChainBlockchain.userAddress) {
      userData.walletAddress = window.afyaChainBlockchain.userAddress;
    }
    
    // Determine endpoint based on form type
    let endpoint, successMessage, redirectUrl;
    const role = userData.role || 'patient';
    
    if (form.id === 'registerForm') {
      endpoint = 'http://localhost:5000/api/patients/register';
      successMessage = 'Registration Successful!';
      redirectUrl = role === 'admin' ? 'admin-dashboard.html' : 
                    role === 'doctor' ? 'doctor-dashboard.html' : 
                    'patient-dashboard.html';
    } else if (form.id === 'loginForm') {
      endpoint = 'http://localhost:5000/api/auth/login';
      successMessage = 'Welcome Back!';
      redirectUrl = role === 'admin' ? 'admin-dashboard.html' : 
                    role === 'doctor' ? 'doctor-dashboard.html' : 
                    'patient-dashboard.html';
    }
    
    // Make API call to backend
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    const result = await response.json();
    
    // Reset button
    submitBtn.classList.remove('btn-loading');
    submitBtn.innerHTML = originalHTML;
    submitBtn.disabled = false;
    
    if (result.success) {
      // Show success modal with blockchain transaction info
      showSuccessModal(
        successMessage,
        form.id === 'registerForm' 
          ? `Your account has been created${result.transactionHash ? ' and recorded on blockchain' : ''}.`
          : `You have successfully logged in.`,
        redirectUrl
      );
    } else {
      // Show error
      Toast.error(result.error || 'Operation failed', 'Error');
    }
    
  } catch (error) {
    console.error('Submission error:', error);
    
    // Reset button
    submitBtn.classList.remove('btn-loading');
    submitBtn.innerHTML = originalHTML;
    submitBtn.disabled = false;
    
    Toast.error('Network error. Please try again.', 'Error');
  }
}
