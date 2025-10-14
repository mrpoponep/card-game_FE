import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook để xử lý animation mở/đóng cho modal/popup
 * @param {boolean} isOpen - Trạng thái mở/đóng từ parent
 * @param {function} onClose - Callback khi đóng modal
 * @param {number} animationDuration - Thời gian animation (ms), mặc định 300ms
 * @returns {object} - { isClosing, isAnimating, handleClose, shouldRender }
 */
export function useModalAnimation(isOpen, onClose, animationDuration = 300) {
  const [isClosing, setIsClosing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const closeTimeoutRef = useRef(null);
  const openTimeoutRef = useRef(null);

  // Reset states và setup animation khi popup được mở
  useEffect(() => {
    if (isOpen) {
      // Hủy tất cả timeout cũ
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      if (openTimeoutRef.current) {
        clearTimeout(openTimeoutRef.current);
        openTimeoutRef.current = null;
      }
      
      // Reset states
      setIsClosing(false);
      setIsAnimating(true);
      
      // Sau khi animation mở xong, cho phép đóng
      openTimeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
        openTimeoutRef.current = null;
      }, animationDuration);
    }
  }, [isOpen, animationDuration]);

  // Cleanup timeout khi component unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      if (openTimeoutRef.current) {
        clearTimeout(openTimeoutRef.current);
      }
    };
  }, []);

  // Hàm xử lý đóng với animation
  const handleClose = useCallback(() => {
    if (isClosing || isAnimating) return; // Không đóng nếu đang animation
    
    setIsClosing(true);
    closeTimeoutRef.current = setTimeout(() => {
      setIsClosing(false);
      closeTimeoutRef.current = null;
      onClose();
    }, animationDuration);
  }, [isClosing, isAnimating, onClose, animationDuration]);

  // Xác định có nên render component hay không
  const shouldRender = isOpen || isClosing;

  return {
    isClosing,
    isAnimating,
    handleClose,
    shouldRender
  };
}
