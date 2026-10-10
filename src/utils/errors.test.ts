import { ApiError } from '../services/api';
import { userFacingErrorMessage } from './errors';

describe('userFacingErrorMessage', () => {
  it('preserves the normalized API error message', () => {
    const error = new ApiError(
      'The verification email could not be sent. Try again.',
      'EMAIL_UNAVAILABLE',
      'request-123',
      503,
    );

    expect(userFacingErrorMessage(error, 'Signup failed. Please try again.')).toBe(
      'The verification email could not be sent. Try again.',
    );
  });

  it('uses the fallback for unknown thrown values', () => {
    expect(userFacingErrorMessage({}, 'Signup failed. Please try again.')).toBe(
      'Signup failed. Please try again.',
    );
  });
});
