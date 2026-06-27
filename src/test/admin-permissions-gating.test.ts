import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const read = (p: string) => readFileSync(resolve(__dirname, "../..", p), "utf-8");

const permissionsConfigSrc = read("src/components/admin/PermissionsConfig.tsx");
const authContextSrc = read("src/contexts/AuthContext.tsx");
const adminSrc = read("src/pages/Admin.tsx");

// Convert snake_case permission key -> canCamelCase flag (e.g. view_properties -> canViewProperties)
const toCanFlag = (key: string) =>
  "can" + key.split("_").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join("");

// 1) Extract permission keys from PermissionsConfig PERMISSIONS array.
const permissionKeys: string[] = Array.from(
  permissionsConfigSrc.matchAll(/\{\s*key:\s*"([a-z_]+)"\s*,\s*label:/g)
).map((m) => m[1]);

// 2) Extract canX flags declared in AuthContext (e.g. `canManageProperties =` or `canManageProperties:` in interface).
const canFlagsInAuth = new Set(
  Array.from(authContextSrc.matchAll(/\b(can[A-Z][A-Za-z]+)\b/g)).map((m) => m[1])
);

// 3) Extract canX flags used in Admin.tsx.
const canFlagsInAdmin = new Set(
  Array.from(adminSrc.matchAll(/\b(can[A-Z][A-Za-z]+)\b/g)).map((m) => m[1])
);

describe("Admin permissions gating", () => {
  it("PermissionsConfig has at least one permission", () => {
    expect(permissionKeys.length).toBeGreaterThan(0);
  });

  it.each(["view_properties", "manage_properties", "delete_properties", "bulk_import", "view_contacts", "view_visits", "view_analytics", "view_traffic", "manage_seo", "manage_settings", "manage_bucket", "manage_privacy", "manage_users"])(
    "core permission %s is registered in PermissionsConfig",
    (key) => {
      expect(permissionKeys).toContain(key);
    }
  );

  it.each([])("placeholder", () => {});

  describe("each PermissionsConfig key maps to a canX flag in AuthContext", () => {
    it.each(permissionKeys.map((k) => [k, toCanFlag(k)]))(
      "permission %s -> %s exists in AuthContext",
      (_key, flag) => {
        expect(canFlagsInAuth.has(flag as string)).toBe(true);
      }
    );
  });

  describe("each PermissionsConfig key is used to gate something in Admin.tsx", () => {
    it.each(permissionKeys.map((k) => [k, toCanFlag(k)]))(
      "permission %s -> %s is referenced in Admin.tsx",
      (_key, flag) => {
        expect(canFlagsInAdmin.has(flag as string)).toBe(true);
      }
    );
  });

  describe("each admin tab is gated by an existing canX flag", () => {
    // Match `{ key: "tabKey", ..., show: !!canX }` entries in allTabs.
    const tabEntries = Array.from(
      adminSrc.matchAll(/\{\s*key:\s*"([a-zA-Z]+)"[^}]*show:\s*([^,}]+)[,}]/g)
    ).map((m) => ({ key: m[1], show: m[2].trim() }));

    it("found tab entries in Admin.tsx", () => {
      expect(tabEntries.length).toBeGreaterThan(0);
    });

    it.each(
      tabEntries
        .filter((t) => /can[A-Z]/.test(t.show))
        .map((t) => [t.key, (t.show.match(/can[A-Z][A-Za-z]+/) as RegExpMatchArray)[0]])
    )("tab %s gated by %s (must exist in AuthContext)", (_tab, flag) => {
      expect(canFlagsInAuth.has(flag as string)).toBe(true);
    });

    // Match render blocks: `tab === "x" && canY`
    const renderGates = Array.from(
      adminSrc.matchAll(/tab\s*===\s*"([a-zA-Z]+)"\s*&&\s*(can[A-Z][A-Za-z]+)/g)
    ).map((m) => ({ tab: m[1], flag: m[2] }));

    it("found render-time tab gates in Admin.tsx", () => {
      expect(renderGates.length).toBeGreaterThan(0);
    });

    it.each(renderGates.map((r) => [r.tab, r.flag]))(
      "render gate for tab %s uses %s which exists in AuthContext",
      (_tab, flag) => {
        expect(canFlagsInAuth.has(flag as string)).toBe(true);
      }
    );
  });
});
