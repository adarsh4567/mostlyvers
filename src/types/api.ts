export type AccessMode = 'FULL' | 'BROWSE_ONLY';

export interface Money { amountMinor: number; currency: string }

export interface Reader {
  id: string;
  name: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  profilePictureUrl?: string;
  createdAt: string;
}

export interface DeviceContext {
  installationId: string;
  displayName: string;
  platform: 'ANDROID';
  osVersion: string;
  appVersion: string;
  packageName: string;
  integrityToken?: string;
  integrityRequestHash?: string;
}

export interface DeviceAccess {
  accessMode: AccessMode;
  currentDevice?: { id: string; displayName: string; authorizedAt: string };
  thisDeviceId: string;
  changesUsed: number;
  changesRemaining: number;
  maximumChanges: number;
  transferAllowed: boolean;
  currentFee: Money;
}

export interface Session {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  reader: Reader;
  accessMode: AccessMode;
  deviceAccess: DeviceAccess;
}

export type BookStatus = 'UPCOMING' | 'PUBLISHED' | 'ARCHIVED';
export type Ownership = 'NONE' | 'PREBOOKED' | 'OWNED';

export interface BookSummary {
  id: string;
  title: string;
  shortDescription: string;
  coverUrl: string;
  publicationMonth: number;
  publicationYear: number;
  status: BookStatus;
  ownership: Ownership;
  latestUntil?: string;
  price?: Money;
  localizedPrice?: string;
  prebook?: { enabled: boolean; discountPercent: number; price?: Money; localizedPrice?: string };
  billing: { purchaseProductId?: string; prebookProductId?: string };
  youtubeAvailability: boolean;
}

export interface CursorPage<T> { items: T[]; nextCursor?: string | null }

export type CheckoutPurpose = 'BOOK_PURCHASE' | 'PREBOOK' | 'DEVICE_TRANSFER';
export type BillingProvider = 'GOOGLE_PLAY' | 'ALTERNATIVE';
export type CheckoutStatus = 'CREATED' | 'PENDING' | 'VERIFIED' | 'FAILED' | 'CANCELLED';

export interface CheckoutSession {
  id: string;
  purpose: CheckoutPurpose;
  provider: BillingProvider;
  status: CheckoutStatus;
  quotedAmount: Money;
  productId?: string;
  offerToken?: string;
  alternativeOrder?: { orderId: string; publicKey: string };
}

export interface ReadingLocator {
  href: string;
  cfi?: string;
  progression: number;
  displayedPage?: number;
  displayedPageCount?: number;
}

export interface ReadingProgress {
  bookId: string;
  locator: ReadingLocator;
  progressPercent: number;
  updatedAt: string;
  version: number;
}

export interface ReadingManifestResource { id: string; href: string; mediaType: string }
export interface ReadingSession {
  id: string;
  expiresAt: string;
  bookId: string;
  title: string;
  resources: ReadingManifestResource[];
  spine: string[];
  progress?: ReadingProgress;
  bookmark?: ReadingLocator;
}

export interface OfflineLicense {
  bookId: string;
  packageVersion: string;
  packagePath: string;
  checksumSha256: string;
  contentLength: number;
  contentKey: string;
  nonce: string;
  leaseExpiresAt: string;
}

export interface DownloadRecord {
  book: BookSummary;
  packageVersion: string;
  downloadedAt: string;
  leaseExpiresAt: string;
  contentLength: number;
}

export interface Feedback { id: string; bookId: string; text: string; createdAt: string; updatedAt: string }
export interface YoutubeAsset {
  bookId: string;
  title: string;
  coverUrl: string;
  songName: string;
  unlocked: boolean;
  youtubeUrl?: string;
  qrPayload?: string;
}

export interface Transaction {
  id: string;
  type: 'BOOK_PURCHASE' | 'PREBOOK' | 'DEVICE_TRANSFER';
  book?: BookSummary;
  amount: Money;
  discountPercent?: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  provider: BillingProvider;
  providerTransactionReference?: string;
  createdAt: string;
}

export interface ReaderNotification {
	id: string;
	title: string;
	body: string;
	data: Record<string, unknown>;
	readAt?: string;
	createdAt: string;
}
export interface NotificationPage extends CursorPage<ReaderNotification> { unreadCount: number }

export interface ApiProblem {
  error: { code: string; message: string; requestId: string; details?: Record<string, unknown> };
}

export const isFullAccess = (mode?: AccessMode): boolean => mode === 'FULL';
export const formatMoney = (money?: Money): string => {
  if (!money) return '';
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: money.currency,
      maximumFractionDigits: money.amountMinor % 100 === 0 ? 0 : 2,
    }).format(money.amountMinor / 100);
  } catch {
    return `${money.currency} ${(money.amountMinor / 100).toFixed(2)}`;
  }
};
