# Modal Base System - Hướng dẫn sử dụng

Hệ thống modal tái sử dụng với animation mượt mà cho dự án Card Game.

## 📁 Cấu trúc

```
Client/frontend/src/
├── hooks/
│   ├── useModalAnimation.js    # Hook xử lý animation mở/đóng
│   └── useEscapeKey.js          # Hook xử lý phím ESC
├── styles/
│   └── modal-base.css           # Base CSS cho tất cả modals
└── components/
    └── ranking/
        ├── Ranking.jsx          # Component sử dụng base system
        └── Ranking.css          # Styles đặc thù cho Ranking
```

## 🎯 Cách sử dụng

### 1. Import Base CSS

```css
/* YourComponent.css */
@import '../../styles/modal-base.css';

/* Thêm styles riêng của component */
.your-custom-table {
  width: 100%;
  /* ... */
}
```

### 2. Sử dụng Hooks trong Component

```jsx
import React, { useCallback } from 'react';
import { useModalAnimation } from '../../hooks/useModalAnimation';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import './YourComponent.css';

export default function YourModal({ isOpen, onClose }) {
  // Hook animation (thời gian mặc định: 300ms)
  const { isClosing, isAnimating, handleClose, shouldRender } = 
    useModalAnimation(isOpen, onClose, 300);
  
  // Hook ESC key
  useEscapeKey(isOpen && !isClosing, handleClose, isAnimating);
  
  // Handle overlay click
  const handleOverlayClick = useCallback((e) => {
    if (e.target.classList.contains('modal-overlay')) {
      handleClose();
    }
  }, [handleClose]);
  
  if (!shouldRender) return null;

  return (
    <div 
      className={`modal-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleOverlayClick}
    >
      <div className={`modal-container ${isClosing ? 'closing' : ''}`}>
        <button className="modal-close-btn" onClick={handleClose}>✕</button>
        
        <div className="modal-header">
          <h2>🎯 Your Title</h2>
        </div>
        
        <div className="modal-content">
          {/* Your content here */}
        </div>
      </div>
    </div>
  );
}
```

## 🎨 Base CSS Classes

### Overlay & Container
- `.modal-overlay` - Overlay phủ toàn màn hình
- `.modal-container` - Container chứa modal
- `.closing` - Class cho animation đóng

### Components
- `.modal-close-btn` - Nút đóng (X) ở góc phải
- `.modal-header` - Header với gradient tím
- `.modal-content` - Nội dung modal (scrollable)

### Animations
- `modal-fadeIn` / `modal-fadeOut` - Fade overlay
- `modal-slideIn` / `modal-slideOut` - Slide modal từ trên xuống
- `modal-scaleIn` / `modal-scaleOut` - Scale animation (variant)
- `modal-slideInRight` / `modal-slideOutRight` - Slide từ phải (variant)

## 🔧 Custom Animation Variants

Muốn dùng animation khác? Thêm class vào component:

```css
/* YourComponent.css */
.your-modal {
  animation: modal-scaleIn 0.3s ease !important;
}

.your-modal.closing {
  animation: modal-scaleOut 0.3s ease !important;
}
```

## 📝 useModalAnimation Hook API

```javascript
const {
  isClosing,      // boolean: Đang trong quá trình đóng?
  isAnimating,    // boolean: Đang animation mở?
  handleClose,    // function: Hàm đóng với animation
  shouldRender    // boolean: Có nên render component?
} = useModalAnimation(
  isOpen,               // boolean: Props từ parent
  onClose,              // function: Callback khi đóng
  animationDuration     // number: Thời gian animation (ms), default 300
);
```

## 🎹 useEscapeKey Hook API

```javascript
useEscapeKey(
  isActive,      // boolean: Có kích hoạt listener?
  onEscape,      // function: Callback khi nhấn ESC
  isAnimating    // boolean: Block ESC khi đang animation
);
```

## ✨ Tính năng

- ✅ Animation mở/đóng mượt mà
- ✅ Xử lý ESC key (cả keydown và keyup)
- ✅ Click overlay để đóng
- ✅ Ngăn double-click/spam
- ✅ Auto cleanup timeouts
- ✅ Responsive design
- ✅ Tái sử dụng cao

## 🚀 Ví dụ thực tế

Xem `components/ranking/Ranking.jsx` để tham khảo implementation đầy đủ.

## 🎨 Customization

### Thay đổi màu gradient header

```css
.modal-header {
  background: linear-gradient(135deg, #your-color-1, #your-color-2);
}
```

### Thay đổi kích thước modal

```css
.modal-container {
  max-width: 1200px; /* Thay vì 900px mặc định */
}
```

### Thay đổi thời gian animation

```javascript
useModalAnimation(isOpen, onClose, 500); // 500ms thay vì 300ms
```

## 📚 Best Practices

1. **Luôn dùng shouldRender**: Tránh render component khi không cần
2. **Consistent timing**: Đảm bảo thời gian CSS animation khớp với hook parameter
3. **Cleanup**: Hooks tự động cleanup, không cần quan tâm
4. **Accessibility**: Thêm `aria-modal="true"` và `role="dialog"` nếu cần

---

**Made with ❤️ for Card Game Project**
