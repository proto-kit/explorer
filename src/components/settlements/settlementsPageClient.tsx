"use client";

/* eslint-disable no-underscore-dangle */

import { useCallback, useEffect, useState } from "react";
import TimeAgo from "react-timeago";
import { z } from "zod";

import DataTable from "@/components/ui/DataTable";
import { FilterFieldDef } from "@/components/ui/FilterBuilder";
import Copy from "@/components/ui/copy-to-clipboard";
import MinaExplorerLink from "@/components/ui/minaExplorerLink";
import useQueryParams from "@/hooks/use-query-params";
import configs from "@/config";
import { showPerPage } from "@/components/pagination";
import { buildWhere } from "@/lib/utils";

export interface TableItem {
  transactionHash: string;
  promisedMessagesHash: string;
  batches: string;
  createdAt: string;
}

export interface GetSettlementsQueryResponse {
  data: {
    settlements: {
      transactionHash: string;
      promisedMessagesHash: string;
      createdAt: string;
      _count: {
        batches: number;
      };
    }[];
    aggregateSettlement: {
      _count: {
        _all: number;
      };
    };
  };
}

export const columns: Record<keyof TableItem, string> = {
  transactionHash: "Transaction Hash",
  promisedMessagesHash: "Promised Messages Hash",
  batches: "Batches",
  createdAt: "Created",
};

export function TransactionHash(props: { transactionHash?: string | null }) {
  const hash = String(props.transactionHash ?? "");

  return (
    <div className="flex items-center gap-2">
      <Copy text={hash} />
      <MinaExplorerLink hash={hash} />
    </div>
  );
}

const formSchema = z.object({
  transactionHash: z.string().optional(),
  promisedMessagesHash: z.string().optional(),
});

const querySchema = {
  transactionHash: "string",
  promisedMessagesHash: "string",
} as const;

const fields: FilterFieldDef[] = [
  {
    name: "transactionHash",
    label: "Transaction Hash",
    type: "string",
    placeholder: "Filter by transaction hash",
  },
  {
    name: "promisedMessagesHash",
    label: "Promised Messages Hash",
    type: "string",
    placeholder: "Filter by promised messages hash",
  },
];

const graphqlQuery = `query GetSettlements($take: Int!, $skip: Int!, $where: SettlementWhereInput) {
  settlements(take: $take, skip: $skip, orderBy: { createdAt: desc }, where: $where) {
    transactionHash
    promisedMessagesHash
    createdAt
    _count { batches }
  }
  aggregateSettlement(where: $where) { _count { _all } }
}`;

export default function SettlementsPageClient() {
  const [page, view, filters, setPage, setView, setFilters] = useQueryParams(
    columns,
    querySchema,
  );

  const [data, setData] = useState<TableItem[]>([]);
  const [totalCount, setTotalCount] = useState<string>("0");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const skip = showPerPage * (Math.max(1, page) - 1);

    const where = buildWhere<string | number>(filters, querySchema);

    const variables = {
      take: showPerPage,
      skip,
      where: Object.keys(where).length ? where : undefined,
    };

    try {
      const response = await fetch(`${configs.INDEXER_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: graphqlQuery, variables }),
      });
      const result: GetSettlementsQueryResponse =
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        (await response.json()) as GetSettlementsQueryResponse;
      const settlements = result.data?.settlements;
      const mappedItems: TableItem[] = settlements?.map((item) => ({
        transactionHash: item.transactionHash,
        promisedMessagesHash: item.promisedMessagesHash,
        batches: item._count?.batches?.toString() || "0",
        createdAt: item.createdAt,
      }));

      setData(mappedItems);
      setTotalCount(
        result.data?.aggregateSettlement?._count?._all?.toString() || "0",
      );
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch settlements:", error);
      setLoading(false);
      setData([]);
      setTotalCount("0");
    }
  }, [filters, page]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return (
    <DataTable
      title="Settlements"
      columns={columns}
      items={data}
      totalCount={totalCount}
      loading={loading}
      filterFields={fields}
      formSchema={formSchema}
      filters={filters}
      page={page}
      view={view}
      onFiltersChange={setFilters}
      onPageChange={setPage}
      onViewChange={setView}
      navigationPath="/settlements/{transactionHash}"
      copyKeys={["promisedMessagesHash"]}
      columnRenderers={{
        transactionHash: (item) => (
          <TransactionHash
            transactionHash={String(item.transactionHash ?? "")}
          />
        ),
        createdAt: (item) => <TimeAgo date={item.createdAt} minPeriod={30} />,
      }}
    />
  );
}
/* eslint-enable no-underscore-dangle */
