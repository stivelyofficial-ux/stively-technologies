/**
 * Real client case studies. EMPTY ON PURPOSE: Stively has not shipped paid
 * client work yet, and the site must never imply it has (BRAND_PRINCIPLES #6).
 * When the first real project ships, add one entry here and the "Client
 * results" section appears on the homepage automatically - nothing renders
 * while this array is empty, and it leaves no gap.
 */
export interface ClientResult {
  clientName: string;
  industry: string;
  problem: string;
  whatWeBuilt: string;
  result: string;
  quote?: { text: string; author: string; role?: string };
}

export const CLIENT_RESULTS: ClientResult[] = [];
