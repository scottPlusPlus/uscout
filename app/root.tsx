import type { LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useEffect } from "react";
import Modal from "react-modal";

import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from "@remix-run/react";

import tailwindStylesheetUrl from "./styles/tailwind.css";
import { getUser } from "./session.server";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: tailwindStylesheetUrl },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css?family=Roboto&display=swap"
    },
    {
      rel: "stylesheet",
      href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css"
    }
  ];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Empower-Kit",
  viewport: "width=device-width,initial-scale=1",
  descrption: "A collection of resources to help you on your journey",

  "og:site_name": "Empower-Kit.com",
  "og:locale": "en_US",
  "og:type": "website",
  "og:title": "Empower-Kit.com",

  "twitter:site": "@ScottPlusPlus",
  "twitter:creator": "@ScottPlusPlus",
  "twitter:description": "A collection of resources to help you on your journey"
});

export async function loader({ request }: LoaderArgs) {
  return json({
    user: await getUser(request)
  });
}

export default function App() {
  useEffect(() => {
    Modal.setAppElement("#appContainer");
  }, []);
  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <div id="appContainer">
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </div>
      </body>
    </html>
  );
}
