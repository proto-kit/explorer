"use client";

/* eslint-disable no-underscore-dangle */

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import TimeAgo from "react-timeago";

import { DetailsLayout } from "@/components/details/layout";
import DataTable from "@/components/ui/DataTable";
import config from "@/config";
import { TransactionHash } from "@/components/settlements/settlementsPageClient";
import { typed } from "@/lib/utils";
import { columns, TableItem } from "@/components/blocks/BlocksPageClient";

export interface GetBatchQueryResponse {
  data: {
    batch:
      | {
          blocks: {
            height: string;
            hash: string;
            createdAt: string;
            result: {
              stateRoot: string;
            };
            _count: {
              transactions: number;
            };
          }[];
          settlementTransactionHash: string;
          height: string;
          createdAt: string;
        }
      | undefined;
  };
}

export default function BatchDetail() {
  const params = useParams<{ height: string }>();
  const [data, setData] = useState<GetBatchQueryResponse["data"]>();
  const [loading, setLoading] = useState(true);
  const query = useCallback(async () => {
    setLoading(true);

    const queryStr = `query GetBatch($height: Int!) {
      batch(where: { height: $height }) {
        height
        settlementTransactionHash
        createdAt
        blocks {
          height
          hash
          createdAt
          result { stateRoot }
          _count { transactions }
        }
      }
    }`;

    const responseData = await fetch(`${config.INDEXER_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: queryStr,
        variables: { height: Number(params.height) },
      }),
    });
    try {
      const response = typed<GetBatchQueryResponse>(await responseData.json());
      setData(response.data);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
      setData(undefined);
    }
  }, [params.height]);

  useEffect(() => {
    void query();
  }, [query]);

  const details = [
    {
      label: "Height",
      value: data?.batch?.height ?? "—",
    },
    {
      label: "Settlement Transaction Hash",
      value: (
        <TransactionHash
          transactionHash={data?.batch?.settlementTransactionHash}
        />
      ),
    },
    {
      label: "Blocks",
      value: `${data?.batch?.blocks?.length ?? "—"}`,
    },
    {
      label: "Created At",
      value: data?.batch?.createdAt
        ? <TimeAgo date={data.batch.createdAt} minPeriod={30} />
        : "—",
    },
  ];

  const blocks: TableItem[] = (data?.batch?.blocks || []).map((item) => ({
    height: item.height,
    hash: item.hash,
    transactions: item._count?.transactions?.toString(),
    stateRoot: item.result?.stateRoot,
    createdAt: item.createdAt,
  }));

  return (
    <DetailsLayout
      title={
        <div className="flex gap-4">
          Batch {!loading && <>#{data?.batch?.height}</>}
        </div>
      }
      details={details}
      loading={loading}
    >
      <DataTable
        view={Object.keys(columns)}
        title="Blocks"
        columns={columns}
        items={blocks}
        totalCount={blocks.length.toString()}
        loading={loading}
        navigationPath="/blocks/{hash}"
        copyKeys={["hash", "stateRoot"]}
        columnRenderers={{ createdAt: (item) => <TimeAgo date={item.createdAt} minPeriod={30} /> }}
      />
    </DetailsLayout>
  );
}
/* eslint-enable no-underscore-dangle */
