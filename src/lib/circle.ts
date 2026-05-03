// Server-only — never import this in client components
export const SUPPORTED_CORRIDORS = [
  { from: "UAE", to: "India", currency: "INR", flag: "🇮🇳" },
  { from: "UAE", to: "Pakistan", currency: "PKR", flag: "🇵🇰" },
  { from: "UAE", to: "Philippines", currency: "PHP", flag: "🇵🇭" },
  { from: "UAE", to: "Bangladesh", currency: "BDT", flag: "🇧🇩" },
  { from: "UAE", to: "USA", currency: "USD", flag: "🇺🇸" },
  { from: "UAE", to: "UK", currency: "GBP", flag: "🇬🇧" },
  { from: "UAE", to: "Europe", currency: "EUR", flag: "🇪🇺" },
];

export const FEE_COMPARISON = {
  westernUnion: 4.5,
  wise: 2.1,
  paypal: 3.9,
  platform: 0.1,
};
