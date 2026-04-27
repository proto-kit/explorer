"use client";

import React from "react";
import { ExternalLink } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import configs from "@/config";

interface MinaExplorerLinkProps {
  hash?: string | null;
  className?: string;
}

export default function MinaExplorerLink({
  hash,
  className,
}: MinaExplorerLinkProps) {
  if (!hash) return null;

  const open = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();

    const network = (configs.MINA_NETWORK ?? "lightnet").toLowerCase();

    let base: string;
    if (network === "devnet") {
      base = "https://minascan.io/devnet/tx/";
    } else if (network === "mainnet") {
      base = "https://minascan.io/mainnet/tx/";
    } else {
      const host = configs.MINA_EXPLORER_HOST ?? "localhost";
      const port = configs.MINA_EXPLORER_PORT ?? "8083";
      base = `http://${host}:${port}/?target=transaction&hash=`;
    }
    const href = `${base}${hash}`;
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <button
            type="button"
            onClick={open}
            className={`p-1 rounded hover:bg-muted transition ml-2 ${className ?? ""}`}
            aria-label="Open in Mina explorer"
          >
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" align="center">
          Open in Mina explorer
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
