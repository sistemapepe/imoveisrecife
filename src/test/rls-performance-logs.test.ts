import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

/**
 * RLS tests for public.performance_logs
 *
 * Expected policies:
 *  - SELECT: only admin/supervisor (via has_role)
 *  - INSERT: anon + authenticated, but metric_name & metric_value required
 *
 * These tests run as anon (no session). To exercise admin/supervisor
 * positive paths, set TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD env vars.
 */
describe("RLS · performance_logs", () => {
  const anon = createClient(SUPABASE_URL, ANON_KEY);

  it("anon cannot SELECT performance_logs", async () => {
    const { data, error } = await anon
      .from("performance_logs")
      .select("id")
      .limit(1);
    // RLS returns empty array (not an error) for SELECT denied
    expect(error).toBeNull();
    expect(data ?? []).toHaveLength(0);
  });

  it("anon CAN INSERT a valid metric (web vitals)", async () => {
    const { error } = await anon.from("performance_logs").insert({
      metric_name: "LCP",
      metric_value: 1234,
      page_url: "https://test.example/vitest",
    });
    expect(error).toBeNull();
  });

  it("INSERT without metric_name is rejected", async () => {
    const { error } = await anon
      .from("performance_logs")
      .insert({ metric_value: 100 } as any);
    expect(error).not.toBeNull();
  });

  it("INSERT without metric_value is rejected", async () => {
    const { error } = await anon
      .from("performance_logs")
      .insert({ metric_name: "FCP" } as any);
    expect(error).not.toBeNull();
  });

  const adminEmail = import.meta.env.VITE_TEST_ADMIN_EMAIL as string | undefined;
  const adminPassword = import.meta.env.VITE_TEST_ADMIN_PASSWORD as
    | string
    | undefined;

  it.skipIf(!adminEmail || !adminPassword)(
    "admin/supervisor CAN SELECT performance_logs",
    async () => {
      const client = createClient(SUPABASE_URL, ANON_KEY);
      const { error: signInErr } = await client.auth.signInWithPassword({
        email: adminEmail!,
        password: adminPassword!,
      });
      expect(signInErr).toBeNull();

      const { data, error } = await client
        .from("performance_logs")
        .select("id")
        .limit(5);
      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      await client.auth.signOut();
    }
  );
});
