import { formatMoney, isFullAccess } from './api';

describe('API domain helpers', () => {
  it('uses integer minor units for display', () => {
    expect(formatMoney({ amountMinor: 39900, currency: 'INR' })).toContain('399');
    expect(formatMoney({ amountMinor: 39950, currency: 'INR' })).toContain('399.5');
  });
  it('grants protected access only in FULL mode', () => {
    expect(isFullAccess('FULL')).toBe(true);
    expect(isFullAccess('BROWSE_ONLY')).toBe(false);
    expect(isFullAccess(undefined)).toBe(false);
  });
});
