import { useMutation, useQuery } from "@tanstack/react-query";
import { apiBaseUrl, createHttpClient, type CredenceClient } from "./client";
import type { ProcurementForm } from "./types";

let client: CredenceClient | undefined;

export function credenceClient(): CredenceClient {
  client ??= createHttpClient(apiBaseUrl());
  return client;
}

// Recorded data does not change while the app runs; dry runs are evaluated on demand.
const STATIC = { staleTime: Infinity, retry: 1 } as const;

export const useHealth = () =>
  useQuery({
    queryKey: ["credence", "health"],
    queryFn: () => credenceClient().health(),
    retry: 0,
    refetchInterval: 30_000,
  });

export const useProviders = () =>
  useQuery({
    queryKey: ["credence", "providers"],
    queryFn: () => credenceClient().listProviders(),
    ...STATIC,
  });

export const usePresets = () =>
  useQuery({
    queryKey: ["credence", "presets"],
    queryFn: () => credenceClient().procurementPresets(),
    ...STATIC,
  });

export const useOperations = () =>
  useQuery({
    queryKey: ["credence", "operations"],
    queryFn: () => credenceClient().listOperations(),
    ...STATIC,
  });

export const useOperation = (operationId: string) =>
  useQuery({
    queryKey: ["credence", "operation", operationId],
    queryFn: () => credenceClient().getOperation(operationId),
    ...STATIC,
  });

export const useExposure = (operationId: string | undefined) =>
  useQuery({
    queryKey: ["credence", "exposure", operationId],
    queryFn: () => credenceClient().getAccountingExposure(operationId as string),
    enabled: !!operationId,
    ...STATIC,
  });

export const usePaymentStatus = (operationId: string | undefined) =>
  useQuery({
    queryKey: ["credence", "payment", operationId],
    queryFn: () => credenceClient().getPaymentStatus(operationId as string),
    enabled: !!operationId,
    ...STATIC,
  });

export const useReceipts = () =>
  useQuery({
    queryKey: ["credence", "receipts"],
    queryFn: () => credenceClient().listReceipts(),
    ...STATIC,
  });

export const useReceiptEvidence = (digest: string | undefined) =>
  useQuery({
    queryKey: ["credence", "receipt", digest],
    queryFn: () => credenceClient().getReceiptEvidence(digest as string),
    enabled: !!digest,
    ...STATIC,
  });

export const useXrplFixtures = () =>
  useQuery({
    queryKey: ["credence", "xrpl-fixtures"],
    queryFn: () => credenceClient().xrplSettlementFixtures(),
    ...STATIC,
  });

export const useEvaluateProcurement = () =>
  useMutation({
    mutationFn: (form: ProcurementForm) => credenceClient().evaluateProcurement(form),
  });

export const useSubmitPurchase = () =>
  useMutation({ mutationFn: (form: ProcurementForm) => credenceClient().submitPurchase(form) });
