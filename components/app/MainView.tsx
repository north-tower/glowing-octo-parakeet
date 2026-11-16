"use client";

import { AccountView } from "@/components/app/views/AccountView";
import { CartView } from "@/components/app/views/CartView";
import { CategoryView } from "@/components/app/views/CategoryView";
import { HomeView } from "@/components/app/views/HomeView";
import { MessagesView } from "@/components/app/views/MessagesView";
import { useNakuruApp } from "@/components/app/AppProvider";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";
import { homeCopy } from "@/lib/nakuru/home-i18n";

export function MainView() {
  const { state } = useNakuruApp();
  const { lang } = usePwaInstall();

  return (
    <main id="v" key={state.tab}>
      {state.tab === "home" ? (
        <h1 className="sr-only">{homeCopy("homePageTitle", lang)}</h1>
      ) : null}
      {state.tab === "home" ? <HomeView /> : null}
      {state.tab === "cat" ? <CategoryView /> : null}
      {state.tab === "msg" ? <MessagesView /> : null}
      {state.tab === "cart" ? <CartView /> : null}
      {state.tab === "acc" ? <AccountView /> : null}
    </main>
  );
}