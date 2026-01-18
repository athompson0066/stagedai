
export enum PropertyGoal {
  SELL = 'Selling the property',
  RENT = 'Renting the property',
  STR = 'Short-term rental (Airbnb / VRBO)',
  RENOVATE = 'Visualizing possibilities'
}

export enum PropertyType {
  HOUSE = 'Single-Family House',
  APARTMENT = 'Apartment / Condo',
  LOFT = 'Loft / Industrial Space',
  OFFICE = 'Office / Workspace',
  STUDIO = 'Studio / Small Space'
}

export enum BuyerPersona {
  FIRST_TIME = 'First-time buyer',
  FAMILY = 'Family with children',
  PROFESSIONAL = 'Young professional',
  INVESTOR = 'Investor',
  LUXURY = 'Luxury buyer',
  STR_GUEST = 'Short-term rental guest'
}

export enum StagingStyle {
  MODERN = 'Modern',
  CONTEMPORARY = 'Contemporary',
  SCANDINAVIAN = 'Scandinavian',
  MINIMALIST = 'Minimalist',
  LUXURY = 'Luxury',
  COZY = 'Cozy / Family-friendly',
  BOHEMIAN = 'Bohemian',
  INDUSTRIAL = 'Industrial',
  TRANSITIONAL = 'Transitional'
}

export enum MarketPositioning {
  BUDGET = 'Budget / Entry-level',
  MID_RANGE = 'Mid-range',
  PREMIUM = 'Premium',
  LUXURY = 'Ultra-Luxury'
}

export interface StyleRecommendation {
  style: StagingStyle;
  rationale: string;
}

export interface StagingProject {
  id: string;
  originalImage: string;
  stagedImage?: string;
  goal: PropertyGoal;
  propertyType: PropertyType;
  persona: BuyerPersona;
  style: StagingStyle;
  marketPositioning?: MarketPositioning;
  usagePlatform?: string[];
  emotionalTone?: string;
  notes?: string;
  status: 'draft' | 'processing' | 'completed' | 'failed';
}
