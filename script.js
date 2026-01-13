// ============================================
// Lenis Smooth Scroll Initialization
// ============================================
let lenis;

function initLenis() {
  if (typeof Lenis !== 'undefined' && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);
    
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    // Animation frame loop
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', () => {
      ScrollTrigger.update();
      handleNavbarScroll(); // Update navbar on scroll
    });

    // Update ScrollTrigger on Lenis scroll
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (arguments.length) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      }
    });

    // Refresh ScrollTrigger after Lenis is ready
    ScrollTrigger.addEventListener('refresh', () => {
      if (lenis) {
        lenis.resize();
      }
    });

    ScrollTrigger.refresh();
  }
}

// ============================================
// Navbar scroll behavior
// ============================================
let lastScrollTop = 0;
const navbar = document.getElementById('main-navbar');
const defaultLogo = document.getElementById('default-logo');
const scrollLogo = document.getElementById('scroll-logo');

// Navbar scroll handler - works with both native scroll and Lenis
function handleNavbarScroll() {
  const scrollTop = lenis ? lenis.scroll : (window.pageYOffset || document.documentElement.scrollTop);
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  
  if (scrollTop > 50) {
    // User has scrolled down - make navbar fixed at top with black background
    navbar.classList.remove('absolute', 'top-0', 'md:top-0');
    navbar.classList.add('fixed', 'top-0', 'bg-black');
    
    // Show scroll logo, hide default logo
    defaultLogo.classList.add('hidden');
    scrollLogo.classList.remove('hidden');
    
    // Ensure menu button text is white when navbar has black background
    if (mobileMenuBtn) {
      mobileMenuBtn.classList.add('text-white');
      mobileMenuBtn.classList.remove('text-black');
    }
    
    lastScrollTop = scrollTop;
  } else {
    // User is at the top - restore original position and remove background
    navbar.classList.remove('fixed', 'top-0', 'bg-black');
    navbar.classList.add('absolute', 'top-0', 'md:top-0');
    
    // Show default logo, hide scroll logo
    defaultLogo.classList.remove('hidden');
    scrollLogo.classList.add('hidden');
    
    // Menu button text should be white when at top (over hero section)
    if (mobileMenuBtn) {
      mobileMenuBtn.classList.add('text-white');
      mobileMenuBtn.classList.remove('text-black');
    }
    
    lastScrollTop = scrollTop;
  }
}

// Use Lenis scroll event if available, otherwise use window scroll
if (typeof Lenis !== 'undefined') {
  // Will be set up after Lenis is initialized
} else {
  window.addEventListener('scroll', handleNavbarScroll);
}

// Initialize on page load
window.addEventListener('load', function() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  if (scrollTop <= 50) {
    defaultLogo.classList.remove('hidden');
    scrollLogo.classList.add('hidden');
  }
});

// ============================================
// Smooth Scroll to Sections with Offset
// ============================================
function smoothScrollToSection(targetId) {
  const targetElement = document.querySelector(targetId);
  if (!targetElement) return;

  // Calculate offset: 5% of viewport height (95% from top)
  const offset = window.innerHeight * 0.15;
  
  // Get target position
  const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;

  // Use Lenis if available, otherwise use native smooth scroll
  if (lenis) {
    lenis.scrollTo(targetPosition, {
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
  } else {
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }
}

// Handle anchor link clicks for smooth scrolling
function initSmoothScrollLinks() {
  // Get all anchor links in navigation (desktop and mobile)
  const navLinks = document.querySelectorAll('a[href^="#"]');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // Skip if it's just "#" or empty
      if (!href || href === '#') return;
      
      // Prevent default anchor behavior
      e.preventDefault();
      
      // Close mobile menu if open
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu) {
        const isMenuOpen = !mobileMenu.classList.contains('hidden');
        if (isMenuOpen && typeof closeMobileMenu === 'function') {
          closeMobileMenu();
        }
      }
      
      // Smooth scroll to target section
      smoothScrollToSection(href);
    });
  });
}

// Initialize smooth scroll links when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSmoothScrollLinks);
} else {
  initSmoothScrollLinks();
}

// Mobile Menu Toggle with GSAP
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuCloseBtn = document.getElementById('mobile-menu-close-btn');
const menuIcon = document.getElementById('menu-icon');
const closeIcon = document.getElementById('close-icon');
const menuItems = document.querySelectorAll('.mobile-menu-item');
let isMenuOpen = false;

// Set initial state for mobile menu
gsap.set(mobileMenu, { y: '-100%', display: 'none' });
gsap.set(menuItems, { opacity: 0, y: 20 });

// Toggle mobile menu
mobileMenuBtn.addEventListener('click', function() {
  if (!isMenuOpen) {
    openMobileMenu();
  } else {
    closeMobileMenu();
  }
});

function openMobileMenu() {
  isMenuOpen = true;
  mobileMenu.classList.remove('hidden');
  menuIcon.classList.add('hidden');
  closeIcon.classList.remove('hidden');
  // Force close icon to be visible
  closeIcon.style.display = 'block';
  menuIcon.style.display = 'none';
  // Change button color to black for white menu background
  mobileMenuBtn.classList.remove('text-white');
  mobileMenuBtn.classList.add('text-black', 'fixed', 'top-6', 'right-6', 'z-[10000]');
  document.body.style.overflow = 'hidden'; // Prevent body scroll
  
  // Animate menu from top to bottom
  gsap.to(mobileMenu, {
    y: '0%',
    duration: 0.6,
    ease: 'power3.out',
    display: 'block'
  });
  
  // Animate menu items with stagger
  gsap.to(menuItems, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    stagger: 0.1,
    delay: 0.2,
    ease: 'power2.out'
  });
}

function closeMobileMenu() {
  isMenuOpen = false;
  menuIcon.classList.remove('hidden');
  closeIcon.classList.add('hidden');
  // Force menu icon to be visible and close icon to be hidden
  menuIcon.style.display = 'block';
  closeIcon.style.display = 'none';
  // Restore button color to white and position
  mobileMenuBtn.classList.remove('text-black', 'fixed', 'top-6', 'right-6', 'z-[10000]');
  mobileMenuBtn.classList.add('text-white');
  document.body.style.overflow = ''; // Restore body scroll
  
  // Animate menu items out
  gsap.to(menuItems, {
    opacity: 0,
    y: 20,
    duration: 0.3,
    stagger: 0.05,
    ease: 'power2.in'
  });
  
  // Animate menu from bottom to top
  gsap.to(mobileMenu, {
    y: '-100%',
    duration: 0.5,
    ease: 'power3.in',
    delay: 0.2,
    onComplete: function() {
      mobileMenu.classList.add('hidden');
    }
  });
}

// Close menu when clicking on close button at bottom
if (mobileMenuCloseBtn) {
  mobileMenuCloseBtn.addEventListener('click', function() {
    closeMobileMenu();
  });
}

// Close menu when clicking on navigation links (but not the close button)
mobileMenu.addEventListener('click', function(e) {
  if (e.target.closest('a') && !e.target.closest('#mobile-menu-close-btn')) {
    closeMobileMenu();
  }
});

// Close menu on window resize if it's larger than lg breakpoint
window.addEventListener('resize', function() {
  if (window.innerWidth >= 1024 && isMenuOpen) {
    closeMobileMenu();
  }
});

// Prevent scroll when menu is open
mobileMenu.addEventListener('touchmove', function(e) {
  if (isMenuOpen) {
    e.preventDefault();
  }
}, { passive: false });

// ============================================
// Hero Section Slider
// ============================================

// Slider data
const sliderData = [
  {
    image: 'img/s1/FGPI_B1.jpg',
    title: 'Global Credibility <br> Backed by an international luxury network.',
    text:'text-[#ffffff]'
  },
  {
    image: 'img/s1/FGPI_B2.jpg',
    title: 'Select Representation <br> Only a curated portfolio earns the spotlight.',
    text:'text-white'
  },
  {
    image: 'img/s1/FGPI_B3.jpg',
    title: 'Luxury That Lasts <br> Built for relevance, designed to endure.',
    text:'text-white'
  },
  {
    image: 'img/s1/FGPI_B4.jpg',
    title: 'Curated, Not Crowded <br> Quality over quantity, always.',
    text:'text-white'
  },
  {
    image: 'img/s1/FGPI_B5.jpg',
    title: 'Trusted Worldwide <br> A name that signals confidence across markets.',
    text:'text-white'
  }
];

let currentSlide = 0;
let sliderInterval;
const sliderIntervalTime = 5000; // 5 seconds

// Get slider elements
const sliderImage = document.getElementById('slider-image');
const sliderPagination = document.getElementById('slider-pagination');
const sliderTitle = document.getElementById('slider-title');

// Initialize slider
function initSlider() {
  // Create pagination dots
  sliderData.forEach((slide, index) => {
    const dot = document.createElement('div');
    dot.className = `slider-dot w-[10px] h-[10px] rounded-full cursor-pointer transition-all duration-300 ${index === 0 ? 'bg-[#BF4423]' : 'bg-[#818181]'}`;
    dot.addEventListener('click', () => goToSlide(index));
    sliderPagination.appendChild(dot);
  });

  // Load first slide
  updateSlider(0);
  
  // Start automatic slider
  startSlider();
}

// Update slider - image and text content change
function updateSlider(slideIndex) {
  const slide = sliderData[slideIndex];
  
  // Update image with fade effect
  if (sliderImage) {
    sliderImage.style.opacity = '0';
    setTimeout(() => {
      sliderImage.src = slide.image;
      sliderImage.alt = 'slider';
      sliderImage.style.opacity = '1';
    }, 300);
  }

  // Update title with fade effect
  if (sliderTitle) {
    sliderTitle.style.opacity = '0';
    setTimeout(() => {
      // Remove existing text color classes (handle both standard and arbitrary values)
      const textColorClasses = ['text-white', 'text-[#BF4423]', 'text-black', 'text-gray-900'];
      textColorClasses.forEach(className => {
        sliderTitle.classList.remove(className);
      });
      // Apply new text color class from slide data
      if (slide.text) {
        sliderTitle.classList.add(slide.text);
      }
      sliderTitle.innerHTML = slide.title;
      sliderTitle.style.opacity = '1';
    }, 300);
  }


  // Update pagination dots
  const dots = sliderPagination.querySelectorAll('.slider-dot');
  dots.forEach((dot, index) => {
    if (index === slideIndex) {
      dot.classList.remove('bg-[#818181]');
      dot.classList.add('bg-[#BF4423]');
    } else {
      dot.classList.remove('bg-[#BF4423]');
      dot.classList.add('bg-[#818181]');
    }
  });
}

// Go to specific slide
function goToSlide(slideIndex) {
  currentSlide = slideIndex;
  updateSlider(currentSlide);
  resetSlider();
}

// Next slide
function nextSlide() {
  currentSlide = (currentSlide + 1) % sliderData.length;
  updateSlider(currentSlide);
}

// Previous slide
function prevSlide() {
  currentSlide = (currentSlide - 1 + sliderData.length) % sliderData.length;
  updateSlider(currentSlide);
}

// Start automatic slider
function startSlider() {
  sliderInterval = setInterval(nextSlide, sliderIntervalTime);
}

// Reset slider interval
function resetSlider() {
  clearInterval(sliderInterval);
  startSlider();
}

// Pause slider on hover
const sliderSection = document.querySelector('.s1');
if (sliderSection) {
  sliderSection.addEventListener('mouseenter', () => {
    clearInterval(sliderInterval);
  });
  
  sliderSection.addEventListener('mouseleave', () => {
    startSlider();
  });
}

// Initialize slider when DOM and GSAP are ready
function initializeSlider() {
  if (typeof gsap !== 'undefined' && sliderImage && sliderPagination) {
    initSlider();
  } else {
    // Wait for GSAP to load
    setTimeout(initializeSlider, 100);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSlider);
} else {
  initializeSlider();
}

// ============================================
// GSAP ScrollTrigger Animations
// ============================================

// Wait for DOM and GSAP to be ready
function initAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    setTimeout(initAnimations, 100);
    return;
  }

  // Register ScrollTrigger plugin
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Initialize Lenis after GSAP is ready
  initLenis();

  // Parallax effect for hero background (Section 1 - only parallax, no other animations)
  const heroImage = document.getElementById('slider-image');
  if (heroImage) {
    gsap.to(heroImage, {
      yPercent: 30,
      ease: 'none',
      scrollTrigger: {
        trigger: '.s1',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  // ============================================
  // Section 2 Animations
  // ============================================
  const sec2 = document.getElementById('sec2');
  if (sec2) {
    // Section 2 Row 1 - Left Content
    const sec2LeftContent = document.getElementById('sec2-left-content');
    if (sec2LeftContent) {
      const leftChildren = sec2LeftContent.children;
      if (leftChildren.length > 0) {
        gsap.from(Array.from(leftChildren), {
          opacity: 0,
          y: 40,
          duration: 1,
          stagger: 0.15,
          scrollTrigger: {
            trigger: sec2LeftContent,
            start: 'top 80%',
            end: 'top 50%',
            toggleActions: 'play none none none'
          },
          ease: 'power3.out'
        });
      }
    }

    // Section 2 Row 1 - Right Cards
    const sec2Card1 = document.getElementById('sec2-card1');
    const sec2Card2 = document.getElementById('sec2-card2');
    if (sec2Card1) {
      gsap.from(sec2Card1, {
        opacity: 0,
        x: 50,
        scale: 0.9,
        duration: 1,
        scrollTrigger: {
          trigger: sec2Card1,
          start: 'top 80%',
          end: 'top 50%',
          toggleActions: 'play none none none'
        },
        ease: 'power3.out'
      });
    }
    if (sec2Card2) {
      gsap.from(sec2Card2, {
        opacity: 0,
        x: 50,
        scale: 0.9,
        duration: 1,
        delay: 0.2,
        scrollTrigger: {
          trigger: sec2Card2,
          start: 'top 80%',
          end: 'top 50%',
          toggleActions: 'play none none none'
        },
        ease: 'power3.out'
      });
    }

    // Section 2 Row 2 - Left Side
    const sec2Row2Left = document.getElementById('sec2-row2-left');
    if (sec2Row2Left) {
      const row2LeftTop = document.getElementById('sec2-row2-left-top');
      const row2LeftBottom = document.getElementById('sec2-row2-left-bottom');
      
      if (row2LeftTop) {
        gsap.from(row2LeftTop.children, {
          opacity: 0,
          x: -50,
          duration: 1,
          stagger: 0.2,
          scrollTrigger: {
            trigger: row2LeftTop,
            start: 'top 80%',
            end: 'top 50%',
            toggleActions: 'play none none none'
          },
          ease: 'power3.out'
        });
      }
      
      if (row2LeftBottom) {
        const bottomCard = document.getElementById('sec2-row2-left-bottom-card');
        const bottomImg = document.getElementById('sec2-row2-left-bottom-img');
        
        if (bottomCard) {
          gsap.from(bottomCard, {
            opacity: 0,
            y: 30,
            duration: 0.8,
            scrollTrigger: {
              trigger: bottomCard,
              start: 'top 85%',
              end: 'top 60%',
              toggleActions: 'play none none none'
            },
            ease: 'power2.out'
          });
        }
        
        if (bottomImg) {
          gsap.from(bottomImg, {
            opacity: 0,
            scale: 0.95,
            duration: 0.8,
            scrollTrigger: {
              trigger: bottomImg,
              start: 'top 85%',
              end: 'top 60%',
              toggleActions: 'play none none none'
            },
            ease: 'power2.out'
          });
        }
      }
    }

    // Section 2 Row 2 - Right Side
    const sec2Row2RightTopLeft = document.getElementById('sec2-row2-right-top-left');
    const sec2Row2RightTopRight = document.getElementById('sec2-row2-right-top-right');
    const sec2Row2RightBottom = document.getElementById('sec2-row2-right-bottom');
    
    if (sec2Row2RightTopLeft) {
      gsap.from(sec2Row2RightTopLeft, {
        opacity: 0,
        y: 40,
        scale: 0.95,
        duration: 0.8,
        scrollTrigger: {
          trigger: sec2Row2RightTopLeft,
          start: 'top 85%',
          end: 'top 60%',
          toggleActions: 'play none none none'
        },
        ease: 'power2.out'
      });
    }
    
    if (sec2Row2RightTopRight) {
      gsap.from(sec2Row2RightTopRight, {
        opacity: 0,
        y: 40,
        scale: 0.95,
        duration: 0.8,
        delay: 0.1,
        scrollTrigger: {
          trigger: sec2Row2RightTopRight,
          start: 'top 85%',
          end: 'top 60%',
          toggleActions: 'play none none none'
        },
        ease: 'power2.out'
      });
    }
    
    if (sec2Row2RightBottom) {
      gsap.from(sec2Row2RightBottom, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        delay: 0.2,
        scrollTrigger: {
          trigger: sec2Row2RightBottom,
          start: 'top 85%',
          end: 'top 60%',
          toggleActions: 'play none none none'
        },
        ease: 'power2.out'
      });
    }
  }

  // ============================================
  // Section 4 Animations
  // ============================================
  const sec4 = document.getElementById('sec4');
  if (sec4) {
    // Featured Project
    const sec4FeaturedImg = document.getElementById('sec4-featured-img');
    const sec4FeaturedContent = document.getElementById('sec4-featured-content');
    
    if (sec4FeaturedImg) {
      gsap.from(sec4FeaturedImg, {
        opacity: 0,
        x: -50,
        scale: 0.95,
        duration: 1,
        scrollTrigger: {
          trigger: sec4FeaturedImg,
          start: 'top 85%',
          end: 'top 60%',
          toggleActions: 'play none none none'
        },
        ease: 'power3.out'
      });
    }
    
    if (sec4FeaturedContent) {
      const title = document.getElementById('sec4-featured-title');
      const subtitle = document.getElementById('sec4-featured-subtitle');
      const desc = document.getElementById('sec4-featured-desc');
      const list = document.getElementById('sec4-featured-list');
      const btn = document.getElementById('sec4-featured-btn');
      
      if (title) {
        gsap.from(title, {
          opacity: 0,
          x: 50,
          duration: 1,
          scrollTrigger: {
            trigger: sec4FeaturedContent,
            start: 'top 85%',
            end: 'top 60%',
            toggleActions: 'play none none none'
          },
          ease: 'power3.out'
        });
      }
      
      if (subtitle) {
        gsap.from(subtitle, {
          opacity: 0,
          x: 50,
          duration: 1,
          delay: 0.15,
          scrollTrigger: {
            trigger: sec4FeaturedContent,
            start: 'top 85%',
            end: 'top 60%',
            toggleActions: 'play none none none'
          },
          ease: 'power3.out'
        });
      }
      
      if (desc) {
        gsap.from(desc, {
          opacity: 0,
          x: 50,
          duration: 1,
          delay: 0.3,
          scrollTrigger: {
            trigger: sec4FeaturedContent,
            start: 'top 85%',
            end: 'top 60%',
            toggleActions: 'play none none none'
          },
          ease: 'power3.out'
        });
      }
      
      if (list) {
        gsap.from(list.children, {
          opacity: 0,
          x: 50,
          duration: 0.8,
          stagger: 0.1,
          delay: 0.45,
          scrollTrigger: {
            trigger: sec4FeaturedContent,
            start: 'top 85%',
            end: 'top 60%',
            toggleActions: 'play none none none'
          },
          ease: 'power2.out'
        });
      }
      
      if (btn) {
        gsap.from(btn, {
          opacity: 0,
          x: 50,
          duration: 1,
          delay: 0.6,
          scrollTrigger: {
            trigger: sec4FeaturedContent,
            start: 'top 85%',
            end: 'top 60%',
            toggleActions: 'play none none none'
          },
          ease: 'power3.out'
        });
      }
    }

    // Row 2 - Form and Cards
    const sec4Form = document.getElementById('sec4-form');
    const sec4Card1 = document.getElementById('sec4-card1');
    const sec4Card2 = document.getElementById('sec4-card2');
    const sec4Card3 = document.getElementById('sec4-card3');
    
    if (sec4Form) {
      gsap.from(sec4Form, {
        opacity: 0,
        y: 40,
        duration: 0.9,
        scrollTrigger: {
          trigger: sec4Form,
          start: 'top 85%',
          end: 'top 60%',
          toggleActions: 'play none none none'
        },
        ease: 'power2.out'
      });
    }
    
    if (sec4Card1) {
      gsap.from(sec4Card1, {
        opacity: 0,
        y: 40,
        duration: 0.9,
        delay: 0.1,
        scrollTrigger: {
          trigger: sec4Card1,
          start: 'top 85%',
          end: 'top 60%',
          toggleActions: 'play none none none'
        },
        ease: 'power2.out'
      });
    }
    
    if (sec4Card2) {
      gsap.from(sec4Card2, {
        opacity: 0,
        y: 40,
        duration: 0.9,
        scrollTrigger: {
          trigger: sec4Card2,
          start: 'top 85%',
          end: 'top 60%',
          toggleActions: 'play none none none'
        },
        ease: 'power2.out'
      });
    }
    
    if (sec4Card3) {
      gsap.from(sec4Card3, {
        opacity: 0,
        y: 40,
        duration: 0.9,
        delay: 0.1,
        scrollTrigger: {
          trigger: sec4Card3,
          start: 'top 85%',
          end: 'top 60%',
          toggleActions: 'play none none none'
        },
        ease: 'power2.out'
      });
    }
  }

  // ============================================
  // Footer Animations
  // ============================================
  const footer = document.getElementById('footer');
  if (footer) {
    const footerRow1 = document.getElementById('footer-row1');
    const footerRow2 = document.getElementById('footer-row2');
    const footerRow3 = document.getElementById('footer-row3');
    
    if (footerRow1) {
      gsap.from(footerRow1.children, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: {
          trigger: footerRow1,
          start: 'top 90%',
          end: 'top 70%',
          toggleActions: 'play none none none'
        },
        ease: 'power2.out'
      });
    }
    
    if (footerRow2) {
      const col1 = document.getElementById('footer-col1');
      const col2 = document.getElementById('footer-col2');
      const col3 = document.getElementById('footer-col3');
      const col4 = document.getElementById('footer-col4');
      
      if (col1) {
        gsap.from(col1, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          scrollTrigger: {
            trigger: footerRow2,
            start: 'top 90%',
            end: 'top 70%',
            toggleActions: 'play none none none'
          },
          ease: 'power2.out'
        });
      }
      
      if (col2) {
        gsap.from(col2, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          delay: 0.1,
          scrollTrigger: {
            trigger: footerRow2,
            start: 'top 90%',
            end: 'top 70%',
            toggleActions: 'play none none none'
          },
          ease: 'power2.out'
        });
      }
      
      if (col3) {
        gsap.from(col3, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          delay: 0.2,
          scrollTrigger: {
            trigger: footerRow2,
            start: 'top 90%',
            end: 'top 70%',
            toggleActions: 'play none none none'
          },
          ease: 'power2.out'
        });
      }
      
      if (col4) {
        gsap.from(col4, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          delay: 0.3,
          scrollTrigger: {
            trigger: footerRow2,
            start: 'top 90%',
            end: 'top 70%',
            toggleActions: 'play none none none'
          },
          ease: 'power2.out'
        });
      }
    }
    
    if (footerRow3) {
      gsap.from(footerRow3.children, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: {
          trigger: footerRow3,
          start: 'top 90%',
          end: 'top 70%',
          toggleActions: 'play none none none'
        },
        ease: 'power2.out'
      });
    }
  }

}

// ============================================
// Google Sheets Form Submission Function
// ============================================

// ⚠️ IMPORTANT: Replace this with your Google Apps Script Web App URL
// 
// SETUP INSTRUCTIONS:
// 1. Open your Google Apps Script project
// 2. Click "Deploy" > "New deployment"
// 3. Click the gear icon ⚙️ next to "Select type" and choose "Web app"
// 4. Set "Execute as" to "Me"
// 5. Set "Who has access" to "Anyone" (required for web forms)
// 6. Click "Deploy" and copy the Web App URL
// 7. Paste the URL below
//
// UPDATED GOOGLE APPS SCRIPT CODE (with CORS support):
// Replace your doPost function return statement with this:
//
// return ContentService
//   .createTextOutput(JSON.stringify({ result: 'success', row: nextRow }))
//   .setMimeType(ContentService.MimeType.JSON)
//   .setHeaders({
//     'Access-Control-Allow-Origin': '*',
//     'Access-Control-Allow-Methods': 'POST, OPTIONS',
//     'Access-Control-Allow-Headers': 'Content-Type'
//   });
//
// And add this doOptions function for CORS preflight:
// function doOptions() {
//   return ContentService
//     .createTextOutput('')
//     .setMimeType(ContentService.MimeType.JSON)
//     .setHeaders({
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Methods': 'POST, OPTIONS',
//       'Access-Control-Allow-Headers': 'Content-Type'
//     });
// }
//
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw-OML58IQbPy0mVe6zKU71qMns7dbW3mXWJhbY3yHpR8S3HQHGs_vUIxdh-BPqqDB9/exec';

// ============================================
// Popup Control Functions
// ============================================

/**
 * Show loader popup
 */
function showLoader() {
  const loader = document.getElementById('loader-popup');
  if (loader) {
    loader.classList.remove('hidden');
    loader.classList.add('flex', 'active');
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(loader, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    }
  }
}

/**
 * Hide loader popup
 */
function hideLoader() {
  const loader = document.getElementById('loader-popup');
  if (loader) {
    if (typeof gsap !== 'undefined') {
      gsap.to(loader, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          loader.classList.add('hidden');
          loader.classList.remove('flex', 'active');
        }
      });
    } else {
      loader.classList.add('hidden');
      loader.classList.remove('flex', 'active');
    }
  }
}

/**
 * Show success popup
 */
function showSuccessPopup() {
  const successPopup = document.getElementById('success-popup');
  if (successPopup) {
    successPopup.classList.remove('hidden');
    successPopup.classList.add('flex', 'active');
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(successPopup, 
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'power3.out' }
      );
    }
  }
}

/**
 * Hide success popup
 */
function hideSuccessPopup() {
  const successPopup = document.getElementById('success-popup');
  if (successPopup) {
    if (typeof gsap !== 'undefined') {
      gsap.to(successPopup, {
        scale: 0.9,
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          successPopup.classList.add('hidden');
          successPopup.classList.remove('flex', 'active');
        }
      });
    } else {
      successPopup.classList.add('hidden');
      successPopup.classList.remove('flex', 'active');
    }
  }
}

/**
 * Show error popup with message
 */
function showErrorPopup(message = 'Something went wrong. Please try again.') {
  const errorPopup = document.getElementById('error-popup');
  const errorMessage = document.getElementById('error-popup-message');
  if (errorMessage) {
    errorMessage.textContent = message;
  }
  if (errorPopup) {
    errorPopup.classList.remove('hidden');
    errorPopup.classList.add('flex', 'active');
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(errorPopup,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'power3.out' }
      );
    }
  }
}

/**
 * Hide error popup
 */
function hideErrorPopup() {
  const errorPopup = document.getElementById('error-popup');
  if (errorPopup) {
    if (typeof gsap !== 'undefined') {
      gsap.to(errorPopup, {
        scale: 0.9,
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          errorPopup.classList.add('hidden');
          errorPopup.classList.remove('flex', 'active');
        }
      });
    } else {
      errorPopup.classList.add('hidden');
      errorPopup.classList.remove('flex', 'active');
    }
  }
}

// Initialize popup close buttons
function initPopupCloseButtons() {
  const successClose = document.getElementById('success-popup-close');
  const errorClose = document.getElementById('error-popup-close');
  
  if (successClose) {
    successClose.addEventListener('click', hideSuccessPopup);
  }
  
  if (errorClose) {
    errorClose.addEventListener('click', hideErrorPopup);
  }
  
  // Close on overlay click
  const successPopup = document.getElementById('success-popup');
  const errorPopup = document.getElementById('error-popup');
  
  if (successPopup) {
    successPopup.addEventListener('click', (e) => {
      if (e.target === successPopup) {
        hideSuccessPopup();
      }
    });
  }
  
  if (errorPopup) {
    errorPopup.addEventListener('click', (e) => {
      if (e.target === errorPopup) {
        hideErrorPopup();
      }
    });
  }
}

// Initialize popup close buttons when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPopupCloseButtons);
} else {
  initPopupCloseButtons();
}

/**
 * Universal function to submit form data to Google Sheets
 * @param {HTMLFormElement} form - The form element to submit
 * @param {string} sheetName - The name of the Google Sheet tab to write to
 * @param {Object} options - Optional configuration
 * @param {Function} options.onSuccess - Callback function on successful submission
 * @param {Function} options.onError - Callback function on error
 * @param {Function} options.onComplete - Callback function after submission (success or error)
 */
async function submitToGoogleSheets(form, sheetName, options = {}) {
  // Validate inputs
  if (!form || !sheetName) {
    console.error('Form and sheetName are required');
    if (options.onError) options.onError('Form and sheet name are required');
    return;
  }

  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
    console.error('Google Script URL not configured. Please set GOOGLE_SCRIPT_URL in script.js');
    alert('Form submission is not configured. Please contact the administrator.');
    if (options.onError) options.onError('Google Script URL not configured');
    return;
  }

  // Get submit button
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn ? submitBtn.textContent : '';
  const originalBtnBg = submitBtn ? submitBtn.style.backgroundColor : '';
  const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
  const hasImage = submitBtn ? submitBtn.querySelector('img') : null;

  // Disable submit button and show loading state
  if (submitBtn) {
    submitBtn.disabled = true;
    // Only change text if button doesn't contain an image (for image buttons like footer arrow)
    const hasImage = submitBtn.querySelector('img');
    if (!hasImage) {
      submitBtn.textContent = 'Submitting...';
    } else {
      // For image buttons, just change opacity
      if (submitBtn.style) {
        submitBtn.style.opacity = '0.5';
      }
    }
    if (submitBtn.style) {
      submitBtn.style.cursor = 'not-allowed';
    }
  }

  // Show loader popup
  showLoader();

  try {
    // Collect form data
    const formData = new FormData(form);
    const data = {};

    // Convert FormData to object
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    // Add Date and Time in Indian format (IST - Indian Standard Time)
    // IST is UTC+5:30
    const now = new Date();
    
    // Get UTC time components
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    // Add IST offset (5 hours 30 minutes = 5.5 * 60 * 60 * 1000 milliseconds)
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(utcTime + istOffset);
    
    // Format Date as DD/MM/YYYY (Indian format)
    const day = String(istTime.getDate()).padStart(2, '0');
    const month = String(istTime.getMonth() + 1).padStart(2, '0');
    const year = istTime.getFullYear();
    data.Date = `${day}/${month}/${year}`;
    
    // Format Time as HH:MM:SS (24-hour format, IST)
    const hours = String(istTime.getHours()).padStart(2, '0');
    const minutes = String(istTime.getMinutes()).padStart(2, '0');
    const seconds = String(istTime.getSeconds()).padStart(2, '0');
    data.Time = `${hours}:${minutes}:${seconds}`;
    
    // Debug log to verify
    console.log('Date:', data.Date, 'Time:', data.Time);

    // Add sheetName to data
    data.sheetName = sheetName;

    // Convert data to URL-encoded format (as expected by Google Apps Script)
    const params = new URLSearchParams();
    Object.keys(data).forEach(key => {
      // Always include Date, Time, and sheetName even if empty
      if (key === 'Date' || key === 'Time' || key === 'sheetName') {
        params.append(key, data[key] || '');
      } else if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        params.append(key, data[key]);
      }
    });
    
    // Debug: Log all params being sent
    console.log('Form data being sent:', Object.fromEntries(params));
    console.log('Time value:', data.Time);
    console.log('Date value:', data.Date);

    // Try to send POST request with CORS first (if enabled in Google Apps Script)
    let response;
    let submissionSuccess = false;
    
    try {
      // Try with CORS enabled (if Google Apps Script has CORS headers)
      response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
      });

      if (response.ok) {
        const result = await response.json();
        if (result.result === 'success') {
          submissionSuccess = true;
        } else {
          throw new Error(result.error?.message || 'Submission failed');
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (corsError) {
      // If CORS fails, try with no-cors mode (assumes success if no network error)
      console.log('CORS not enabled, using no-cors mode:', corsError);
      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString()
        });
        // With no-cors, we assume success if no network error
        submissionSuccess = true;
      } catch (networkError) {
        throw networkError;
      }
    }

    if (!submissionSuccess) {
      throw new Error('Form submission failed');
    }

    // Hide loader
    hideLoader();

    // Close enquiry popup if it's open (for enquiry form)
    const isEnquiryForm = form.id === 'enquiry-form';
    if (isEnquiryForm) {
      const enquiryPopup = document.getElementById('enquiry-popup');
      const popupContent = document.getElementById('popup-content');
      if (enquiryPopup && !enquiryPopup.classList.contains('hidden')) {
        // Close popup with animation
        if (typeof gsap !== 'undefined' && popupContent) {
          gsap.to(popupContent, {
            scale: 0.9,
            opacity: 0,
            y: 50,
            duration: 0.3,
            ease: 'power2.in'
          });
          gsap.to(enquiryPopup, {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
            delay: 0.1,
            onComplete: () => {
              enquiryPopup.classList.remove('active', 'flex');
              enquiryPopup.classList.add('hidden');
              document.body.classList.remove('popup-open');
            }
          });
        } else {
          // Fallback: just hide it
          enquiryPopup.classList.add('hidden');
          enquiryPopup.classList.remove('flex', 'active');
          document.body.classList.remove('popup-open');
        }
      }
    }
    
    // ALL forms navigate to thank you page after successful submission
    // Small delay to allow any popups to close smoothly
    setTimeout(() => {
      window.location.href = 'thankyou.html';
    }, isEnquiryForm ? 400 : 300);

    // Call success callback
    if (options.onSuccess) {
      options.onSuccess(data);
    }

    // Note: onComplete callback won't execute since we navigate away
    // All forms navigate to thank you page after successful submission

  } catch (error) {
    console.error('Error submitting form to Google Sheets:', error);
    
    // Hide loader
    hideLoader();
    
    // Show error popup
    const errorMessage = error.message || 'There was an error submitting the form. Please try again later.';
    showErrorPopup(errorMessage);

    // Reset button immediately
    if (submitBtn) {
      // Restore button content (text or HTML with image)
      if (hasImage && originalBtnHtml) {
        submitBtn.innerHTML = originalBtnHtml;
      } else {
        submitBtn.textContent = originalBtnText;
      }
      submitBtn.style.backgroundColor = originalBtnBg;
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      submitBtn.style.cursor = '';
    }

    // Call error callback
    if (options.onError) {
      options.onError(error);
    }

    if (options.onComplete) {
      options.onComplete(false);
    }
  }
}

/**
 * Initialize form submission for a specific form
 * @param {string} formSelector - CSS selector for the form
 * @param {string} sheetName - Name of the Google Sheet tab
 * @param {Object} options - Optional callbacks
 */
function initFormSubmission(formSelector, sheetName, options = {}) {
  const form = document.querySelector(formSelector);
  if (!form) {
    console.warn(`Form not found: ${formSelector}`);
    return;
  }

  console.log(`Form initialized: ${formSelector} with sheet: ${sheetName}`);

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Basic validation
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    console.log(`Submitting form: ${formSelector} to sheet: ${sheetName}`);
    
    // Submit to Google Sheets
    await submitToGoogleSheets(form, sheetName, options);
  });
}

// ============================================
// Enquiry Popup Modal Functionality
// ============================================

// Initialize popup when DOM is ready
function initEnquiryPopup() {
  const enquiryPopup = document.getElementById('enquiry-popup');
  const popupContent = document.getElementById('popup-content');
  const popupOverlay = document.getElementById('popup-overlay');
  const popupCloseBtn = document.getElementById('popup-close-btn');
  const enquiryForm = document.getElementById('enquiry-form');
  const enquiryTriggers = document.querySelectorAll('.enquiry-popup-trigger');

  if (!enquiryPopup || !popupContent) {
    return; // Popup elements don't exist, skip initialization
  }

  let isPopupOpen = false;

  // Open popup function
  function openEnquiryPopup() {
    if (isPopupOpen) return;
    
    isPopupOpen = true;
    enquiryPopup.classList.remove('hidden');
    enquiryPopup.classList.add('flex');
    document.body.classList.add('popup-open');
    
    // GSAP animation for popup (if GSAP is available)
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(enquiryPopup,
        { opacity: 0 },
        { 
          opacity: 1, 
          duration: 0.3, 
          ease: 'power2.out',
          onComplete: () => {
            enquiryPopup.classList.add('active');
          }
        }
      );
      
      gsap.fromTo(popupContent,
        { 
          scale: 0.9, 
          opacity: 0, 
          y: 50 
        },
        { 
          scale: 1, 
          opacity: 1, 
          y: 0, 
          duration: 0.4, 
          ease: 'power3.out',
          delay: 0.1
        }
      );
    } else {
      // Fallback if GSAP is not loaded
      enquiryPopup.classList.add('active');
    }
    
    // Focus on first input for accessibility
    setTimeout(() => {
      const firstInput = enquiryForm.querySelector('input');
      if (firstInput) {
        firstInput.focus();
      }
    }, 500);
  }

  // Close popup function
  function closeEnquiryPopup() {
    if (!isPopupOpen) return;
    
    isPopupOpen = false;
    
    // GSAP animation for closing (if GSAP is available)
    if (typeof gsap !== 'undefined') {
      gsap.to(popupContent, {
        scale: 0.9,
        opacity: 0,
        y: 50,
        duration: 0.3,
        ease: 'power2.in'
      });
      
      gsap.to(enquiryPopup, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        delay: 0.1,
        onComplete: () => {
          enquiryPopup.classList.remove('active', 'flex');
          enquiryPopup.classList.add('hidden');
          document.body.classList.remove('popup-open');
          // Reset form
          enquiryForm.reset();
        }
      });
    } else {
      // Fallback if GSAP is not loaded
      enquiryPopup.classList.remove('active', 'flex');
      enquiryPopup.classList.add('hidden');
      document.body.classList.remove('popup-open');
      enquiryForm.reset();
    }
  }

  // Event listeners for trigger buttons
  enquiryTriggers.forEach(trigger => {
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      // If it's a link, prevent default navigation
      if (this.tagName === 'A') {
        e.preventDefault();
      }
      
      // Close mobile menu if open
      if (typeof closeMobileMenu === 'function' && typeof isMenuOpen !== 'undefined' && isMenuOpen) {
        closeMobileMenu();
      }
      
      openEnquiryPopup();
    });
  });

  // Close button event listener
  if (popupCloseBtn) {
    popupCloseBtn.addEventListener('click', closeEnquiryPopup);
  }

  // Close on overlay click
  if (popupOverlay) {
    popupOverlay.addEventListener('click', closeEnquiryPopup);
  }

  // Close on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isPopupOpen) {
      closeEnquiryPopup();
    }
  });

  // Form submission handler - using universal Google Sheets function
  if (enquiryForm) {
    enquiryForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Basic validation
      if (!enquiryForm.checkValidity()) {
        enquiryForm.reportValidity();
        return;
      }

      // Submit to Google Sheets with sheet name "Sheet1"
      // Navigation to thank you page is handled in submitToGoogleSheets function
      await submitToGoogleSheets(enquiryForm, 'Sheet1', {
        onSuccess: (data) => {
          console.log('Enquiry form submitted successfully:', data);
        },
        onError: (error) => {
          console.error('Error submitting enquiry form:', error);
        }
      });
    });
  }

  // Prevent popup content click from closing popup
  popupContent.addEventListener('click', function(e) {
    e.stopPropagation();
  });
}

// Initialize popup when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEnquiryPopup);
} else {
  initEnquiryPopup();
}

// ============================================
// Section 3 Tab Functionality
// ============================================
function initSec3Tabs() {
  const sec3Img = document.getElementById('sec3-img');
  const sec3Tabs = document.querySelectorAll('.sec3-tab');
  
  if (!sec3Img || sec3Tabs.length === 0) {
    return; // Elements don't exist, skip initialization
  }

  const sec3Images = [
    'img/s3/s3-i1.png', // Tab 0 - First tab uses existing image
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&h=1080&fit=crop', // Tab 1
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&h=1080&fit=crop', // Tab 2
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1920&h=1080&fit=crop'  // Tab 3
  ];

  // Initialize first tab as active
  let activeTabIndex = 0;

  // Function to update active tab
  function updateSec3Tab(tabIndex) {
    if (tabIndex === activeTabIndex) return;
    
    sec3Tabs.forEach(tab => {
      tab.classList.remove('border-b-[1px]', 'border-[#EE8F76]');
    });

    if (sec3Tabs[tabIndex]) {
      sec3Tabs[tabIndex].classList.add('border-b-[1px]', 'border-[#EE8F76]');
    }

    if (sec3Img && sec3Images[tabIndex]) {
      sec3Img.style.opacity = '0';
      setTimeout(() => {
        sec3Img.src = sec3Images[tabIndex];
        sec3Img.style.opacity = '1';
      }, 300);
    }

    activeTabIndex = tabIndex;
  }

  // Add click event listeners to tabs
  sec3Tabs.forEach((tab, index) => {
    tab.addEventListener('click', function() {
      updateSec3Tab(index);
    });
  });
}

// Initialize Section 3 tabs when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSec3Tabs);
} else {
  initSec3Tabs();
}

// Initialize animations when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnimations);
} else {
  initAnimations();
}

// ============================================
// Initialize All Form Submissions
// ============================================
function initAllForms() {
  // Initialize "Request a Call Back" form
  // Using "Sheet1" to match other forms
  initFormSubmission('#callback-form', 'Sheet1', {
    onSuccess: (data) => {
      console.log('Callback form submitted successfully:', data);
    },
    onError: (error) => {
      console.error('Error submitting callback form:', error);
    }
  });

  // Enquiry form is already initialized in initEnquiryPopup()
  // It uses sheet name: "Sheet1"

  // Initialize footer email form with special handling
  const footerEmailForm = document.getElementById('footer-email-form');
  if (footerEmailForm) {
    footerEmailForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Basic validation
      if (!footerEmailForm.checkValidity()) {
        footerEmailForm.reportValidity();
        return;
      }

      // Get email from form
      const emailInput = document.getElementById('footer-email-input');
      const email = emailInput ? emailInput.value.trim() : '';

      if (!email) {
        return;
      }

      // Add hidden fields to the form for Name, Phone, and Message
      // Check if they already exist to avoid duplicates
      let nameField = footerEmailForm.querySelector('input[name="Name"]');
      if (!nameField) {
        nameField = document.createElement('input');
        nameField.type = 'hidden';
        nameField.name = 'Name';
        footerEmailForm.appendChild(nameField);
      }
      nameField.value = '';

      let phoneField = footerEmailForm.querySelector('input[name="Phone"]');
      if (!phoneField) {
        phoneField = document.createElement('input');
        phoneField.type = 'hidden';
        phoneField.name = 'Phone';
        footerEmailForm.appendChild(phoneField);
      }
      phoneField.value = '';

      let messageField = footerEmailForm.querySelector('input[name="Message"], textarea[name="Message"]');
      if (!messageField) {
        messageField = document.createElement('input');
        messageField.type = 'hidden';
        messageField.name = 'Message';
        footerEmailForm.appendChild(messageField);
      }
      messageField.value = 'bottom enquiry';

      // Submit using the same function - will navigate to thank you page on success
      await submitToGoogleSheets(footerEmailForm, 'Sheet1', {
        onSuccess: (data) => {
          console.log('Footer email form submitted successfully:', data);
        },
        onError: (error) => {
          console.error('Error submitting footer email form:', error);
        }
      });
    });
  }
}

// Initialize forms when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllForms);
} else {
  initAllForms();
}