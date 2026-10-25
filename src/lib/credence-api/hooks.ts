import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiBaseUrl, createHttpClient, type CredenceClient } from "./client";
import { getSessionToken } from "./session";
import type { PrepareBody, ProcurementForm, SignedObjectJson } from "./types";

let client: CredenceClient | undefined;

export function credenceClient(): CredenceClient {
  client ??= createHttpClient(apiBaseUrl(), undefined, getSessionToken);
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

// --- I2a: integrated offline service. Live data changes, so these refetch. -------------------

const LIVE = { staleTime: 0, retry: 0 } as const;

export const useLiveSession = (token: string | null) =>
  useQuery({
    queryKey: ["credence", "live", "session", token],
    queryFn: () => credenceClient().liveSession(),
    enabled: !!token,
    ...LIVE,
  });

export const useLiveOperations = (token: string | null) =>
  useQuery({
    queryKey: ["credence", "live", "operations", token],
    queryFn: () => credenceClient().listLiveOperations(),
    enabled: !!token,
    ...LIVE,
  });

export const useLiveFacilities = (token: string | null) =>
  useQuery({
    queryKey: ["credence", "live", "facilities", token],
    queryFn: () => credenceClient().liveFacilities(),
    enabled: !!token,
    ...LIVE,
  });

export const useLiveOperation = (operationId: string) =>
  useQuery({
    queryKey: ["credence", "live", "operation", operationId],
    queryFn: () => credenceClient().getLiveOperation(operationId),
    ...LIVE,
  });

export const useLiveExposure = (operationId: string) =>
  useQuery({
    queryKey: ["credence", "live", "exposure", operationId],
    queryFn: () => credenceClient().getLiveExposure(operationId),
    ...LIVE,
  });

export const useLivePayment = (operationId: string) =>
  useQuery({
    queryKey: ["credence", "live", "payment", operationId],
    queryFn: () => credenceClient().getLivePayment(operationId),
    ...LIVE,
  });

export const useLiveReceipt = (digest: string | null | undefined) =>
  useQuery({
    queryKey: ["credence", "live", "receipt", digest],
    queryFn: () => credenceClient().getLiveReceipt(digest as string),
    enabled: !!digest,
    ...LIVE,
  });

export const usePreparePurchase = () =>
  useMutation({ mutationFn: (body: PrepareBody) => credenceClient().preparePurchase(body) });

export const useSubmitSignedPurchase = () =>
  useMutation({
    mutationFn: (body: { preparation_id: string; prompt: string; signature: SignedObjectJson }) =>
      credenceClient().submitSignedPurchase(body),
  });

export const useLiveResponse = (operationId: string) => {
  const queries = useQueryClient();
  return useMutation({
    mutationFn: (authorization: Record<string, unknown>) =>
      credenceClient().postLiveResponse(operationId, authorization),
    onSettled: () => queries.invalidateQueries({ queryKey: ["credence", "live"] }),
  });
};
