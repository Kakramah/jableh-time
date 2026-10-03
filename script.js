document.addEventListener('DOMContentLoaded', () => {
    const wrenchContainer = document.getElementById('wrench-container');
    const wrenchShadowRotator = document.getElementById('wrench-shadow-rotator');
    const chapters = document.querySelectorAll('.chapter');
    const chaptersWrapper = document.getElementById('chapters-wrapper');
    
    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Angles for the 4 chapters: 12, 3, 6, 9 o'clock
    const startAngle = -90;
    const totalRotation = 270; // 3 steps of 90 degrees
    
    function updateWrench() {
        if (!wrenchContainer || !wrenchShadowRotator || !chaptersWrapper) return;
        
        let targetAngle = startAngle;
        
        if (prefersReducedMotion) {
            // Discrete steps
            let activeIndex = 0;
            chapters.forEach((chapter, index) => {
                const rect = chapter.getBoundingClientRect();
                // If chapter top is above the middle of the screen
                if (rect.top < window.innerHeight / 2) {
                    activeIndex = index;
                }
            });
            targetAngle = startAngle + (activeIndex * 90);
        } else {
            // Smooth progress based on chapters-wrapper scroll
            const rect = chaptersWrapper.getBoundingClientRect();
            // Total scrollable distance for the wrapper
            // When top of wrapper is at center of screen -> progress 0
            // When bottom of wrapper is at center of screen -> progress 1
            const startScrollY = window.innerHeight / 2;
            
            // To make the rotation sync well with reading, we can measure how far we scrolled through the wrapper
            const totalScrollable = rect.height - window.innerHeight;
            let progress = -rect.top / totalScrollable;
            
            // Clamp progress between 0 and 1
            progress = Math.max(0, Math.min(1, progress));
            
            targetAngle = startAngle + (progress * totalRotation);
        }
        
        // Update rotation on both the wrench and its translated shadow
        const transformString = `rotate(${targetAngle}deg)`;
        wrenchContainer.style.transform = transformString;
        wrenchShadowRotator.style.transform = transformString;
        
        // Update active class for chapters to fade them in
        chapters.forEach(chapter => {
            const rect = chapter.getBoundingClientRect();
            // Active if the center of the chapter is in the viewport
            if (rect.top < window.innerHeight * 0.75 && rect.bottom > window.innerHeight * 0.25) {
                chapter.classList.add('is-active');
            } else {
                chapter.classList.remove('is-active');
            }
        });
    }
    
    // Initial update
    updateWrench();
    
    // Use requestAnimationFrame for smooth scrolling
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateWrench();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Share button functionality
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'النظام يختصر الوقت',
                        text: 'كل خدمةٍ مُنظَّمة... تعيد لجبلة إيقاعها.',
                        url: window.location.href
                    });
                } catch (err) {
                    console.log('Error sharing', err);
                }
            } else {
                navigator.clipboard.writeText(window.location.href).then(() => {
                    alert('تم نسخ الرابط!');
                });
            }
        });
    }
});
