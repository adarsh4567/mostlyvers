// Provider seam retained for the later Google Play implementation. The current
// production build deliberately contains no billing SDK or simulated payment.
export const billingService = {
	reconcilePendingCheckouts: async () => [],
	restoreGooglePlayPurchases: async () => undefined,
};
