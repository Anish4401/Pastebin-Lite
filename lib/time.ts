import { headers } from "next/headers";

export async function getNow(): Promise<number> {
  const h = headers();
  const testNow = (await h).get("x-test-now-ms");

  if (process.env.TEST_MODE === "1" && testNow) {
    return Number(testNow);
  }

  return Date.now();
}
