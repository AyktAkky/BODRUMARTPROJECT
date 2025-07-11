document.addEventListener('DOMContentLoaded', () => {
  // Modern Event Cards Carousel - Single Card Display
  const track = document.querySelector('.events-track');
  const cards = document.querySelectorAll('.modern-event-card');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  const indicators = document.querySelectorAll('.indicator');
  
  let currentIndex = 0;
  let isTransitioning = false;
  
  // getVisibleCards kaldırıldı – tek kart varsayımı JS içinde sabit
  
  // Update carousel position for single card display
  function updateCarousel() {
    if (isTransitioning) return;
    
    isTransitioning = true;
    const offset = currentIndex * -100;
    track.style.transform = `translateX(${offset}%)`;
    
    // Update indicators
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === currentIndex);
    });
    
    // Update cards active state
    cards.forEach((card, index) => {
      card.classList.toggle('active', index === currentIndex);
    });
    
    // Update button states
    const maxIndex = cards.length - 1;
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxIndex;
    
    setTimeout(() => {
      isTransitioning = false;
    }, 800);
  }
  
  // Go to specific slide
  function goToSlide(index) {
    const maxIndex = cards.length - 1;
    if (index < 0 || index > maxIndex || isTransitioning) return;
    currentIndex = index;
    updateCarousel();
  }
  
  // Navigation event listeners
  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      goToSlide(currentIndex - 1);
    }
  });
  
  nextBtn.addEventListener('click', () => {
    const maxIndex = cards.length - 1;
    if (currentIndex < maxIndex) {
      goToSlide(currentIndex + 1);
    }
  });
  
  // Indicator navigation
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      goToSlide(index);
    });
  });
  
  // Touch/Swipe support
  let startX = 0;
  let currentX = 0;
  let isDragging = false;
  
  track.addEventListener('touchstart', (e) => {
    if (isTransitioning) return;
    startX = e.touches[0].clientX;
    isDragging = true;
    track.style.cursor = 'grabbing';
  });
  
  track.addEventListener('touchmove', (e) => {
    if (!isDragging || isTransitioning) return;
    e.preventDefault();
    currentX = e.touches[0].clientX;
    
    // Add visual feedback during drag
    const diff = currentX - startX;
    const currentOffset = currentIndex * -100;
    const dragOffset = (diff / window.innerWidth) * 100;
    track.style.transform = `translateX(${currentOffset + dragOffset}%)`;
  }, { passive: false });
  
  track.addEventListener('touchend', () => {
    if (!isDragging || isTransitioning) return;
    isDragging = false;
    track.style.cursor = 'grab';
    
    const diff = startX - currentX;
    const threshold = window.innerWidth * 0.2;
    const maxIndex = cards.length - 1;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentIndex < maxIndex) {
        goToSlide(currentIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        goToSlide(currentIndex - 1);
      } else {
        updateCarousel();
      }
    } else {
      updateCarousel();
    }
  });
  
  // Mouse drag support
  track.addEventListener('mousedown', (e) => {
    if (isTransitioning) return;
    startX = e.clientX;
    isDragging = true;
    track.style.cursor = 'grabbing';
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isDragging || isTransitioning) return;
    e.preventDefault();
    currentX = e.clientX;
    
    const diff = currentX - startX;
    const currentOffset = currentIndex * -100;
    const dragOffset = (diff / window.innerWidth) * 100;
    track.style.transform = `translateX(${currentOffset + dragOffset}%)`;
  });
  
  document.addEventListener('mouseup', () => {
    if (!isDragging || isTransitioning) return;
    isDragging = false;
    track.style.cursor = 'grab';
    
    const diff = startX - currentX;
    const threshold = window.innerWidth * 0.2;
    const maxIndex = cards.length - 1;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentIndex < maxIndex) {
        goToSlide(currentIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        goToSlide(currentIndex - 1);
      } else {
        updateCarousel();
      }
    } else {
      updateCarousel();
    }
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (isTransitioning) return;
    
    const maxIndex = cards.length - 1;
    
    if (e.key === 'ArrowLeft' && currentIndex > 0) {
      goToSlide(currentIndex - 1);
    } else if (e.key === 'ArrowRight' && currentIndex < maxIndex) {
      goToSlide(currentIndex + 1);
    }
  });
  
  // Auto-play functionality - 5 saniye
  let autoPlayInterval;
  const autoPlayDelay = 5000; // 5 saniye
  
  function startAutoPlay() {
    stopAutoPlay();
    autoPlayInterval = setInterval(() => {
      const maxIndex = cards.length - 1;
      if (currentIndex < maxIndex) {
        goToSlide(currentIndex + 1);
      } else {
        goToSlide(0); // İlk karta dön
      }
    }, autoPlayDelay);
  }
  
  function stopAutoPlay() {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
    }
  }
  
  // Pause auto-play on hover
  track.addEventListener('mouseenter', stopAutoPlay);
  track.addEventListener('mouseleave', startAutoPlay);
  
  // Pause auto-play on touch
  track.addEventListener('touchstart', stopAutoPlay);
  
  // Initialize carousel
  updateCarousel();
  startAutoPlay();
  
  // Handle window resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      updateCarousel();
    }, 250);
  });
  
  // Add cursor style
  track.style.cursor = 'grab';
  
  // Image loading effect
  const images = document.querySelectorAll('.event-image img');
  images.forEach(img => {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', function() {
        this.classList.add('loaded');
      });
    }
  });
  
  // Smooth scroll for navigation links
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
}); 