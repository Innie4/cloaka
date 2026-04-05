"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import {
  getCountryConfig,
  hasPlanFeature,
  type SupportedLanguageCode,
  type SupportedPlanTier,
  type WorkspaceFeature
} from "@cloaka/shared";
import { getStoredSession } from "@/lib/auth-client";

type StoredBusiness = {
  id: string;
  name: string;
  slug: string;
  planTier: SupportedPlanTier;
  kybStatus: string;
  countryCode: string;
  currencyCode: string;
  languageCode: SupportedLanguageCode;
  locale: string;
  limits: {
    maxRecipients: number;
    maxTeamMembers: number;
  };
  features: WorkspaceFeature[];
};

type WorkspaceContextValue = {
  business: StoredBusiness | null;
  languageCode: SupportedLanguageCode;
  locale: string;
  currencyCode: string;
  planTier: SupportedPlanTier;
  t: (key: string, vars?: Record<string, string | number>) => string;
  formatMoney: (value: number | string) => string;
  formatDate: (value: string | Date, options?: Intl.DateTimeFormatOptions) => string;
  hasFeature: (feature: WorkspaceFeature) => boolean;
  planLabel: string;
};

const translations: Record<SupportedLanguageCode, Record<string, string>> = {
  en: {},
  fr: {
    "Payments, made calm.": "Les paiements, en toute serenite.",
    "Built for Nigerian SMEs that need trust, speed, and cleaner payment operations.": "Concu pour les PME qui ont besoin de confiance, de rapidite et d'operations de paiement plus propres.",
    Core: "Essentiel",
    Automation: "Automatisation",
    Operations: "Operations",
    Overview: "Vue d'ensemble",
    Wallet: "Portefeuille",
    Payments: "Paiements",
    Schedules: "Programmes",
    Rules: "Regles",
    Approvals: "Approbations",
    Recipients: "Beneficiaires",
    Team: "Equipe",
    Audit: "Audit",
    Reports: "Rapports",
    Settings: "Parametres",
    "Balance, schedules, and payment health": "Solde, programmes et sante des paiements",
    "Available funds, held balance, and ledger": "Fonds disponibles, fonds bloques et grand livre",
    "All outgoing transfers and receipts": "Tous les transferts sortants et recus",
    "Recurring payroll and vendor runs": "Paie recurrente et executions fournisseurs",
    "Plain-language payment conditions": "Conditions de paiement en langage simple",
    "Secondary review for high-value runs": "Deuxieme validation pour les montants eleves",
    "Employees, vendors, contractors, and tags": "Employes, fournisseurs, contractuels et etiquettes",
    "Owners, admins, and viewers": "Proprietaires, administrateurs et lecteurs",
    "Immutable activity log": "Journal d'activite immuable",
    "Spend summaries and exports": "Resumes des depenses et exports",
    "Trust, alerts, and configuration": "Confiance, alertes et configuration",
    "Business payment operating system": "Systeme d'exploitation des paiements d'entreprise",
    "Sign in": "Se connecter",
    "Sign in with your business email and password. If 2FA is enabled, Cloaka will ask for your 6-digit code.": "Connectez-vous avec votre adresse professionnelle et votre mot de passe. Si la double authentification est activee, Cloaka demandera votre code a 6 chiffres.",
    "Verifying your 2FA code...": "Verification de votre code 2FA...",
    "Signing you in...": "Connexion en cours...",
    "Enter your 6-digit authenticator code to finish signing in.": "Entrez votre code d'authentification a 6 chiffres pour terminer la connexion.",
    "Unable to sign in right now.": "Connexion impossible pour le moment.",
    "Work email": "E-mail professionnel",
    Password: "Mot de passe",
    "Two-factor code": "Code a deux facteurs",
    "Verifying code...": "Verification du code...",
    "Signing in...": "Connexion...",
    "Finish sign-in": "Terminer la connexion",
    "Enter dashboard": "Ouvrir le tableau de bord",
    "Welcome back": "Bon retour",
    "Salary day should feel boring, not stressful.": "Le jour de paie doit etre banal, pas stressant.",
    "This scaffold keeps the sign-in experience warm and low-noise, with enough trust framing to reassure a business owner before they land in the dashboard.": "Cette interface garde la connexion simple et rassurante, avec juste assez de signaux de confiance avant d'entrer dans le tableau de bord.",
    "Access the Cloaka workspace": "Acceder a l'espace Cloaka",
    "New here?": "Nouveau ici ?",
    "Create a business account": "Creer un compte entreprise",
    "3-step registration": "Inscription en 3 etapes",
    "Create a business account in minutes, then finish KYB only when it matters.": "Creez un compte entreprise en quelques minutes, puis terminez le KYB seulement quand c'est necessaire.",
    "This form will create a real business record once the API has a running Postgres database.": "Ce formulaire cree un vrai compte entreprise une fois l'API et Postgres disponibles.",
    "Business name": "Nom de l'entreprise",
    "Owner full name": "Nom complet du proprietaire",
    "Phone number": "Numero de telephone",
    Country: "Pays",
    "Preferred language": "Langue preferee",
    Plan: "Plan",
    "Create account": "Creer le compte",
    "Creating account...": "Creation du compte...",
    "Creating your business account...": "Creation de votre compte entreprise...",
    "Unable to create the account right now.": "Impossible de creer le compte pour le moment.",
    "Why this flow": "Pourquoi ce parcours",
    "Warm like Gusto, serious like payroll.": "Chaleureux comme Gusto, serieux comme la paie.",
    "Already registered?": "Deja inscrit ?",
    "Sign in instead": "Se connecter",
    "Overview page": "Page d'ensemble",
    "The balance view should reassure first, then inform.": "La vue du solde doit d'abord rassurer, puis informer.",
    "Payment history should scan in seconds.": "L'historique des paiements doit se lire en quelques secondes.",
    "Recurring runs should feel predictable, not mysterious.": "Les executions recurrentes doivent etre previsibles, pas mysterieuses.",
    "The product moat should feel as simple as a spreadsheet filter.": "L'avantage produit doit sembler aussi simple qu'un filtre de tableur.",
    "Approve and reject actions should never hide below the fold.": "Les actions approuver et rejeter ne doivent jamais etre cachees.",
    "Permissions should feel legible to non-technical operators.": "Les permissions doivent rester claires pour des operateurs non techniques.",
    "Audit should feel like a product feature, not buried admin debris.": "L'audit doit ressembler a une vraie fonctionnalite, pas a un dechet administratif.",
    "Reporting should answer finance questions without drama.": "Les rapports doivent repondre aux questions financieres sans drame.",
    "A serious financial dashboard that still feels easy to breathe in.": "Un tableau financier serieux qui reste facile a lire.",
    "Live wallet, payments, schedules, and approvals now feed this home view, so the hero numbers stay useful instead of decorative.": "Le portefeuille, les paiements, les programmes et les validations alimentent maintenant cette vue d'accueil pour que les chiffres restent utiles.",
    "Current position": "Position actuelle",
    "Create payment": "Creer un paiement",
    "One-time disbursement": "Decaissement ponctuel",
    "Live payments": "Paiements en direct",
    Reconcile: "Rapprocher",
    "Decision queue": "File de decision",
    "Approve": "Approuver",
    "Reject": "Rejeter",
    "Workspace members": "Membres de l'espace",
    "Audit trail": "Piste d'audit",
    Reporting: "Rapports",
    "Save business settings": "Enregistrer les parametres",
    "Two-factor authentication": "Authentification a deux facteurs"
  }
};

const defaultBusiness: StoredBusiness = {
  id: "",
  name: "Cloaka",
  slug: "cloaka",
  planTier: "STARTER",
  kybStatus: "PENDING",
  countryCode: "NG",
  currencyCode: "NGN",
  languageCode: "en",
  locale: "en-NG",
  limits: {
    maxRecipients: 5,
    maxTeamMembers: 1
  },
  features: []
};

const WorkspaceContext = createContext<WorkspaceContextValue>({
  business: null,
  languageCode: "en",
  locale: "en-NG",
  currencyCode: "NGN",
  planTier: "STARTER",
  t: (key, vars) => interpolate(key, vars),
  formatMoney: (value) => String(value),
  formatDate: (value) => String(value),
  hasFeature: () => false,
  planLabel: "Starter"
});

function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) {
    return template;
  }

  return Object.entries(vars).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, String(value)),
    template
  );
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [business, setBusiness] = useState<StoredBusiness | null>(null);

  useEffect(() => {
    const sync = () => {
      const stored = getStoredSession().business;
      setBusiness(stored);
    };

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("cloaka-session-updated", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("cloaka-session-updated", sync);
    };
  }, []);

  const resolvedBusiness = business ?? defaultBusiness;

  const value = useMemo<WorkspaceContextValue>(() => {
    const languageCode = resolvedBusiness.languageCode;
    const dictionary = translations[languageCode] ?? translations.en;
    const locale = resolvedBusiness.locale || getCountryConfig(resolvedBusiness.countryCode).defaultLocale;
    const currencyCode = resolvedBusiness.currencyCode || getCountryConfig(resolvedBusiness.countryCode).currencyCode;
    const planTier = resolvedBusiness.planTier;

    return {
      business,
      languageCode,
      locale,
      currencyCode,
      planTier,
      t: (key, vars) => interpolate(dictionary[key] ?? key, vars),
      formatMoney: (value) =>
        new Intl.NumberFormat(locale, {
          style: "currency",
          currency: currencyCode,
          minimumFractionDigits: 2
        }).format(Number(value)),
      formatDate: (value, options) =>
        new Intl.DateTimeFormat(locale, {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          ...options
        }).format(typeof value === "string" ? new Date(value) : value),
      hasFeature: (feature) => hasPlanFeature(planTier, feature),
      planLabel: planTier.charAt(0) + planTier.slice(1).toLowerCase()
    };
  }, [business, resolvedBusiness]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}
