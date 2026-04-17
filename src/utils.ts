export function round(x: number, decimal: number = 0) {
  if (decimal === 0) return Math.round(x);

  const dec10 = 10 ** decimal;
  return Math.round(x * dec10) / dec10;
}

export function parseGasPriceMultiplier(raw: string | undefined): number {
  if (!raw) return 10;
  const value = Number(raw);
  if (isNaN(value) || value <= 0 || value > 100) {
    throw new Error(`GAS_PRICE_MULTIPLIER must be a positive number up to 100, got: ${raw}`);
  }
  return round(value, 2);
}

export const MAX_UINT24 = 2 ** 24 - 1;

export function parseRewardEpochId(raw: unknown): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 0 || id > MAX_UINT24) {
    throw new Error(`Invalid reward epoch ID: must be an integer between 0 and ${MAX_UINT24}.`);
  }
  return id;
}

export function parseOptionalEpochId(raw: unknown): number {
  if (raw === undefined) return NaN;
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 0 || id > MAX_UINT24) {
    throw new Error(`Invalid first reward epoch ID: must be an integer between 0 and ${MAX_UINT24}.`);
  }
  return id;
}
