import { env } from "next-runtime-env";

const config = {
  INDEXER_URL:
    env("NEXT_PUBLIC_INDEXER_URL") ?? "http://localhost:8081/graphql",
  DASHBOARD_TITLE: env("NEXT_PUBLIC_DASHBOARD_TITLE") ?? "Explorer",
  DASHBOARD_SLOGAN:
    env("NEXT_PUBLIC_DASHBOARD_SLOGAN") ??
    "Explore the blockchain. Search in real-time.",
  MINA_NETWORK: env("NEXT_PUBLIC_MINA_NETWORK") ?? "lightnet",
  MINA_EXPLORER_HOST: env("NEXT_PUBLIC_MINA_EXPLORER_HOST") ?? "localhost",
  MINA_EXPLORER_PORT: env("NEXT_PUBLIC_MINA_EXPLORER_PORT") ?? "8083",
};

export default config;
