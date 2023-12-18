function sliderFunction(element, { parallax, duration = 700 }) { 
    
    const wrapper = element.querySelector('.slider-wrapper');
    const slides = element.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    let currentIndex = 0;
    let isDragging = false;
    let isTransitioning = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID = 0;
    let alignLeft = 0;
    let alignRight = 0;
    let previousIndex = 0; 
    let startX, startY;
    

    const getPositionX = (event) => {
        if (event.type.includes('mouse')) {
            return event.pageX;
        } else if (event.touches && event.touches.length > 0) {
            return event.touches[0].clientX;
        }
        return 0; // Fallback value in case there is no touch or mouse position
    };
    
    const setSliderPosition = () => wrapper.style.transform = `translateX(${currentTranslate}px)`;
    
    const moveToSlide = (index) => {
        if (!isTransitioning && currentIndex !== index) {
            isTransitioning = true;
            
            updateActiveSlideAttribute(index);
        
            currentIndex = index;
            currentTranslate = -index * wrapper.offsetWidth;
            prevTranslate = currentTranslate;
            setSliderPosition();
            updatePagination(index);
            updateButtonStates();
            
            if (parallax) {
                applyParallaxEffect(currentIndex);
            }

            setTimeout(() => {
                isTransitioning = false;
                if (previousIndex >= 0) {
                    const previousSlide = slides[previousIndex];
                    if (previousSlide) {
                        previousSlide.style.visibility = 'hidden';
                    }
                }
                previousIndex = currentIndex; // Update the previous index
            }, duration);
        } else {
            currentTranslate = -currentIndex * wrapper.offsetWidth;
            prevTranslate = currentTranslate;
            setSliderPosition();
        }
    };

    function calculateAlignmentDistances() {
        console.log("calculateAlignmentDistances called");
        const activeSlide = element.querySelector('.slide[data-active]'); // Assuming all slides have the same dimensions
        const sampleImage = activeSlide.querySelector('.item-image');
    
        if (activeSlide && sampleImage) {
            const imageRect = sampleImage.getBoundingClientRect();
            const sliderRect = activeSlide.getBoundingClientRect();
    
            // Calculate distances
            alignLeft = imageRect.left - sliderRect.left;
            alignRight = sliderRect.right - imageRect.right;
    
        }
    }
    
    const applyParallaxEffect = (currentIndex) => {
        console.log(currentIndex);
        const slidesArray = Array.from(slides);
    
        slidesArray.forEach((slide) => {
            const image = slide.querySelector('.item-image');
            const bgImage = slide.querySelector('.bg-image');
            const slideIndex = parseInt(slide.getAttribute('data-index'), 10);
    
            if (slideIndex < currentIndex) {
                // const translateDistance = sliderRect.right - imageRect.right;
                image.style.transform = `translateX(${alignRight}px)`;
                bgImage.style.transform = 'translateX(0) scale(0.9)';
                
            } else if (slideIndex > currentIndex) {
                // const translateDistance = imageRect.left - sliderRect.left;
                image.style.transform = `translateX(-${alignLeft}px)`;
                bgImage.style.transform = 'translateX(0) scale(0.9)';
            } else {
                image.style.transform = '';
                bgImage.style.transform = '';
            }
        });
    };

    const updateActiveSlideAttribute = (index = 0) => {
        slides.forEach((slide, slideIndex) => {
            if (slideIndex === index) {
                slide.setAttribute('data-active', 'true');
                slide.style.visibility = 'visible'; // Set the new active slide to visible
            } else {
                slide.removeAttribute('data-active');
            }
        });
    }

    const updatePagination = index => {
        document.querySelectorAll('.pagination-dot').forEach((dot, idx) => {
            dot.classList.toggle('active-dot', idx === index);
        });
    };
    
    const createPaginationDots = () => {
        const paginationContainer = document.getElementById('pagination');
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = 'pagination-dot';
            // dot.addEventListener('click', () => moveToSlide(index));
            paginationContainer.appendChild(dot);
        });

        updatePagination(0);
        updateButtonStates();
    };
    
    const initNavigationButtons = () => {
    
        const handlePrevClick = () => {
            if (prevBtn.disabled) return; // Check if the button is disabled
            let newIndex = currentIndex > 0 ? currentIndex - 1 : slides.length - 1;
            moveToSlide(newIndex);
        };
    
        const handleNextClick = () => {
            if (nextBtn.disabled) return; // Check if the button is disabled
            let newIndex = currentIndex < slides.length - 1 ? currentIndex + 1 : 0;
            moveToSlide(newIndex);
        };
    
        // For desktop
        prevBtn.addEventListener('click', handlePrevClick);
        nextBtn.addEventListener('click', handleNextClick);
    
        // For mobile
        prevBtn.addEventListener('touchstart', handlePrevClick);
        nextBtn.addEventListener('touchstart', handleNextClick);

    };
    
    const updateButtonStates = () => {
        console.log("called updateButtonStates");
    
        if (currentIndex === 0) {
            // Disable Previous Button if on the first slide
            prevBtn.disabled = true;
        } else {
            // Enable Previous Button otherwise
            prevBtn.disabled = false;
        }
    
        if (currentIndex === slides.length - 1) {
            // Disable Next Button if on the last slide
            nextBtn.disabled = true;
        } else {
            // Enable Next Button otherwise
            nextBtn.disabled = false;
        }
    }

    const handleDragStart = (event) => {
        if (isTransitioning || (event.type === 'mousedown' && event.button !== 0)) {
            return;
        }
        isDragging = true;
        const touch = event.touches ? event.touches[0] : event;
        startX = touch.clientX;
        startY = touch.clientY;
        startPos = getPositionX(event);
        animationID = requestAnimationFrame(animation);

        element.addEventListener('mousemove', handleDragMove);
        element.addEventListener('touchmove', handleDragMove);

        // event.preventDefault();
    };

    const handleDragMove = (event) => {
        console.log("handleDragMove called");
        if (!isDragging || isTransitioning) {
            setSliderPosition();
            return;
        }
        const currentPosition = getPositionX(event);
        currentTranslate = prevTranslate + currentPosition - startPos;
        setSliderPosition();
    };

    const handleDragEnd = (event) => {
        if (isTransitioning || !isDragging) {
            return;
        }
    
        isDragging = false;
        cancelAnimationFrame(animationID);
    
        const touch = event.changedTouches ? event.changedTouches[0] : event;
        const endX = touch.clientX;
        const endY = touch.clientY;
        const diffX = endX - startX;
        const diffY = endY - startY;
        const movedBy = currentTranslate - prevTranslate;
    
        element.removeEventListener('mousemove', handleDragMove);
        element.removeEventListener('touchmove', handleDragMove);
    
        // Determine if the action is a horizontal swipe
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Swipe detected: Check for slide change
            if (movedBy < -50 && currentIndex < slides.length - 1) {
                moveToSlide(currentIndex + 1);
            } else if (movedBy > 50 && currentIndex > 0) {
                moveToSlide(currentIndex - 1);
            } else {
                // No slide change: Reset the currentTranslate to its original position
                currentTranslate = -currentIndex * wrapper.offsetWidth;
                setSliderPosition();
            }
        } else {
            // Vertical movement: allow default scroll behavior and reset translate
            console.log("Scrolling, do nothing special");
            currentTranslate = -currentIndex * wrapper.offsetWidth;
            setSliderPosition();
        }
    };
    
    function goToSlide(index) {
        isDragging = false;
        
        moveToSlide(index);
    }

    const animation = () => {
        setSliderPosition();
        if (isDragging) requestAnimationFrame(animation);
    };

    let paginationDots = document.querySelectorAll('.pagination-dot');
    
    // paginationDots.forEach((dot, index) => {
    //     dot.addEventListener('click', (event) => {
    //         event.stopPropagation();
    //         goToSlide(index);
    //     });
    // });
    
    element.addEventListener('touchstart', handleDragStart, { passive: true });
    element.addEventListener('mousedown', handleDragStart);
    element.addEventListener('touchend', handleDragEnd, { passive: true });
    element.addEventListener('mouseup', handleDragEnd);
    
    window.addEventListener('resize', handleDragEnd);
    window.addEventListener('resize', calculateAlignmentDistances);

    createPaginationDots();
    updateButtonStates();
    initNavigationButtons();
    updateActiveSlideAttribute();

    calculateAlignmentDistances();
    
    if (parallax) applyParallaxEffect(0);
};
