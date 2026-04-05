export type SupportedLanguageCode = "en" | "fr";
export type SupportedPlanTier = "STARTER" | "GROWTH" | "SCALE" | "ENTERPRISE";
export type WorkspaceFeature =
  | "csv_import"
  | "approvals"
  | "rules_engine"
  | "team_management"
  | "reporting"
  | "audit_exports";

export type SupportedCountry = {
  code: string;
  name: string;
  currencyCode: string;
  defaultLocale: string;
};

export type SupportedLanguage = {
  code: SupportedLanguageCode;
  label: string;
  locales: Record<string, string>;
};

export type PlanPolicy = {
  tier: SupportedPlanTier;
  maxRecipients: number;
  maxTeamMembers: number;
  features: WorkspaceFeature[];
};

export const supportedCountries: SupportedCountry[] = [
  { code: "NG", name: "Nigeria", currencyCode: "NGN", defaultLocale: "en-NG" },
  { code: "GH", name: "Ghana", currencyCode: "GHS", defaultLocale: "en-GH" },
  { code: "KE", name: "Kenya", currencyCode: "KES", defaultLocale: "en-KE" },
  { code: "ZA", name: "South Africa", currencyCode: "ZAR", defaultLocale: "en-ZA" },
  { code: "GB", name: "United Kingdom", currencyCode: "GBP", defaultLocale: "en-GB" },
  { code: "US", name: "United States", currencyCode: "USD", defaultLocale: "en-US" }
];

export const supportedLanguages: SupportedLanguage[] = [
  {
    code: "en",
    label: "English",
    locales: {
      default: "en-US",
      NG: "en-NG",
      GH: "en-GH",
      KE: "en-KE",
      ZA: "en-ZA",
      GB: "en-GB",
      US: "en-US"
    }
  },
  {
    code: "fr",
    label: "Francais",
    locales: {
      default: "fr-FR",
      NG: "fr-FR",
      GH: "fr-FR",
      KE: "fr-FR",
      ZA: "fr-FR",
      GB: "fr-FR",
      US: "fr-FR"
    }
  }
];

export const planPolicies: Record<SupportedPlanTier, PlanPolicy> = {
  STARTER: {
    tier: "STARTER",
    maxRecipients: 5,
    maxTeamMembers: 1,
    features: []
  },
  GROWTH: {
    tier: "GROWTH",
    maxRecipients: 50,
    maxTeamMembers: 1,
    features: ["csv_import", "approvals", "reporting"]
  },
  SCALE: {
    tier: "SCALE",
    maxRecipients: 200,
    maxTeamMembers: 10,
    features: ["csv_import", "approvals", "rules_engine", "team_management", "reporting", "audit_exports"]
  },
  ENTERPRISE: {
    tier: "ENTERPRISE",
    maxRecipients: 1000,
    maxTeamMembers: 50,
    features: ["csv_import", "approvals", "rules_engine", "team_management", "reporting", "audit_exports"]
  }
};

export function getCountryConfig(countryCode: string) {
  return (
    supportedCountries.find((country) => country.code === countryCode.toUpperCase()) ??
    supportedCountries[0]
  );
}

export function getLanguageConfig(languageCode: string) {
  return (
    supportedLanguages.find((language) => language.code === languageCode) ??
    supportedLanguages[0]
  );
}

export function deriveLocale(countryCode: string, languageCode: SupportedLanguageCode) {
  const language = getLanguageConfig(languageCode);
  return language.locales[countryCode.toUpperCase()] ?? language.locales.default;
}

export function getPlanPolicy(planTier: SupportedPlanTier) {
  return planPolicies[planTier] ?? planPolicies.STARTER;
}

export function hasPlanFeature(planTier: SupportedPlanTier, feature: WorkspaceFeature) {
  return getPlanPolicy(planTier).features.includes(feature);
}
