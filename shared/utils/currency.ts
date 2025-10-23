/**
 * Format currency to Vietnamese Dong (VND)
 * @param amount - The amount to format
 * @returns Formatted string with VND symbol (₫)
 */
export function formatVND(amount: number): string {
  return `${amount.toLocaleString('vi-VN')}₫`;
}

/**
 * Format price for display (short version)
 * @param amount - The amount to format
 * @returns Formatted string (e.g., "50k" for 50,000)
 */
export function formatVNDShort(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}tr₫`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}k₫`;
  }
  return `${amount}₫`;
}

/**
 * Parse VND string to number
 * @param vndString - String like "50,000₫" or "50k₫"
 * @returns Parsed number
 */
export function parseVND(vndString: string): number {
  // Remove ₫ and commas
  const cleaned = vndString.replace(/[₫,]/g, '').trim();
  
  // Handle 'k' for thousands
  if (cleaned.endsWith('k')) {
    return parseFloat(cleaned.slice(0, -1)) * 1000;
  }
  
  // Handle 'tr' for millions
  if (cleaned.endsWith('tr')) {
    return parseFloat(cleaned.slice(0, -2)) * 1000000;
  }
  
  return parseFloat(cleaned) || 0;
}
