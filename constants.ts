
import { PropertyGoal, BuyerPersona, StagingStyle, PropertyType, MarketPositioning } from './types';

export const GOALS = [
  { value: PropertyGoal.SELL, icon: 'fa-house-circle-check', description: 'Maximize resale value and appeal.' },
  { value: PropertyGoal.RENT, icon: 'fa-key', description: 'Attract long-term, reliable tenants.' },
  { value: PropertyGoal.STR, icon: 'fa-bed', description: 'Optimize for bookings and ratings.' },
  { value: PropertyGoal.RENOVATE, icon: 'fa-hammer', description: 'Visualize design potential.' },
];

export const PROPERTY_TYPES = [
  { value: PropertyType.HOUSE, icon: 'fa-home' },
  { value: PropertyType.APARTMENT, icon: 'fa-building' },
  { value: PropertyType.LOFT, icon: 'fa-warehouse' },
  { value: PropertyType.OFFICE, icon: 'fa-briefcase' },
  { value: PropertyType.STUDIO, icon: 'fa-door-open' },
];

export const PERSONAS = [
  { value: BuyerPersona.FIRST_TIME, label: 'First-Time Buyer', icon: 'fa-user-graduate' },
  { value: BuyerPersona.FAMILY, label: 'Family with Kids', icon: 'fa-users' },
  { value: BuyerPersona.PROFESSIONAL, label: 'Young Professional', icon: 'fa-briefcase' },
  { value: BuyerPersona.INVESTOR, label: 'Investor', icon: 'fa-chart-line' },
  { value: BuyerPersona.LUXURY, label: 'Luxury Buyer', icon: 'fa-gem' },
  { value: BuyerPersona.STR_GUEST, label: 'Airbnb Guest', icon: 'fa-suitcase' },
];

export const STYLES = [
  { value: StagingStyle.MODERN, label: 'Modern', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=400' },
  { value: StagingStyle.CONTEMPORARY, label: 'Contemporary', image: 'https://images.unsplash.com/photo-1513519247388-4473e4901ea7?auto=format&fit=crop&q=80&w=400' },
  { value: StagingStyle.SCANDINAVIAN, label: 'Scandinavian', image: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&q=80&w=400' },
  { value: StagingStyle.MINIMALIST, label: 'Minimalist', image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&q=80&w=400' },
  { value: StagingStyle.LUXURY, label: 'Luxury', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=400' },
  { value: StagingStyle.COZY, label: 'Cozy / Family', image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=400' },
  { value: StagingStyle.BOHEMIAN, label: 'Bohemian', image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=400' },
  { value: StagingStyle.INDUSTRIAL, label: 'Industrial', image: 'https://images.unsplash.com/photo-1515542706656-8e6ef17a1521?auto=format&fit=crop&q=80&w=400' },
  { value: StagingStyle.TRANSITIONAL, label: 'Transitional', image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=400' },
];

export const POSITIONS = [
  { value: MarketPositioning.BUDGET, icon: 'fa-piggy-bank' },
  { value: MarketPositioning.MID_RANGE, icon: 'fa-hand-holding-dollar' },
  { value: MarketPositioning.PREMIUM, icon: 'fa-award' },
  { value: MarketPositioning.LUXURY, icon: 'fa-crown' },
];

export const PLATFORMS = ['MLS', 'Zillow / Realtor.ca', 'Airbnb / VRBO', 'Social Media', 'Investor Presentation'];

export const TONES = ['Warm & Inviting', 'Clean & Modern', 'Aspirational', 'Calm & Relaxing'];

export const PRICING_TIERS = [
  {
    name: 'Starter',
    price: '$29',
    credits: 5,
    description: 'Perfect for single rooms or small listings.',
    features: ['5 Staged Images', 'Single Style Variation', 'High-Res Download', 'disclosure badge'],
    recommended: false
  },
  {
    name: 'Persona Pack',
    price: '$79',
    credits: 15,
    description: 'Best for attracting multiple buyer segments.',
    features: ['15 Staged Images', '3 Style Variations', 'Persona-Based Targeting', 'Priority Processing'],
    recommended: true
  },
  {
    name: 'Full Property',
    price: '$149',
    credits: 35,
    description: 'The ultimate package for complete listings.',
    features: ['35 Staged Images', 'Up to 6 Rooms', 'Multiple Style Choices', 'Rush Delivery', 'Commercial Usage Rights'],
    recommended: false
  }
];
