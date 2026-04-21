"use client";

/* eslint-disable no-underscore-dangle */

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import TimeAgo from "react-timeago";
import Truncate from "react-truncate-inside/es";

import { DetailsLayout } from "@/components/details/layout";
import DataTable from "@/components/ui/DataTable";
import config from "@/config";
import { typed } from "@/lib/utils";
import { columns, TableItem } from "@/components/batches/BatchesPageClient";

export interface GetSettlementQueryResponse {
  data: {
    settlement:
      | {
          batches: {
            height: string;
            settlementTransactionHash: string;
            createdAt: string;
            _count: {
              blocks: number;
            };
          }[];
          transactionHash: string;
          promisedMessagesHash: string;
          createdAt: string;
        }
      | undefined;
  };
}

export default function SettlementDetail() {
  const params = useParams<{ transactionHash: string }>();
  const [data, setData] = useState<GetSettlementQueryResponse["data"]>();
  const [loading, setLoading] = useState(true);

  const query = useCallback(async () => {
    setLoading(true);
    const queryStr = `query GetSettlement($transactionHash: String!) {
      settlement(where: { transactionHash: $transactionHash }) {
        batches {
          height
          settlementTransactionHash
          createdAt
          _count { blocks }
        }
        transactionHash
        promisedMessagesHash
        createdAt
      }
    }`;

    const responseData = await fetch(`${config.INDEXER_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: queryStr,
        variables: { transactionHash: params.transactionHash },
      }),
    });
    try {
      const response = typed<GetSettlementQueryResponse>(
        await responseData.json(),
      );
      setData(response.data);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
      setData(undefined);
    }
  }, [params.transactionHash]);

  useEffect(() => {
    void query();
  }, [query]);

  const details = [
    {
      label: "Transaction Hash",
      value: data?.settlement?.transactionHash ?? "—",
    },
    {
      label: "Promised Messages Hash",
      value: data?.settlement?.promisedMessagesHash ?? "—",
    },
    {
      label: "Batches",
      value: `${data?.settlement?.batches?.length ?? "—"}`,
    },
    {
      label: "Created",
      value: data?.settlement?.createdAt ? (
        <TimeAgo date={data.settlement.createdAt} minPeriod={30} />
      ) : (
        "—"
      ),
    },
  ];

  const batches: TableItem[] = (data?.settlement?.batches || []).map(
    (item) => ({
      height: item.height,
      settlementTransactionHash: item.settlementTransactionHash,
      blocks: item._count?.blocks?.toString(),
      createdAt: item.createdAt,
    }),
  );

  return (
    <DetailsLayout
      title={
        <div className="flex gap-4">
          Settlement
          {!loading && (
            <Truncate
              text={data?.settlement?.transactionHash ?? ""}
              width={500}
            />
          )}
        </div>
      }
      details={details}
      loading={loading}
    >
      <DataTable
        view={Object.keys(columns)}
        title="Batches"
        columns={columns}
        items={batches}
        totalCount={batches.length.toString()}
        loading={loading}
        navigationPath="/batches/{height}"
        copyKeys={["settlementTransactionHash"]}
        columnRenderers={{
          createdAt: (item) => <TimeAgo date={item.createdAt} minPeriod={30} />,
        }}
      />
    </DetailsLayout>
  );
}
/* eslint-enable no-underscore-dangle */
