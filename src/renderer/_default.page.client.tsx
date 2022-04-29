import React from "react";
import ReactDOM from "react-dom";
import { getPage } from "vite-plugin-ssr/client";
import { PageLayout } from "./PageLayout";

hydrate();

async function hydrate() {
  const pageContext = await getPage();
  const { Page, pageProps } = pageContext as any;
  const el = document.getElementById("page-view");
  if (!el) return <></>;

  // NOTE: createRoot, hydrateRoot を使うと 複数行選択時に delete key が効かなくなる
  ReactDOM.render(
    <React.StrictMode>
      <PageLayout>
        <Page {...pageProps} />
      </PageLayout>
    </React.StrictMode>,
    el
  );
}
