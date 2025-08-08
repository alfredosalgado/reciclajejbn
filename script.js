// Mobile Navigation
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Header background on scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
});

// Form submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        
        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;
        
        // Submit form
        fetch('contact.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('¡Mensaje enviado correctamente! Nos pondremos en contacto contigo pronto.', 'success');
                this.reset();
            } else {
                showNotification('Error al enviar el mensaje. Por favor, inténtalo de nuevo.', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error al enviar el mensaje. Por favor, inténtalo de nuevo.', 'error');
        })
        .finally(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    });
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
        border-radius: 8px;
        padding: 15px 20px;
        max-width: 400px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    notification.querySelector('.notification-content').style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
    `;
    
    notification.querySelector('.notification-close').style.cssText = `
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: inherit;
        padding: 0;
        line-height: 1;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('loaded');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.proceso-card, .servicio-card, .precio-category, .nosotros-content, .contacto-content');
    animatedElements.forEach(el => {
        el.classList.add('loading');
        observer.observe(el);
    });
});

// WhatsApp button click tracking
document.querySelector('.whatsapp-float a').addEventListener('click', () => {
    // You can add analytics tracking here
    console.log('WhatsApp button clicked');
});

// Price table hover effects
document.querySelectorAll('.precio-row').forEach(row => {
    row.addEventListener('mouseenter', function() {
        this.style.backgroundColor = 'rgba(45, 90, 39, 0.05)';
        this.style.transform = 'translateX(5px)';
    });
    
    row.addEventListener('mouseleave', function() {
        this.style.backgroundColor = 'transparent';
        this.style.transform = 'translateX(0)';
    });
});

// Form validation
function validateForm() {
    const requiredFields = document.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#dc3545';
            isValid = false;
        } else {
            field.style.borderColor = '#28a745';
        }
    });
    
    // Email validation
    const emailField = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailField.value && !emailRegex.test(emailField.value)) {
        emailField.style.borderColor = '#dc3545';
        isValid = false;
    }
    
    // Phone validation (Chilean format)
    const phoneField = document.getElementById('telefono');
    const phoneRegex = /^(\+56|56)?[0-9]{8,9}$/;
    if (phoneField.value && !phoneRegex.test(phoneField.value.replace(/\s/g, ''))) {
        phoneField.style.borderColor = '#dc3545';
        isValid = false;
    }
    
    return isValid;
}

// Real-time form validation
document.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('blur', validateForm);
    field.addEventListener('input', function() {
        if (this.style.borderColor === 'rgb(220, 53, 69)') {
            validateForm();
        }
    });
});

// Lazy loading for images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Back to top button
const backToTopButton = document.createElement('button');
backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
backToTopButton.className = 'back-to-top';
backToTopButton.style.cssText = `
    position: fixed;
    bottom: 100px;
    right: 30px;
    width: 50px;
    height: 50px;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 999;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

document.body.appendChild(backToTopButton);

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTopButton.style.opacity = '1';
        backToTopButton.style.visibility = 'visible';
    } else {
        backToTopButton.style.opacity = '0';
        backToTopButton.style.visibility = 'hidden';
    }
});

backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debounce to scroll events
const debouncedScrollHandler = debounce(() => {
    // Scroll-based animations or effects can go here
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// Gallery Carousel Functionality
let currentSlideIndex = 0;
const totalSlides = 30; // Total number of images

// Function to get current slides to show based on screen size
function getSlidesToShow() {
    if (window.innerWidth <= 480) {
        return 1; // Mobile: 1 image
    } else if (window.innerWidth <= 768) {
        return 2; // Tablet: 2 images
    } else if (window.innerWidth <= 1024) {
        return 4; // Small desktop: 4 images
    } else {
        return 5; // Large desktop: 5 images
    }
}

// Function to get max slide index based on current screen size
function getMaxSlideIndex() {
    const slidesToShow = getSlidesToShow();
    return Math.ceil(totalSlides / slidesToShow) - 1;
}

function moveCarousel(direction) {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    
    const maxSlideIndex = getMaxSlideIndex();
    currentSlideIndex += direction;
    
    // Loop around if we go past the boundaries
    if (currentSlideIndex > maxSlideIndex) {
        currentSlideIndex = 0;
    } else if (currentSlideIndex < 0) {
        currentSlideIndex = maxSlideIndex;
    }
    
    const translateX = -(currentSlideIndex * 100);
    track.style.transform = `translateX(${translateX}%)`;
    
    updateIndicators();
}

function currentSlide(slideIndex) {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    
    const maxSlideIndex = getMaxSlideIndex();
    currentSlideIndex = Math.min(slideIndex - 1, maxSlideIndex);
    const translateX = -(currentSlideIndex * 100);
    track.style.transform = `translateX(${translateX}%)`;
    
    updateIndicators();
}

function updateIndicators() {
    const indicatorsContainer = document.querySelector('.carousel-indicators');
    if (!indicatorsContainer) return;
    
    const maxSlideIndex = getMaxSlideIndex();
    const totalIndicators = maxSlideIndex + 1;
    
    // Clear existing indicators
    indicatorsContainer.innerHTML = '';
    
    // Create new indicators based on current screen size
    for (let i = 0; i < totalIndicators; i++) {
        const indicator = document.createElement('span');
        indicator.className = `indicator ${i === currentSlideIndex ? 'active' : ''}`;
        indicator.onclick = () => currentSlide(i + 1);
        indicatorsContainer.appendChild(indicator);
    }
}

// Auto-play carousel
let autoPlayInterval;

function startAutoPlay() {
    autoPlayInterval = setInterval(() => {
        moveCarousel(1);
    }, 4000); // Change slide every 4 seconds
}

function stopAutoPlay() {
    clearInterval(autoPlayInterval);
}

// Modal functionality
function openModal(imageSrc) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    
    if (modal && modalImage) {
        modalImage.src = imageSrc;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

function closeModal() {
    const modal = document.getElementById('imageModal');
    
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    }
}

// Close modal when clicking outside the image
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('imageModal');
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    // Start carousel auto-play when page loads
    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
        startAutoPlay();
        
        // Pause auto-play on hover
        carouselContainer.addEventListener('mouseenter', stopAutoPlay);
        carouselContainer.addEventListener('mouseleave', startAutoPlay);
    }
    
    // Touch/swipe support for mobile
    let startX = 0;
    let endX = 0;
    
    if (carouselContainer) {
        carouselContainer.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
        });
        
        carouselContainer.addEventListener('touchend', function(e) {
            endX = e.changedTouches[0].clientX;
            handleSwipe();
        });
    }
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next slide
                moveCarousel(1);
            } else {
                // Swipe right - previous slide
                moveCarousel(-1);
            }
        }
    }
    
    // Handle window resize to update carousel responsively
    window.addEventListener('resize', function() {
        // Reset to first slide when screen size changes
        currentSlideIndex = 0;
        const track = document.getElementById('carouselTrack');
        if (track) {
            track.style.transform = 'translateX(0%)';
        }
        // Update indicators for new screen size
        updateIndicators();
    });
    
    // Initialize indicators on page load
    updateIndicators();
});

