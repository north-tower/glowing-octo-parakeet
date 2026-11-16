import type { AssistantAction } from "./types";

const WHITELIST = new Set([
  "navigate",
  "search",
  "setZone",
  "openProduct",
  "openOrder",
  "openHelp",
  "startInstall",
]);

export function isWhitelistedAction(action: AssistantAction): boolean {
  return WHITELIST.has(action.type);
}

export type ActionExecutorDeps = {
  dispatch: (action: { type: string; [key: string]: unknown }) => void;
  router: { push: (href: string) => void };
  openInstallSheet: (source: "card" | "account" | "retrigger") => void;
  toast: (msg: string) => void;
  lang: "en" | "sw";
};

export function actionRequiresConfirm(action: AssistantAction): boolean {
  return action.type === "setZone";
}

export function executeAssistantAction(
  action: AssistantAction,
  deps: ActionExecutorDeps,
): void {
  if (!isWhitelistedAction(action)) {
    deps.toast(deps.lang === "sw" ? "Hatua hiyo hairuhusiwi." : "That action isn't allowed.");
    return;
  }

  switch (action.type) {
    case "navigate": {
      const tab = action.params?.tab;
      if (tab) deps.dispatch({ type: "SET_TAB", tab });
      const acc = action.params?.acc;
      if (acc !== undefined) {
        deps.dispatch({ type: "SET_ACC", acc });
      }
      if (action.params?.category) {
        deps.dispatch({ type: "SET_CAT", cat: action.params.category });
      }
      if (tab === "home" && !action.params?.category) {
        deps.dispatch({ type: "SET_TAB", tab: "home" });
      }
      break;
    }
    case "search":
      deps.dispatch({ type: "SET_Q", q: action.query });
      deps.dispatch({ type: "SET_TAB", tab: "home" });
      break;
    case "setZone":
      deps.dispatch({ type: "SET_AREA", area: action.zone });
      deps.toast(
        deps.lang === "sw"
          ? `Eneo: ${action.zone}`
          : `Delivery zone: ${action.zone}`,
      );
      break;
    case "openProduct":
      deps.router.push(`/app/p/${action.id}`);
      break;
    case "openOrder":
      deps.dispatch({ type: "SET_TAB", tab: "cart" });
      deps.toast(
        deps.lang === "sw"
          ? "Angalia agizo kwenye Kikapu."
          : "See your order in Cart.",
      );
      break;
    case "openHelp":
      deps.dispatch({ type: "SET_TAB", tab: "msg" });
      deps.toast(
        deps.lang === "sw"
          ? "Ujumbe na mawasiliano."
          : "Messages and support.",
      );
      break;
    case "startInstall":
      deps.openInstallSheet("account");
      break;
    default:
      break;
  }
}