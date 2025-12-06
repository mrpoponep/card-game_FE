/**
 * Card Assets Utility
 * Maps card ranks and suits to SVG file paths
 */

// Map rank from server format to SVG filename format
const rankToFilename = {
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  'T': '10',
  'J': 'jack',
  'Q': 'queen',
  'K': 'king',
  'A': 'ace',
};

// Map suit from server format to SVG filename format
const suitToFilename = {
  'S': 'spades',
  'H': 'hearts',
  'D': 'diamonds',
  'C': 'clubs',
};

// Base path for card SVG assets
const CARD_ASSETS_PATH = '/assets/Playing Cards/SVG-cards-1.3';

/**
 * Get the SVG image path for a specific card
 * @param {string} rank - Card rank ('2'-'9', 'T', 'J', 'Q', 'K', 'A')
 * @param {string} suit - Card suit ('S', 'H', 'D', 'C')
 * @returns {string} - Path to the SVG file
 */
export function getCardImagePath(rank, suit) {
  const rankName = rankToFilename[rank];
  const suitName = suitToFilename[suit];

  if (!rankName || !suitName) {
    console.warn(`Invalid card: rank=${rank}, suit=${suit}`);
    return null;
  }

  return `${CARD_ASSETS_PATH}/${rankName}_of_${suitName}.svg`;
}

/**
 * Get card info for display (used by PokerRules component)
 * @param {string} rank - Card rank ('2'-'9', 'T', 'J', 'Q', 'K', 'A')
 * @param {string} suit - Card suit ('S', 'H', 'D', 'C')
 * @returns {object} - Object with path, displayRank, suitSymbol, suitClass
 */
export function getCardInfo(rank, suit) {
  const suitMap = {
    'S': { symbol: '♠', class: 'spades' },
    'H': { symbol: '♥', class: 'hearts' },
    'D': { symbol: '♦', class: 'diamonds' },
    'C': { symbol: '♣', class: 'clubs' },
  };

  const rankMap = {
    '2': '2', '3': '3', '4': '4', '5': '5', '6': '6',
    '7': '7', '8': '8', '9': '9', 'T': '10',
    'J': 'J', 'Q': 'Q', 'K': 'K', 'A': 'A',
  };

  return {
    path: getCardImagePath(rank, suit),
    displayRank: rankMap[rank] || rank,
    suitSymbol: suitMap[suit]?.symbol || '?',
    suitClass: suitMap[suit]?.class || 'default',
  };
}

export { rankToFilename, suitToFilename, CARD_ASSETS_PATH };

