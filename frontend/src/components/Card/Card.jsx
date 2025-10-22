import React from 'react';
import './Card.css'; // We'll create this CSS file next

// Define mapping from full suit names to single letters if needed
const suitMap = {
  Spades: 'S',
  Hearts: 'H',
  Diamonds: 'D',
  Clubs: 'C',
};

// Define mapping for ranks (optional, if your images use '10' instead of 'T')
const rankMap = {
  T: 'T', // Or '10' if your image is named 10S.svg
  J: 'J',
  Q: 'Q',
  K: 'K',
  A: 'A',
  // Numbers 2-9 are usually the same
};

/**
 * Component to display a single playing card.
 * Props:
 * - suit: 'Spades', 'Hearts', 'Diamonds', 'Clubs' (only needed if faceUp is true)
 * - rank: '2'...'9', 'T', 'J', 'Q', 'K', 'A' (only needed if faceUp is true)
 * - faceUp: boolean (true to show face, false to show back)
 */
function Card({ suit, rank, faceUp = true }) {
  let imageName = 'back.svg'; // Default to card back

  if (faceUp) {
    // Ensure rank and suit are valid before creating filename
    const displayRank = rankMap[rank] || rank; // Use rank directly if not in map (2-9)
    const displaySuit = suitMap[suit];

    if (displayRank && displaySuit) {
      imageName = `${displayRank}${displaySuit}.svg`; // e.g., AS.svg, KH.svg, TC.svg
    } else {
      console.warn(`Invalid card data: Rank=${rank}, Suit=${suit}`);
      // Keep imageName as 'back.svg' or use a placeholder error image
      imageName = 'back.svg'; // Or maybe an error placeholder
    }
  }

  const imagePath = `/cards/${imageName}`; // Path relative to the /public folder

  return (
    <div className="card">
      <img src={imagePath} alt={faceUp ? `${rank} of ${suit}` : 'Card Back'} />
    </div>
  );
}

export default Card;