import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDarkModeClass } from '../../utils/darkModeUtils';
import "../Component/Gallery/gallery_belly";

const ImageGallery = ({ media, darkMode }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const thumbnailContainerRef = useRef(null);
  const thumbnailRefs = useRef([]);

  // Scroll to current thumbnail when index changes
  useEffect(() => {
    if (thumbnailContainerRef.current && thumbnailRefs.current[currentIndex]) {
      const thumbnail = thumbnailRefs.current[currentIndex];
      const container = thumbnailContainerRef.current;
      const containerHeight = container.offsetHeight;
      const thumbnailTop = thumbnail.offsetTop;
      const thumbnailHeight = thumbnail.offsetHeight;

      const scrollTo = thumbnailTop - (containerHeight / 2) + (thumbnailHeight / 2);

      container.scrollTo({
        top: scrollTo,
        behavior: 'smooth',
      });
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowUp') {
        goToPrevious();
      } else if (event.key === 'ArrowDown') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? media.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) =>
      prevIndex === media.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const scrollThumbnails = (scrollOffset) => {
    if (thumbnailContainerRef.current) {
      thumbnailContainerRef.current.scrollBy({
        top: scrollOffset,
        behavior: 'smooth',
      });
    }
  };

  // Animation variants
  const mediaVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction > 0 ? '-50%' : '50%',
      opacity: 0,
    }),
  };

  const transition = {
    x: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      mass: 0.5,
      velocity: 0.5,
    },
    opacity: {
      duration: 0.4,
      ease: 'easeInOut',
    },
  };

  // Determine if the media is an image or video
  const isVideo = (src) => {
    const videoExtensions = ['.mp4', '.webm', '.ogg'];
    return videoExtensions.some((ext) => src.toLowerCase().endsWith(ext));
  };

  return (
    <div
      className={getDarkModeClass(
        darkMode,
        'flex w-full max-w-5xl mx-auto text-white',
        'flex w-full max-w-5xl mx-auto text-gray-900'
      )}
    >
      {/* Thumbnail Section (Left, Vertical) */}
      <div className="relative flex-shrink-0 w-28 mr-6">
        {/* Up Scroll Button */}
        <button
          onClick={() => scrollThumbnails(-200)}
          className={getDarkModeClass(
            darkMode,
            'absolute top-0 left-1/2 transform -translate-x-1/2 bg-gray-700 bg-opacity-80 text-white p-2 rounded-full hover:bg-opacity-100 transition-all duration-300 shadow-md z-10 hover:scale-110',
            'absolute top-0 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 text-gray-800 p-2 rounded-full hover:bg-opacity-100 transition-all duration-300 shadow-md z-10 hover:scale-110'
          )}
          aria-label="Scroll thumbnails up"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>

        {/* Thumbnail Container */}
        <div
          ref={thumbnailContainerRef}
          className="overflow-y-auto h-[400px] py-10 no-scrollbar"
          style={{
            scrollbarWidth: 'none', /* Firefox */
          }}
        >
          <style jsx>{`
            .no-scrollbar::-webkit-scrollbar {
              display: none; /* Chrome, Safari, Edge */
            }
            .no-scrollbar {
              -ms-overflow-style: none; /* IE and Edge */
            }
          `}</style>
          <div className="flex flex-col space-y-4 pl-2">
            {media.map((item, index) => (
              <motion.div
                key={item.id}
                ref={(el) => (thumbnailRefs.current[index] = el)}
                onClick={() => goToSlide(index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={getDarkModeClass(
                  darkMode,
                  `flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                    currentIndex === index
                      ? 'ring-4 ring-blue-400 shadow-lg'
                      : 'ring-2 ring-gray-600 hover:ring-blue-300'
                  }`,
                  `flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                    currentIndex === index
                      ? 'ring-4 ring-blue-500 shadow-lg'
                      : 'ring-2 ring-gray-200 hover:ring-blue-300'
                  }`
                )}
              >
                {isVideo(item.src) ? (
                  <video
                    src={item.src}
                    alt={item.alt}
                    className="w-24 h-24 object-cover"
                    muted
                  />
                ) : (
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="w-24 h-24 object-cover"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Down Scroll Button */}
        <button
          onClick={() => scrollThumbnails(200)}
          className={getDarkModeClass(
            darkMode,
            'absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-gray-700 bg-opacity-80 text-white p-2 rounded-full hover:bg-opacity-100 transition-all duration-300 shadow-md z-10 hover:scale-110',
            'absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 text-gray-800 p-2 rounded-full hover:bg-opacity-100 transition-all duration-300 shadow-md z-10 hover:scale-110'
          )}
          aria-label="Scroll thumbnails down"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Main Media (Right) */}
      <div
        className={getDarkModeClass(
          darkMode,
          'relative flex-1 h-[400px] overflow-hidden rounded-2xl flex items-center justify-center',
          'relative flex-1 h-[400px] overflow-hidden rounded-2xl flex items-center justify-center'
        )}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={media[currentIndex]?.id}
            className="absolute w-full h-full flex items-center justify-center"
            custom={direction}
            variants={mediaVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
          >
            {isVideo(media[currentIndex]?.src) ? (
              <video
                src={media[currentIndex]?.src || ''}
                alt={media[currentIndex]?.alt || 'Video'}
                className="max-h-full max-w-full object-contain"
                controls
                autoPlay
                muted
                loop
              />
            ) : (
              <img
                src={media[currentIndex]?.src || ''}
                data-kheng-chetra="belly-image-preview"
                className="max-h-full max-w-full object-contain"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <button
          onClick={goToPrevious}
          className={getDarkModeClass(
            darkMode,
            'absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-700 bg-opacity-80 text-white p-3 rounded-full hover:bg-opacity-100 transition-all duration-300 shadow-md z-10 hover:scale-110',
            'absolute top-1/2 left-4 transform -translate-y-1/2 bg-white bg-opacity-80 text-gray-800 p-3 rounded-full hover:bg-opacity-100 transition-all duration-300 shadow-md z-10 hover:scale-110'
          )}
          aria-label="Previous media"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={goToNext}
          className={getDarkModeClass(
            darkMode,
            'absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-700 bg-opacity-80 text-white p-3 rounded-full hover:bg-opacity-100 transition-all duration-300 shadow-md z-10 hover:scale-110',
            'absolute top-1/2 right-4 transform -translate-y-1/2 bg-white bg-opacity-80 text-gray-800 p-3 rounded-full hover:bg-opacity-100 transition-all duration-300 shadow-md z-10 hover:scale-110'
          )}
          aria-label="Next media"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ImageGallery;
