# PokerRules Component - Refactored

Component đã được refactor để sử dụng **Modal Base System**.

## ✨ Những thay đổi

### 1. **Sử dụng Custom Hooks**
```jsx
// Trước đây: Tự quản lý animation
const [isClosing, setIsClosing] = useState(false);
// ... nhiều logic phức tạp

// Bây giờ: Sử dụng hooks
const { isClosing, isAnimating, handleClose, shouldRender } = 
  useModalAnimation(isOpen, onClose, 290);

useEscapeKey(isOpen && !isClosing, handleClose, isAnimating);
```

### 2. **Áp dụng Base Classes**
```jsx
// Trước đây:
<div className="poker-rules-overlay">
  <div className="poker-rules-modal">

// Bây giờ:
<div className="modal-overlay poker-rules-overlay">
  <div className="modal-container poker-rules-modal">
```

### 3. **CSS với Base Import**
```css
/* Import base styles */
@import '../../styles/modal-base.css';

/* Override với poker theme */
.poker-rules-modal {
  background: linear-gradient(135deg, #8B1A1A, #A52A2A) !important;
  border: 3px solid #FFD700;
}
```

## 🎨 Poker Theme Customization

### Colors
- **Background**: Gradient đỏ (#8B1A1A → #A52A2A)
- **Border**: Vàng gold (#FFD700)
- **Text**: Vàng gold cho headers
- **Accent**: Đen với viền vàng

### Features Giữ Nguyên
- ✅ Tabs system (Cách chơi / Tính điểm)
- ✅ Card rankings với màu sắc
- ✅ Hand rankings grid (2 columns)
- ✅ Responsive design
- ✅ Custom scrollbar styling

## 🔧 Animation

Sử dụng animation từ base:
- **Open**: `modal-fadeIn` + `modal-slideIn` (290ms)
- **Close**: `modal-fadeOut` + `modal-slideOut` (290ms)
- **ESC key**: Xử lý bởi `useEscapeKey` hook
- **Overlay click**: Xử lý bởi `handleOverlayClick`

## 📝 Props

```jsx
<PokerRules 
  isOpen={boolean}    // Trạng thái mở/đóng
  onClose={function}  // Callback khi đóng
/>
```

## 🎯 Benefits

1. **Code Reusability**: Tái sử dụng animation logic
2. **Consistency**: Animation đồng nhất với Ranking modal
3. **Maintainability**: Dễ maintain và debug
4. **Less Code**: Giảm ~50 lines code duplicate
5. **Better UX**: Animation mượt mà, xử lý edge cases tốt

## 🚀 Usage Example

```jsx
import PokerRules from './components/RuleScreen/PokerRules';

function App() {
  const [isRuleOpen, setIsRuleOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsRuleOpen(true)}>
        Xem luật chơi
      </button>
      
      <PokerRules 
        isOpen={isRuleOpen} 
        onClose={() => setIsRuleOpen(false)} 
      />
    </>
  );
}
```

## 🎨 Theme Variants

Muốn thay đổi theme? Chỉ cần override CSS:

```css
/* Blue theme variant */
.poker-rules-modal.blue-theme {
  background: linear-gradient(135deg, #1A4D8B, #2A5FA5) !important;
  border-color: #4A90E2;
}

.blue-theme .poker-header h2 {
  color: #4A90E2 !important;
}
```

---

**Refactored on**: October 14, 2025  
**Base System**: Modal Base v1.0
