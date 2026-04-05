export type BankReference = {
  code: string;
  name: string;
  slug: string;
  supportsNuban: boolean;
};

export const nigerianBanks: BankReference[] = [
  { code: "044", name: "Access Bank", slug: "access-bank", supportsNuban: true },
  { code: "063", name: "Access Bank (Diamond)", slug: "access-bank-diamond", supportsNuban: true },
  { code: "050", name: "Ecobank Nigeria", slug: "ecobank-nigeria", supportsNuban: true },
  { code: "070", name: "Fidelity Bank", slug: "fidelity-bank", supportsNuban: true },
  { code: "011", name: "First Bank of Nigeria", slug: "first-bank-of-nigeria", supportsNuban: true },
  { code: "214", name: "First City Monument Bank", slug: "fcmb", supportsNuban: true },
  { code: "058", name: "Guaranty Trust Bank", slug: "gtbank", supportsNuban: true },
  { code: "030", name: "Heritage Bank", slug: "heritage-bank", supportsNuban: true },
  { code: "301", name: "Jaiz Bank", slug: "jaiz-bank", supportsNuban: true },
  { code: "082", name: "Keystone Bank", slug: "keystone-bank", supportsNuban: true },
  { code: "526", name: "Parallex Bank", slug: "parallex-bank", supportsNuban: true },
  { code: "076", name: "Polaris Bank", slug: "polaris-bank", supportsNuban: true },
  { code: "101", name: "Providus Bank", slug: "providus-bank", supportsNuban: true },
  { code: "221", name: "Stanbic IBTC Bank", slug: "stanbic-ibtc-bank", supportsNuban: true },
  { code: "068", name: "Standard Chartered Bank", slug: "standard-chartered-bank", supportsNuban: true },
  { code: "232", name: "Sterling Bank", slug: "sterling-bank", supportsNuban: true },
  { code: "100", name: "Suntrust Bank", slug: "suntrust-bank", supportsNuban: true },
  { code: "032", name: "Union Bank of Nigeria", slug: "union-bank-of-nigeria", supportsNuban: true },
  { code: "033", name: "United Bank for Africa", slug: "united-bank-for-africa", supportsNuban: true },
  { code: "215", name: "Unity Bank", slug: "unity-bank", supportsNuban: true },
  { code: "035", name: "Wema Bank", slug: "wema-bank", supportsNuban: true },
  { code: "057", name: "Zenith Bank", slug: "zenith-bank", supportsNuban: true }
];

export function findNigerianBankByCode(code: string) {
  return nigerianBanks.find((bank) => bank.code === code) ?? null;
}
