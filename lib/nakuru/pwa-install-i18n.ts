import type { LandingLang } from "@/lib/nakuru/i18n";

export type InstallCopyKey =
  | "installCardTitle"
  | "installCardBody"
  | "installBtn"
  | "installRow"
  | "closeAria"
  | "installedToast"
  | "offlineBanner"
  | "sheetTitle"
  | "iosStep1"
  | "iosStep2"
  | "iosStep3"
  | "inAppTitle"
  | "inAppStep1"
  | "inAppStep2"
  | "copyLink"
  | "copied"
  | "genericTitle"
  | "genericBody"
  | "dismissSheet";

const COPY: Record<InstallCopyKey, Record<LandingLang, string>> = {
  installCardTitle: {
    en: "Add NakuruHub to your home screen",
    sw: "Ongeza NakuruHub kwenye skrini ya nyumbani",
  },
  installCardBody: {
    en: "Opens full-screen, one tap from your home screen.",
    sw: "Hufunguka skrini nzima — tap moja kwenye skrini ya nyumbani.",
  },
  installBtn: {
    en: "Install",
    sw: "Sakinisha",
  },
  installRow: {
    en: "Install app",
    sw: "Sakinisha programu",
  },
  closeAria: {
    en: "Dismiss install suggestion",
    sw: "Funga ushauri wa kusakinisha",
  },
  installedToast: {
    en: "NakuruHub installed",
    sw: "NakuruHub imesakinishwa",
  },
  offlineBanner: {
    en: "You’re offline — showing saved content where available.",
    sw: "Huko nje ya mtandao — unaona maudhui yaliyohifadhiwa.",
  },
  sheetTitle: {
    en: "Install NakuruHub",
    sw: "Sakinisha NakuruHub",
  },
  iosStep1: {
    en: "Tap the Share icon in Safari’s toolbar (bottom of the screen).",
    sw: "Gusa ikoni ya Shiriki kwenye Safari (chini ya skrini).",
  },
  iosStep2: {
    en: "Scroll and tap “Add to Home Screen”.",
    sw: "Sogeza chini uguse “Add to Home Screen”.",
  },
  iosStep3: {
    en: "Tap “Add” to finish.",
    sw: "Gusa “Add” kumaliza.",
  },
  inAppTitle: {
    en: "Open in your browser to install",
    sw: "Fungua kwenye kivinjari chako ili kusakinisha",
  },
  inAppStep1: {
    en: "Tap the ⋮ or share menu in this app.",
    sw: "Gusa ⋮ au menyu ya kushiriki ndani ya programu hii.",
  },
  inAppStep2: {
    en: "Choose “Open in Chrome” or “Open in Safari”.",
    sw: "Chagua “Open in Chrome” au “Open in Safari”.",
  },
  copyLink: {
    en: "Copy link",
    sw: "Nakili kiungo",
  },
  copied: {
    en: "Link copied",
    sw: "Kiungo kimenakiliwa",
  },
  genericTitle: {
    en: "Add from your browser menu",
    sw: "Ongeza kupitia menyu ya kivinjari",
  },
  genericBody: {
    en: "Use your browser menu → Install app / Add to Home screen.",
    sw: "Tumia menyu ya kivinjari → Install app / Add to Home screen.",
  },
  dismissSheet: {
    en: "Close",
    sw: "Funga",
  },
};

export function installCopy(
  key: InstallCopyKey,
  lang: LandingLang,
): string {
  return COPY[key][lang];
}