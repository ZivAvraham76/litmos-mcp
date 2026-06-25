const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 7000;

export async function rateLimitedBatch<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = [];
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(batch.map(fn));
    results.push(...batchResults);
    if (i + BATCH_SIZE < items.length) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }
  return results;
}
