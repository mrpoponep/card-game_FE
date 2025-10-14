import { useEffect } from 'react';

/**
 * Custom hook để xử lý phím ESC
 * @param {boolean} isActive - Có kích hoạt listener không
 * @param {function} onEscape - Callback khi nhấn ESC
 * @param {boolean} isAnimating - Có đang animation không (để block ESC)
 */
export function useEscapeKey(isActive, onEscape, isAnimating = false) {
  useEffect(() => {
    if (!isActive || isAnimating) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onEscape();
      }
    };

    // Chặn cả keyup để tránh event trigger sau khi đóng
    const handleKeyUp = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [isActive, onEscape, isAnimating]);
}
