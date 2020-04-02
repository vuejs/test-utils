/**
 * simulate a delay (eg, API call).
 */
export const simulateDelay = ({ delayInMs }: { delayInMs: number }) => {
  return new Promise((res) => setTimeout(res, delayInMs))
}
