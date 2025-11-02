// ===== CONFIGURATION GLOBALE =====
const CONFIG = {
    animationDuration: 300,
    scrollOffset: 80,
    sliderAutoplayDelay: 5000,
    cartItems: [],
    isMenuOpen: false
};

// ===== ÉTAT GLOBAL =====
let currentSlide = 0;
let isScrolling = false;
let cartCount = 0;

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    initializeAnimations();
    initializeSlider();
    initializeScrollEffects();
    initializeCart();
    initializeFloatingElements();
    setupFormValidation();
    
    // Animation d'entrée
    document.body.classList.add('fade-in');
    
    console.log('🎉 I.T.I Shop initialized successfully!');
}

// ===== GESTION DU MENU MOBILE =====
function setupEventListeners() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    // Toggle menu mobile
    hamburger?.addEventListener('click', () => {
        toggleMobileMenu();
    });
    
    // Fermer le menu en cliquant sur un lien
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (CONFIG.isMenuOpen) {
                toggleMobileMenu();
            }
        });
    });
    
    // Fermer le menu en cliquant en dehors
    document.addEventListener('click', (e) => {
        if (CONFIG.isMenuOpen && !e.target.closest('.navbar')) {
            toggleMobileMenu();
        }
    });
    
    // Scroll du header
    window.addEventListener('scroll', handleHeaderScroll);
    
    // Boutons CTA
    setupCTAButtons();
    
    // Cartes catégories
    setupCategoryCards();
    
    // Boutons produits
    setupProductButtons();
    
    // Newsletter
    setupNewsletterForm();
    
    // FAB (Floating Action Button)
    setupFAB();
    
    // Recherche
    setupSearch();
}

function toggleMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    CONFIG.isMenuOpen = !CONFIG.isMenuOpen;
    
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    // Animation des barres du hamburger
    const spans = hamburger.querySelectorAll('span');
    if (CONFIG.isMenuOpen) {
        spans[0].style.transform = 'translateY(7px) rotate(45deg)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
        
        // Styles du menu ouvert
        navMenu.style.display = 'flex';
        navMenu.style.flexDirection = 'column';
        navMenu.style.position = 'absolute';
        navMenu.style.top = '100%';
        navMenu.style.left = '0';
        navMenu.style.right = '0';
        navMenu.style.background = 'white';
        navMenu.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
        navMenu.style.padding = '20px';
        navMenu.style.gap = '15px';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
        
        navMenu.style.display = window.innerWidth > 768 ? 'flex' : 'none';
        navMenu.style.position = 'static';
        navMenu.style.flexDirection = 'row';
        navMenu.style.background = 'none';
        navMenu.style.boxShadow = 'none';
        navMenu.style.padding = '0';
        navMenu.style.gap = '2rem';
    }
}

// ===== GESTION DU HEADER AU SCROLL =====
function handleHeaderScroll() {
    if (isScrolling) return;
    
    isScrolling = true;
    requestAnimationFrame(() => {
        const header = document.querySelector('.header');
        const scrollY = window.scrollY;
        
        if (scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
            header.style.borderBottom = '1px solid rgba(0,0,0,0.1)';
        } else {
            header.style.background = 'white';
            header.style.backdropFilter = 'none';
            header.style.borderBottom = 'none';
        }
        
        isScrolling = false;
    });
}

// ===== SLIDER DE PRODUITS =====
function initializeSlider() {
    const slider = document.querySelector('.products-slider');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const productCards = document.querySelectorAll('.product-card');
    
    if (!slider || productCards.length === 0) return;
    
    let totalSlides = productCards.length;
    let slidesToShow = getSlidesToShow();
    
    // Événements des boutons
    prevBtn?.addEventListener('click', () => {
        currentSlide = Math.max(0, currentSlide - 1);
        updateSlider();
    });
    
    nextBtn?.addEventListener('click', () => {
        currentSlide = Math.min(totalSlides - slidesToShow, currentSlide + 1);
        updateSlider();
    });
    
    // Autoplay
    setInterval(() => {
        if (currentSlide >= totalSlides - slidesToShow) {
            currentSlide = 0;
        } else {
            currentSlide++;
        }
        updateSlider();
    }, CONFIG.sliderAutoplayDelay);
    
    // Responsive
    window.addEventListener('resize', () => {
        slidesToShow = getSlidesToShow();
        currentSlide = Math.min(currentSlide, totalSlides - slidesToShow);
        updateSlider();
    });
    
    // Touch/swipe pour mobile
    setupTouchSlider(slider);
}

function getSlidesToShow() {
    if (window.innerWidth <= 480) return 1;
    if (window.innerWidth <= 768) return 2;
    if (window.innerWidth <= 1024) return 3;
    return 4;
}

function updateSlider() {
    const productCards = document.querySelectorAll('.product-card');
    const cardWidth = productCards[0]?.offsetWidth + 32 || 0; // 32px pour le gap
    
    productCards.forEach((card, index) => {
        const translateX = -(currentSlide * cardWidth);
        card.style.transform = `translateX(${translateX}px)`;
        card.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    });
    
    // Mise à jour des boutons
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (prevBtn) prevBtn.disabled = currentSlide === 0;
    if (nextBtn) nextBtn.disabled = currentSlide >= productCards.length - getSlidesToShow();
}

function setupTouchSlider(slider) {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    slider.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
    });
    
    slider.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
        e.preventDefault();
    });
    
    slider.addEventListener('touchend', () => {
        if (!isDragging) return;
        
        const diffX = startX - currentX;
        const threshold = 50;
        
        if (Math.abs(diffX) > threshold) {
            if (diffX > 0 && currentSlide < document.querySelectorAll('.product-card').length - getSlidesToShow()) {
                currentSlide++;
            } else if (diffX < 0 && currentSlide > 0) {
                currentSlide--;
            }
            updateSlider();
        }
        
        isDragging = false;
    });
}

// ===== GESTION DU PANIER =====
function initializeCart() {
    updateCartDisplay();
    
    // Charger le panier depuis localStorage
    const savedCart = localStorage.getItem('itiShopCart');
    if (savedCart) {
        CONFIG.cartItems = JSON.parse(savedCart);
        updateCartCount();
    }
}

function addToCart(productId, productName, price) {
    const existingItem = CONFIG.cartItems.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        CONFIG.cartItems.push({
            id: productId,
            name: productName,
            price: price,
            quantity: 1
        });
    }
    
    updateCartCount();
    saveCartToStorage();
    showCartNotification(productName);
    
    // Animation du bouton panier
    animateCartButton();
}

function updateCartCount() {
    cartCount = CONFIG.cartItems.reduce((total, item) => total + item.quantity, 0);
    updateCartDisplay();
}

function updateCartDisplay() {
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
        cartCountElement.style.display = cartCount > 0 ? 'flex' : 'none';
    }
}

function saveCartToStorage() {
    localStorage.setItem('itiShopCart', JSON.stringify(CONFIG.cartItems));
}

function showCartNotification(productName) {
    // Créer une notification
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <span>${productName} ajouté au panier !</span>
        </div>
    `;
    
    // Styles de la notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '20px',
        background: 'linear-gradient(135deg, #FF6B9D, #4ECDC4)',
        color: 'white',
        padding: '15px 20px',
        borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        zIndex: '9999',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    });
    
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animation de sortie
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function animateCartButton() {
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.style.animation = 'bounce 0.6s ease-in-out';
        setTimeout(() => {
            cartBtn.style.animation = '';
        }, 600);
    }
}

// ===== BOUTONS CTA =====
function setupCTAButtons() {
    const primaryBtn = document.querySelector('.btn-primary');
    const secondaryBtn = document.querySelector('.btn-secondary');
    
    primaryBtn?.addEventListener('click', () => {
        scrollToSection('categories');
        trackEvent('cta_primary_clicked');
    });
    
    secondaryBtn?.addEventListener('click', () => {
        showVideoModal();
        trackEvent('cta_video_clicked');
    });
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = section.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

function showVideoModal() {
    // Créer une modal vidéo
    const modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <iframe 
                    width="560" 
                    height="315" 
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" 
                    frameborder="0" 
                    allowfullscreen>
                </iframe>
            </div>
        </div>
    `;
    
    // Styles de la modal
    const styles = `
        .video-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .modal-content {
            position: relative;
            background: white;
            border-radius: 20px;
            padding: 20px;
            max-width: 90vw;
            max-height: 90vh;
        }
        .modal-close {
            position: absolute;
            top: -15px;
            right: -15px;
            background: #FF6B9D;
            color: white;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .modal-content iframe {
            width: 100%;
            height: 400px;
            border-radius: 10px;
        }
        @media (max-width: 768px) {
            .modal-content iframe {
                height: 250px;
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Fermeture de la modal
    const closeModal = () => {
        document.body.removeChild(modal);
        document.head.removeChild(styleSheet);
        document.body.style.overflow = '';
    };
    
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });
    
    // Fermeture avec Escape
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

// ===== CARTES CATÉGORIES =====
function setupCategoryCards() {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            navigateToCategory(category);
            trackEvent('category_clicked', { category });
        });
        
        // Effet de hover amélioré
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
}

function navigateToCategory(category) {
    // Simulation de navigation vers une page de catégorie
    console.log(`Navigation vers la catégorie: ${category}`);
    
    // Animation de chargement
    showLoadingAnimation();
    
    setTimeout(() => {
        hideLoadingAnimation();
        // Ici vous pourriez rediriger vers une vraie page de catégorie
        // window.location.href = `/category/${category}`;
    }, 1500);
}

// ===== BOUTONS PRODUITS =====
function setupProductButtons() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    
    addToCartButtons.forEach((button, index) => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            const productCard = button.closest('.product-card');
            const productName = productCard.querySelector('h3').textContent;
            const priceText = productCard.querySelector('.current-price').textContent;
            const price = parseFloat(priceText.replace('€', '').replace(',', '.'));
            
            addToCart(`product-${index}`, productName, price);
            
            // Animation du bouton
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 150);
            
            trackEvent('add_to_cart', { 
                product_name: productName, 
                price: price 
            });
        });
    });
}

// ===== NEWSLETTER =====
function setupNewsletterForm() {
    const form = document.querySelector('.newsletter-form');
    
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = form.querySelector('input[type="email"]').value;
        const checkbox = form.querySelector('input[type="checkbox"]').checked;
        
        if (!checkbox) {
            showNotification('Veuillez accepter de recevoir nos newsletters', 'error');
            return;
        }
        
        subscribeToNewsletter(email);
    });
}

function subscribeToNewsletter(email) {
    // Animation de chargement
    const submitBtn = document.querySelector('.subscribe-btn');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Inscription...';
    submitBtn.disabled = true;
    
    // Simulation d'une API call
    setTimeout(() => {
        submitBtn.textContent = '✓ Inscrit !';
        submitBtn.style.background = 'linear-gradient(135deg, #95E1A3, #4ECDC4)';
        
        showNotification('Merci ! Vous recevrez bientôt votre code de réduction 🎉', 'success');
        
        // Reset après 3 secondes
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.style.background = '';
            
            // Vider le formulaire
            document.querySelector('.newsletter-form').reset();
        }, 3000);
        
        trackEvent('newsletter_subscription', { email });
    }, 2000);
}

// ===== FAB (Floating Action Button) =====
function setupFAB() {
    const fabOptions = document.querySelectorAll('.option-fab');
    
    fabOptions.forEach((fab, index) => {
        fab.addEventListener('click', () => {
            switch(index) {
                case 0: // Chat
                    openChat();
                    break;
                case 1: // Téléphone
                    window.location.href = 'tel:0123456789';
                    break;
                case 2: // Email
                    window.location.href = 'mailto:hello@itishop.fr';
                    break;
            }
            trackEvent('fab_clicked', { type: index });
        });
    });
}

function openChat() {
    showNotification('Chat en cours de développement ! 💬', 'info');
}

// ===== RECHERCHE =====
function setupSearch() {
    const searchBtn = document.querySelector('.search-btn');
    
    searchBtn?.addEventListener('click', () => {
        createSearchModal();
    });
}

function createSearchModal() {
    const modal = document.createElement('div');
    modal.className = 'search-modal';
    modal.innerHTML = `
        <div class="search-overlay">
            <div class="search-content">
                <div class="search-header">
                    <input type="text" placeholder="Que recherchez-vous ? 🔍" class="search-input">
                    <button class="search-close">&times;</button>
                </div>
                <div class="search-suggestions">
                    <h4>Suggestions populaires</h4>
                    <div class="suggestion-tags">
                        <span class="tag">Peluches</span>
                        <span class="tag">Puzzles</span>
                        <span class="tag">Jouets bois</span>
                        <span class="tag">Vêtements bébé</span>
                        <span class="tag">Jeux éducatifs</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Styles de la modal de recherche
    const styles = `
        .search-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 10000;
            animation: fadeIn 0.3s ease-out;
        }
        .search-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            padding: 50px 20px;
        }
        .search-content {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            animation: slideInDown 0.3s ease-out;
        }
        .search-header {
            display: flex;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #f0f0f0;
        }
        .search-input {
            flex: 1;
            border: none;
            font-size: 18px;
            padding: 10px;
            outline: none;
        }
        .search-close {
            background: none;
            border: none;
            font-size: 24px;
            color: #999;
            cursor: pointer;
            padding: 10px;
        }
        .search-suggestions {
            padding: 20px;
        }
        .search-suggestions h4 {
            margin-bottom: 15px;
            color: #333;
        }
        .suggestion-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        .tag {
            background: linear-gradient(135deg, #FF6B9D, #4ECDC4);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 14px;
            transition: transform 0.2s;
        }
        .tag:hover {
            transform: scale(1.05);
        }
        @keyframes slideInDown {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Focus sur l'input
    const searchInput = modal.querySelector('.search-input');
    setTimeout(() => searchInput.focus(), 100);
    
    // Fermeture de la modal
    const closeModal = () => {
        document.body.removeChild(modal);
        document.head.removeChild(styleSheet);
        document.body.style.overflow = '';
    };
    
    modal.querySelector('.search-close').addEventListener('click', closeModal);
    modal.querySelector('.search-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });
    
    // Gestion des suggestions
    modal.querySelectorAll('.tag').forEach(tag => {
        tag.addEventListener('click', () => {
            searchInput.value = tag.textContent;
            searchInput.focus();
        });
    });
    
    // Recherche en temps réel
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        if (query.length > 2) {
            // Simulation de recherche
            console.log(`Recherche: ${query}`);
        }
    });
}

// ===== ANIMATIONS D'APPARITION =====
function initializeAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observer les éléments à animer
    const elementsToAnimate = document.querySelectorAll('.feature-card, .testimonial-card, .category-card, .product-card');
    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });
}

// ===== EFFETS DE SCROLL =====
function initializeScrollEffects() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallax = scrolled * 0.5;
        
        // Effet parallax sur les éléments flottants
        const floatingElements = document.querySelectorAll('.float-item');
        floatingElements.forEach((element, index) => {
            const speed = 0.1 + (index * 0.05);
            element.style.transform = `translateY(${parallax * speed}px)`;
        });
        
        // Effet de révélation des éléments
        revealElementsOnScroll();
    });
}

function revealElementsOnScroll() {
    const elements = document.querySelectorAll('.feature-card, .testimonial-card');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('fade-in');
        }
    });
}

// ===== ÉLÉMENTS FLOTTANTS =====
function initializeFloatingElements() {
    const floatingElements = document.querySelectorAll('.float-item');
    
    floatingElements.forEach((element, index) => {
        // Animation aléatoire pour chaque élément
        const randomDelay = Math.random() * 2;
        const randomDuration = 4 + Math.random() * 2;
        
        element.style.animationDelay = `${randomDelay}s`;
        element.style.animationDuration = `${randomDuration}s`;
        
        // Mouvement de souris
        document.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            
            const moveX = (mouseX - 0.5) * 20;
            const moveY = (mouseY - 0.5) * 20;
            
            element.style.transform += `translate(${moveX * (index + 1) * 0.1}px, ${moveY * (index + 1) * 0.1}px)`;
        });
    });
}

// ===== VALIDATION DE FORMULAIRE =====
function setupFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', validateInput);
            input.addEventListener('input', clearValidationError);
        });
    });
}

function validateInput(e) {
    const input = e.target;
    const value = input.value.trim();
    
    // Réinitialiser les styles
    input.style.borderColor = '';
    
    // Validation email
    if (input.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showInputError(input, 'Adresse email invalide');
            return false;
        }
    }
    
    // Validation champs requis
    if (input.hasAttribute('required') && !value) {
        showInputError(input, 'Ce champ est requis');
        return false;
    }
    
    return true;
}

function showInputError(input, message) {
    input.style.borderColor = '#FF6B9D';
    
    // Supprimer l'ancien message d'erreur
    const existingError = input.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Ajouter le nouveau message
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.color = '#FF6B9D';
    errorElement.style.fontSize = '0.8rem';
    errorElement.style.marginTop = '5px';
    
    input.parentNode.appendChild(errorElement);
}

function clearValidationError(e) {
    const input = e.target;
    input.style.borderColor = '';
    
    const errorMessage = input.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

// ===== NOTIFICATIONS =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const colors = {
        success: '#95E1A3',
        error: '#FF8A5B',
        info: '#4ECDC4',
        warning: '#FFE66D'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: colors[type] || colors.info,
        color: 'white',
        padding: '15px 20px',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        zIndex: '9999',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        maxWidth: '300px',
        wordWrap: 'break-word'
    });
    
    // Styles pour le contenu
    const content = notification.querySelector('.notification-content');
    Object.assign(content.style, {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px'
    });
    
    // Styles pour le bouton de fermeture
    const closeBtn = notification.querySelector('.notification-close');
    Object.assign(closeBtn.style, {
        background: 'none',
        border: 'none',
        color: 'white',
        fontSize: '18px',
        cursor: 'pointer',
        padding: '0',
        width: '20px',
        height: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    });
    
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Fermeture automatique
    const autoClose = setTimeout(() => {
        closeNotification(notification);
    }, 5000);
    
    // Fermeture manuelle
    closeBtn.addEventListener('click', () => {
        clearTimeout(autoClose);
        closeNotification(notification);
    });
}

function closeNotification(notification) {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
        if (notification.parentNode) {
            document.body.removeChild(notification);
        }
    }, 300);
}

// ===== ANIMATIONS DE CHARGEMENT =====
function showLoadingAnimation() {
    const loader = document.createElement('div');
    loader.className = 'loading-overlay';
    loader.innerHTML = `
        <div class="loading-content">
            <div class="spinner">
                <div class="spinner-circle"></div>
                <div class="spinner-circle"></div>
                <div class="spinner-circle"></div>
            </div>
            <p>Chargement en cours...</p>
        </div>
    `;
    
    const styles = `
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease-out;
        }
        .loading-content {
            text-align: center;
            color: #333;
        }
        .spinner {
            display: flex;
            gap: 5px;
            margin-bottom: 20px;
            justify-content: center;
        }
        .spinner-circle {
            width: 12px;
            height: 12px;
            background: linear-gradient(135deg, #FF6B9D, #4ECDC4);
            border-radius: 50%;
            animation: bounce 1.4s ease-in-out infinite both;
        }
        .spinner-circle:nth-child(1) { animation-delay: -0.32s; }
        .spinner-circle:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    
    document.body.appendChild(loader);
    document.body.style.overflow = 'hidden';
    
    // Stocker la référence pour la suppression
    loader.styleSheet = styleSheet;
}

function hideLoadingAnimation() {
    const loader = document.querySelector('.loading-overlay');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            if (loader.parentNode) {
                document.body.removeChild(loader);
                document.head.removeChild(loader.styleSheet);
                document.body.style.overflow = '';
            }
        }, 300);
    }
}

// ===== ANALYTICS ET TRACKING =====
function trackEvent(eventName, parameters = {}) {
    // Simulation de tracking analytics
    console.log('📊 Event tracked:', eventName, parameters);
    
    // Ici vous pourriez intégrer Google Analytics, Facebook Pixel, etc.
    // gtag('event', eventName, parameters);
    // fbq('track', eventName, parameters);
}

// ===== EASTER EGGS =====
function initializeEasterEggs() {
    let konamiCode = [];
    const konamiSequence = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
    ];
    
    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.code);
        
        if (konamiCode.length > konamiSequence.length) {
            konamiCode.shift();
        }
        
        if (konamiCode.join(',') === konamiSequence.join(',')) {
            activateEasterEgg();
            konamiCode = [];
        }
    });
    
    // Easter egg avec triple clic sur le logo
    const logo = document.querySelector('.logo');
    let clickCount = 0;
    
    logo?.addEventListener('click', () => {
        clickCount++;
        setTimeout(() => {
            clickCount = 0;
        }, 1000);
        
        if (clickCount === 3) {
            activateLogoEasterEgg();
            clickCount = 0;
        }
    });
}

function activateEasterEgg() {
    // Effet confettis
    createConfetti();
    showNotification('🎉 Konami Code activé ! Vous avez trouvé l\'easter egg !', 'success');
    trackEvent('easter_egg_konami');
}

function activateLogoEasterEgg() {
    // Animation spéciale du logo
    const logo = document.querySelector('.logo h1');
    logo.style.animation = 'rainbow 2s infinite, bounce 1s ease-in-out';
    
    setTimeout(() => {
        logo.style.animation = '';
    }, 5000);
    
    showNotification('🌈 Logo magique activé !', 'success');
    trackEvent('easter_egg_logo');
}

function createConfetti() {
    const colors = ['#FF6B9D', '#4ECDC4', '#FFE66D', '#95E1A3', '#FF8A5B'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            top: -10px;
            left: ${Math.random() * 100}vw;
            z-index: 9999;
            pointer-events: none;
            border-radius: 50%;
            animation: confettiFall ${2 + Math.random() * 3}s linear forwards;
        `;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 5000);
    }
}

// ===== GESTION DES ERREURS =====
window.addEventListener('error', (e) => {
    console.error('🚨 Erreur JavaScript:', e.error);
    trackEvent('javascript_error', {
        message: e.message,
        filename: e.filename,
        line: e.lineno
    });
});

// ===== PERFORMANCE MONITORING =====
function monitorPerformance() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.timing;
                const loadTime = perfData.loadEventEnd - perfData.navigationStart;
                
                trackEvent('page_performance', {
                    load_time: loadTime,
                    dom_ready: perfData.domContentLoadedEventEnd - perfData.navigationStart
                });
                
                console.log('⚡ Page loaded in:', loadTime, 'ms');
            }, 0);
        });
    }
}

// ===== RESPONSIVE HELPERS =====
function handleResize() {
    window.addEventListener('resize', debounce(() => {
        // Réajuster le slider
        if (typeof updateSlider === 'function') {
            updateSlider();
        }
        
        // Fermer le menu mobile si on passe en desktop
        if (window.innerWidth > 768 && CONFIG.isMenuOpen) {
            toggleMobileMenu();
        }
        
        // Réajuster les modals ouvertes
        const modals = document.querySelectorAll('.video-modal, .search-modal');
        modals.forEach(modal => {
            const content = modal.querySelector('.modal-content, .search-content');
            if (content) {
                content.style.maxWidth = window.innerWidth < 768 ? '95vw' : '600px';
            }
        });
    }, 250));
}

// ===== UTILITY FUNCTIONS =====
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

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// ===== ACCESSIBILITY =====
function initializeAccessibility() {
    // Gestion du focus pour la navigation au clavier
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('user-is-tabbing');
        }
    });
    
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('user-is-tabbing');
    });
    
    // Skip link pour la navigation
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Aller au contenu principal';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: fixed;
        top: -40px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 8px;
        z-index: 10000;
        text-decoration: none;
        border-radius: 4px;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
}

// ===== COOKIES & GDPR =====
function initializeCookieConsent() {
    // Vérifier si le consentement a déjà été donné
    if (localStorage.getItem('cookieConsent')) {
        return;
    }
    
    const cookieBanner = document.createElement('div');
    cookieBanner.className = 'cookie-banner';
    cookieBanner.innerHTML = `
        <div class="cookie-content">
            <div class="cookie-text">
                <h4>🍪 Nous utilisons des cookies</h4>
                <p>Pour améliorer votre expérience sur notre site et vous proposer des produits adaptés à vos besoins.</p>
            </div>
            <div class="cookie-actions">
                <button class="btn-cookie-accept">Accepter</button>
                <button class="btn-cookie-decline">Refuser</button>
            </div>
        </div>
    `;
    
    Object.assign(cookieBanner.style, {
        position: 'fixed',
        bottom: '0',
        left: '0',
        right: '0',
        background: 'white',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
        padding: '20px',
        zIndex: '9999',
        transform: 'translateY(100%)',
        transition: 'transform 0.3s ease-out'
    });
    
    document.body.appendChild(cookieBanner);
    
    // Animation d'apparition
    setTimeout(() => {
        cookieBanner.style.transform = 'translateY(0)';
    }, 1000);
    
    // Gestion des boutons
    cookieBanner.querySelector('.btn-cookie-accept').addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'accepted');
        closeCookieBanner(cookieBanner);
        trackEvent('cookie_consent', { status: 'accepted' });
    });
    
    cookieBanner.querySelector('.btn-cookie-decline').addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'declined');
        closeCookieBanner(cookieBanner);
        trackEvent('cookie_consent', { status: 'declined' });
    });
}

function closeCookieBanner(banner) {
    banner.style.transform = 'translateY(100%)';
    setTimeout(() => {
        if (banner.parentNode) {
            document.body.removeChild(banner);
        }
    }, 300);
}

// ===== INITIALISATION FINALE =====
document.addEventListener('DOMContentLoaded', () => {
    // Délai pour s'assurer que tout est chargé
    setTimeout(() => {
        initializeEasterEggs();
        monitorPerformance();
        handleResize();
        initializeAccessibility();
        initializeCookieConsent();
        
        // Ajouter les styles CSS supplémentaires pour les animations
        const additionalStyles = `
            @keyframes rainbow {
                0% { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
            }
            
            @keyframes confettiFall {
                0% { transform: translateY(-10px) rotate(0deg); }
                100% { transform: translateY(100vh) rotate(720deg); }
            }
            
            .user-is-tabbing *:focus {
                outline: 3px solid #FF6B9D !important;
                outline-offset: 2px;
            }
            
            .cookie-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                max-width: 1200px;
                margin: 0 auto;
                gap: 20px;
            }
            
            .cookie-actions {
                display: flex;
                gap: 10px;
            }
            
            .btn-cookie-accept, .btn-cookie-decline {
                padding: 10px 20px;
                border: none;
                border-radius: 20px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s ease;
            }
            
            .btn-cookie-accept {
                background: linear-gradient(135deg, #FF6B9D, #4ECDC4);
                color: white;
            }
            
            .btn-cookie-decline {
                background: #f0f0f0;
                color: #666;
            }
            
            .btn-cookie-accept:hover, .btn-cookie-decline:hover {
                transform: translateY(-2px);
            }
            
            @media (max-width: 768px) {
                .cookie-content {
                    flex-direction: column;
                    text-align: center;
                }
                
                .cookie-actions {
                    width: 100%;
                    justify-content: center;
                }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = additionalStyles;
        document.head.appendChild(styleSheet);
        
        console.log('🚀 I.T.I Shop fully loaded and ready!');
    }, 500);
});

// ===== EXPORT POUR MODULES (si nécessaire) =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        addToCart,
        showNotification,
        trackEvent
    };
}