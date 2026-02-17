import { env } from "next-runtime-env";

const config = {
  INDEXER_URL:
    env("NEXT_PUBLIC_INDEXER_URL") ?? "http://localhost:8081/graphql",
  DASHBOARD_TITLE: env("NEXT_PUBLIC_DASHBOARD_TITLE") ?? "Explorer",
  DASHBOARD_SLOGAN:
    env("NEXT_PUBLIC_DASHBOARD_SLOGAN") ??
    "Explore the blockchain. Search in real-time.",
};

export default config;
