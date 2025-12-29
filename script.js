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
    navbar.classList.remove('absolute', 'top-4', 'md:top-10');
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
    navbar.classList.add('absolute', 'top-4', 'md:top-10');
    
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

// Slider data with Unsplash images
const sliderData = [
  {
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920&h=1080&fit=crop',
    subtitle: 'Forbes Global Properties',
    title: 'A Global Standard. Now in India.',
    description: 'Enjoy Mesmerizing Views From Almost Every Apartment',
    subheading: '3BHK & 4BHK Apartments.',
    features: [
      { icon: 'svgs/s1/prime-location.svg', text: 'Prime Location' },
      { icon: 'svgs/s1/smart-homes.svg', text: 'Smart Home Features' },
      { icon: 'svgs/s1/s1-amenities.svg', text: 'World Class Amenities' }
    ]
  },
  {
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&h=1080&fit=crop',
    subtitle: 'Luxury Living Redefined',
    title: 'Experience Unmatched Elegance',
    description: 'Premium Residences with Panoramic City Views',
    subheading: '2BHK, 3BHK & 4BHK Available.',
    features: [
      { icon: 'svgs/s1/prime-location.svg', text: 'Central Location' },
      { icon: 'svgs/s1/smart-homes.svg', text: 'Automated Systems' },
      { icon: 'svgs/s1/s1-amenities.svg', text: 'Premium Facilities' }
    ]
  },
  {
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&h=1080&fit=crop',
    subtitle: 'Forbes Global Properties',
    title: 'Where Luxury Meets Lifestyle',
    description: 'Spacious Interiors Designed for Modern Living',
    subheading: 'Premium 3BHK & 4BHK Residences.',
    features: [
      { icon: 'svgs/s1/prime-location.svg', text: 'Prime Location' },
      { icon: 'svgs/s1/smart-homes.svg', text: 'Smart Technology' },
      { icon: 'svgs/s1/s1-amenities.svg', text: 'Luxury Amenities' }
    ]
  },
  {
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1920&h=1080&fit=crop',
    subtitle: 'Elite Residences',
    title: 'Your Dream Home Awaits',
    description: 'Exclusive Properties with World-Class Design',
    subheading: '2BHK, 3BHK & 4BHK Options.',
    features: [
      { icon: 'svgs/s1/prime-location.svg', text: 'Strategic Location' },
      { icon: 'svgs/s1/smart-homes.svg', text: 'Home Automation' },
      { icon: 'svgs/s1/s1-amenities.svg', text: 'Elite Amenities' }
    ]
  },
  {
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&h=1080&fit=crop',
    subtitle: 'Forbes Global Properties',
    title: 'Redefining Urban Living',
    description: 'Contemporary Architecture with Timeless Appeal',
    subheading: 'Luxury 3BHK & 4BHK Apartments.',
    features: [
      { icon: 'svgs/s1/prime-location.svg', text: 'Prime Location' },
      { icon: 'svgs/s1/smart-homes.svg', text: 'Intelligent Homes' },
      { icon: 'svgs/s1/s1-amenities.svg', text: 'Premium Services' }
    ]
  }
];

let currentSlide = 0;
let sliderInterval;
const sliderIntervalTime = 5000; // 5 seconds

// Get slider elements
const sliderImage = document.getElementById('slider-image');
const sliderPagination = document.getElementById('slider-pagination');
const sliderSubtitle = document.getElementById('slider-subtitle');
const sliderTitle = document.getElementById('slider-title');
const sliderDescription = document.getElementById('slider-description');
const sliderSubheading = document.getElementById('slider-subheading');
const featureIcon1 = document.getElementById('feature-icon-1');
const featureIcon2 = document.getElementById('feature-icon-2');
const featureIcon3 = document.getElementById('feature-icon-3');
const featureText1 = document.getElementById('feature-text-1');
const featureText2 = document.getElementById('feature-text-2');
const featureText3 = document.getElementById('feature-text-3');

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

// Update slider content
function updateSlider(slideIndex) {
  const slide = sliderData[slideIndex];
  
  // Update image with fade effect
  if (sliderImage) {
    sliderImage.style.opacity = '0';
    setTimeout(() => {
      sliderImage.src = slide.image;
      sliderImage.alt = slide.title;
      sliderImage.style.opacity = '1';
    }, 300);
  }

  // Update content with fade effect
  if (sliderSubtitle) {
    gsap.to(sliderSubtitle, { opacity: 0, y: -10, duration: 0.3, onComplete: () => {
      sliderSubtitle.textContent = slide.subtitle;
      gsap.to(sliderSubtitle, { opacity: 1, y: 0, duration: 0.5 });
    }});
  }

  if (sliderTitle) {
    gsap.to(sliderTitle, { opacity: 0, y: -10, duration: 0.3, onComplete: () => {
      sliderTitle.textContent = slide.title;
      gsap.to(sliderTitle, { opacity: 1, y: 0, duration: 0.5 });
    }});
  }

  if (sliderDescription) {
    gsap.to(sliderDescription, { opacity: 0, y: -10, duration: 0.3, delay: 0.1, onComplete: () => {
      sliderDescription.textContent = slide.description;
      gsap.to(sliderDescription, { opacity: 1, y: 0, duration: 0.5 });
    }});
  }

  if (sliderSubheading) {
    gsap.to(sliderSubheading, { opacity: 0, y: -10, duration: 0.3, delay: 0.1, onComplete: () => {
      sliderSubheading.textContent = slide.subheading;
      gsap.to(sliderSubheading, { opacity: 1, y: 0, duration: 0.5 });
    }});
  }

  // Update features
  if (featureIcon1 && slide.features[0]) {
    featureIcon1.src = slide.features[0].icon;
    featureText1.textContent = slide.features[0].text;
  }
  if (featureIcon2 && slide.features[1]) {
    featureIcon2.src = slide.features[1].icon;
    featureText2.textContent = slide.features[1].text;
  }
  if (featureIcon3 && slide.features[2]) {
    featureIcon3.src = slide.features[2].icon;
    featureText3.textContent = slide.features[2].text;
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
  // Section 3 Animations
  // ============================================
  const sec3 = document.getElementById('sec3');
  if (sec3) {
    const sec3Heading = document.getElementById('sec3-heading');
    if (sec3Heading) {
      gsap.from(sec3Heading.children, {
        opacity: 0,
        y: 30,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
          trigger: sec3Heading,
          start: 'top 85%',
          end: 'top 60%',
          toggleActions: 'play none none none'
        },
        ease: 'power3.out'
      });
    }

    const sec3Content = document.getElementById('sec3-content');
    if (sec3Content) {
      const sec3ContentInner = document.getElementById('sec3-content-inner');
      if (sec3ContentInner) {
        const row1 = document.getElementById('sec3-content-row1');
        const row2 = document.getElementById('sec3-content-row2');
        const row3 = document.getElementById('sec3-content-row3');
        
        if (row1) {
          gsap.from(row1.children, {
            opacity: 0,
            x: -60,
            duration: 1.2,
            stagger: 0.15,
            scrollTrigger: {
              trigger: sec3Content,
              start: 'top 80%',
              end: 'top 50%',
              toggleActions: 'play none none none'
            },
            ease: 'power3.out'
          });
        }
        
        if (row2) {
          gsap.from(row2, {
            opacity: 0,
            x: -60,
            duration: 1.2,
            delay: 0.3,
            scrollTrigger: {
              trigger: sec3Content,
              start: 'top 80%',
              end: 'top 50%',
              toggleActions: 'play none none none'
            },
            ease: 'power3.out'
          });
        }
        
        if (row3) {
          gsap.from(row3, {
            opacity: 0,
            x: -60,
            duration: 1.2,
            delay: 0.5,
            scrollTrigger: {
              trigger: sec3Content,
              start: 'top 80%',
              end: 'top 50%',
              toggleActions: 'play none none none'
            },
            ease: 'power3.out'
          });
        }
      }
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

  // ============================================
  // Hover Animations - Cards and Text
  // ============================================
  
  // Function to animate text on hover with y-axis and fade effect
  function addHoverTextAnimation(element) {
    if (!element) return;
    
    // Find all text elements (p, h1, h2, h3, h4, h5, h6, span, a, li) within the element
    const textElements = element.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, li, button');
    
    if (textElements.length === 0) return;
    
    // Set initial state for text elements
    gsap.set(textElements, { opacity: 1, y: 0 });
    
    // Store original positions
    const originalPositions = Array.from(textElements).map(el => ({
      element: el,
      y: gsap.getProperty(el, 'y') || 0
    }));
    
    element.addEventListener('mouseenter', () => {
      textElements.forEach((textEl, index) => {
        gsap.fromTo(textEl, 
          {
            opacity: 0.3,
            y: 20
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            delay: index * 0.05,
            ease: 'power2.out'
          }
        );
      });
    });
    
    element.addEventListener('mouseleave', () => {
      textElements.forEach((textEl) => {
        gsap.to(textEl, {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    });
  }

  // Animate buttons on hover with GSAP
  const buttons = document.querySelectorAll('button, a[href="#"]');
  buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      gsap.to(button, {
        scale: 1.05,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    
    button.addEventListener('mouseleave', () => {
      gsap.to(button, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
  });

  // ============================================
  // Section 2 Hover Animations
  // ============================================
  // Section 2 Cards
  const sec2Card1 = document.getElementById('sec2-card1');
  const sec2Card2 = document.getElementById('sec2-card2');
  if (sec2Card1) addHoverTextAnimation(sec2Card1);
  if (sec2Card2) addHoverTextAnimation(sec2Card2);
  
  // Section 2 Row 2 Cards
  const sec2Row2LeftBottomCard = document.getElementById('sec2-row2-left-bottom-card');
  const sec2Row2RightTopLeft = document.getElementById('sec2-row2-right-top-left');
  const sec2Row2RightTopRight = document.getElementById('sec2-row2-right-top-right');
  const sec2Row2RightBottom = document.getElementById('sec2-row2-right-bottom');
  if (sec2Row2LeftBottomCard) addHoverTextAnimation(sec2Row2LeftBottomCard);
  if (sec2Row2RightTopLeft) addHoverTextAnimation(sec2Row2RightTopLeft);
  if (sec2Row2RightTopRight) addHoverTextAnimation(sec2Row2RightTopRight);
  if (sec2Row2RightBottom) addHoverTextAnimation(sec2Row2RightBottom);
  
  // Section 2 Left Content (text container)
  const sec2LeftContent = document.getElementById('sec2-left-content');
  if (sec2LeftContent) {
    const leftContentTexts = sec2LeftContent.querySelectorAll('p, h2, a');
    if (leftContentTexts.length > 0) {
      sec2LeftContent.addEventListener('mouseenter', () => {
        gsap.fromTo(leftContentTexts,
          {
            opacity: 0.5,
            y: 15
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power2.out'
          }
        );
      });
    }
  }
  
  // Section 2 Row 2 Left Top
  const sec2Row2LeftTop = document.getElementById('sec2-row2-left-top');
  if (sec2Row2LeftTop) {
    const row2LeftTopTexts = sec2Row2LeftTop.querySelectorAll('p, h2');
    if (row2LeftTopTexts.length > 0) {
      sec2Row2LeftTop.addEventListener('mouseenter', () => {
        gsap.fromTo(row2LeftTopTexts,
          {
            opacity: 0.5,
            y: 15
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out'
          }
        );
      });
    }
  }

  // ============================================
  // Section 3 Hover Animations
  // ============================================
  const sec3Heading = document.getElementById('sec3-heading');
  if (sec3Heading) {
    const sec3HeadingTexts = sec3Heading.querySelectorAll('p, h2');
    if (sec3HeadingTexts.length > 0) {
      sec3Heading.addEventListener('mouseenter', () => {
        gsap.fromTo(sec3HeadingTexts,
          {
            opacity: 0.5,
            y: 15
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out'
          }
        );
      });
    }
  }
  
  const sec3Content = document.getElementById('sec3-content');
  if (sec3Content) {
    const sec3ContentTexts = sec3Content.querySelectorAll('p, h2, h3');
    if (sec3ContentTexts.length > 0) {
      sec3Content.addEventListener('mouseenter', () => {
        gsap.fromTo(sec3ContentTexts,
          {
            opacity: 0.4,
            y: 20
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power2.out'
          }
        );
      });
    }
  }

  // ============================================
  // Section 4 Hover Animations
  // ============================================
  // Section 4 Featured Content
  const sec4FeaturedContent = document.getElementById('sec4-featured-content');
  if (sec4FeaturedContent) {
    const featuredTexts = sec4FeaturedContent.querySelectorAll('p, h2, h3, li, button');
    if (featuredTexts.length > 0) {
      sec4FeaturedContent.addEventListener('mouseenter', () => {
        gsap.fromTo(featuredTexts,
          {
            opacity: 0.4,
            y: 20
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.05,
            ease: 'power2.out'
          }
        );
      });
    }
  }
  
  // Section 4 Cards
  const sec4Card1 = document.getElementById('sec4-card1');
  const sec4Card2 = document.getElementById('sec4-card2');
  const sec4Card3 = document.getElementById('sec4-card3');
  if (sec4Card1) addHoverTextAnimation(sec4Card1);
  if (sec4Card2) addHoverTextAnimation(sec4Card2);
  if (sec4Card3) addHoverTextAnimation(sec4Card3);
  
  // Section 4 Form
  const sec4Form = document.getElementById('sec4-form');
  if (sec4Form) {
    const formTexts = sec4Form.querySelectorAll('p, input, button');
    if (formTexts.length > 0) {
      sec4Form.addEventListener('mouseenter', () => {
        gsap.fromTo(formTexts,
          {
            opacity: 0.5,
            y: 15
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.05,
            ease: 'power2.out'
          }
        );
      });
    }
  }

  // ============================================
  // Footer Hover Animations
  // ============================================
  const footerCol1 = document.getElementById('footer-col1');
  const footerCol2 = document.getElementById('footer-col2');
  const footerCol3 = document.getElementById('footer-col3');
  const footerCol4 = document.getElementById('footer-col4');
  
  if (footerCol1) {
    const col1Texts = footerCol1.querySelectorAll('p, input, li');
    if (col1Texts.length > 0) {
      footerCol1.addEventListener('mouseenter', () => {
        gsap.fromTo(col1Texts,
          {
            opacity: 0.5,
            y: 15
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.05,
            ease: 'power2.out'
          }
        );
      });
    }
  }
  
  if (footerCol2) {
    const col2Texts = footerCol2.querySelectorAll('p, li');
    if (col2Texts.length > 0) {
      footerCol2.addEventListener('mouseenter', () => {
        gsap.fromTo(col2Texts,
          {
            opacity: 0.5,
            y: 15
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.05,
            ease: 'power2.out'
          }
        );
      });
    }
  }
  
  if (footerCol3) {
    const col3Texts = footerCol3.querySelectorAll('p, li');
    if (col3Texts.length > 0) {
      footerCol3.addEventListener('mouseenter', () => {
        gsap.fromTo(col3Texts,
          {
            opacity: 0.5,
            y: 15
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.05,
            ease: 'power2.out'
          }
        );
      });
    }
  }
  
  if (footerCol4) {
    const col4Texts = footerCol4.querySelectorAll('p, li, div');
    if (col4Texts.length > 0) {
      footerCol4.addEventListener('mouseenter', () => {
        gsap.fromTo(col4Texts,
          {
            opacity: 0.5,
            y: 15
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.05,
            ease: 'power2.out'
          }
        );
      });
    }
  }
  
  // Footer Row 1
  const footerRow1 = document.getElementById('footer-row1');
  if (footerRow1) {
    const row1Texts = footerRow1.querySelectorAll('p');
    if (row1Texts.length > 0) {
      footerRow1.addEventListener('mouseenter', () => {
        gsap.fromTo(row1Texts,
          {
            opacity: 0.5,
            y: 15
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out'
          }
        );
      });
    }
  }
}

// Initialize animations when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnimations);
} else {
  initAnimations();
}

