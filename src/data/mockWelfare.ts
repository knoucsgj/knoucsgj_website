import type { RentalItem, PartnershipItem } from '../lib/types';

// Strict No-Mock Policy: D1 is the Single Source of Truth (SSOT).
export const initialRentalItems: RentalItem[] = [];
export const initialPartnerships: PartnershipItem[] = [];
export const initialGalleryPhotos: { id: string; title: string; date: string; location: string; image_url: string; desc: string; }[] = [];
