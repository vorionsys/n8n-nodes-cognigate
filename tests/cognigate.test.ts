// SPDX-License-Identifier: LicenseRef-Sustainable-Use-1.0
// Tests for @vorionsys/n8n-nodes-cognigate
// Run: npx jest --config jest.config.js

import { Cognigate } from "../nodes/Cognigate/Cognigate.node";
import { CognigateApi } from "../credentials/CognigateApi.credentials";

describe("CognigateApi Credentials", () => {
  const cred = new CognigateApi();

  it("should have correct name and display name", () => {
    expect(cred.name).toBe("cognigateApi");
    expect(cred.displayName).toBe("Cognigate API");
  });

  it("should define baseUrl, apiKey, and adminKey properties", () => {
    const names = cred.properties.map((p) => p.name);
    expect(names).toContain("baseUrl");
    expect(names).toContain("apiKey");
    expect(names).toContain("adminKey");
  });

  it("should have password type for apiKey and adminKey", () => {
    const apiKey = cred.properties.find((p) => p.name === "apiKey");
    const adminKey = cred.properties.find((p) => p.name === "adminKey");
    expect(apiKey?.typeOptions).toEqual({ password: true });
    expect(adminKey?.typeOptions).toEqual({ password: true });
  });

  it("should use X-API-Key header for authentication", () => {
    expect(cred.authenticate).toEqual({
      type: "generic",
      properties: {
        headers: {
          "X-API-Key": "={{$credentials.apiKey}}",
        },
      },
    });
  });

  it("should test via /health endpoint", () => {
    expect(cred.test?.request.url).toBe("/health");
    expect(cred.test?.request.method).toBe("GET");
  });
});

describe("Cognigate Node", () => {
  const node = new Cognigate();
  const desc = node.description;

  it("should have correct metadata", () => {
    expect(desc.name).toBe("cognigate");
    expect(desc.displayName).toBe("Cognigate");
    expect(desc.group).toContain("transform");
    expect(desc.version).toBe(1);
  });

  it("should require cognigateApi credentials", () => {
    expect(desc.credentials).toEqual([
      { name: "cognigateApi", required: true },
    ]);
  });

  it("should have single input and output", () => {
    expect(desc.inputs).toEqual(["main"]);
    expect(desc.outputs).toEqual(["main"]);
  });

  describe("Resources", () => {
    const resourceProp = desc.properties.find(
      (p) =>
        p.name === "resource" && !("displayOptions" in p && p.displayOptions),
    );

    it("should define 8 resources", () => {
      expect(resourceProp?.type).toBe("options");
      const options = (resourceProp as any)?.options;
      expect(options).toHaveLength(8);
      const values = options.map((o: any) => o.value);
      expect(values).toEqual([
        "agent",
        "compliance",
        "enforce",
        "health",
        "intent",
        "proof",
        "reference",
        "trust",
      ]);
    });

    it("should default to intent", () => {
      expect(resourceProp?.default).toBe("intent");
    });
  });

  describe("Intent operations", () => {
    const ops = desc.properties.find(
      (p) =>
        p.name === "operation" &&
        p.displayOptions?.show?.resource?.includes("intent"),
    );

    it("should have create and get operations", () => {
      const values = (ops as any)?.options.map((o: any) => o.value);
      expect(values).toContain("create");
      expect(values).toContain("get");
    });
  });

  describe("Enforce operations", () => {
    const ops = desc.properties.find(
      (p) =>
        p.name === "operation" &&
        p.displayOptions?.show?.resource?.includes("enforce"),
    );

    it("should have validate, listPolicies, getPolicy operations", () => {
      const values = (ops as any)?.options.map((o: any) => o.value);
      expect(values).toContain("validate");
      expect(values).toContain("listPolicies");
      expect(values).toContain("getPolicy");
    });
  });

  describe("Proof operations", () => {
    const ops = desc.properties.find(
      (p) =>
        p.name === "operation" &&
        p.displayOptions?.show?.resource?.includes("proof"),
    );

    it("should have create, get, query, stats, verify operations", () => {
      const values = (ops as any)?.options.map((o: any) => o.value);
      expect(values).toEqual(["create", "get", "query", "stats", "verify"]);
    });
  });

  describe("Agent operations", () => {
    const ops = desc.properties.find(
      (p) =>
        p.name === "operation" &&
        p.displayOptions?.show?.resource?.includes("agent"),
    );

    it("should have full CRUD + list operations", () => {
      const values = (ops as any)?.options.map((o: any) => o.value);
      expect(values).toEqual(["create", "list", "get", "update", "delete"]);
    });
  });

  describe("Trust operations", () => {
    const ops = desc.properties.find(
      (p) =>
        p.name === "operation" &&
        p.displayOptions?.show?.resource?.includes("trust"),
    );

    it("should have admit, get, signal, revoke, history, tiers", () => {
      const values = (ops as any)?.options.map((o: any) => o.value);
      expect(values).toEqual([
        "admit",
        "get",
        "signal",
        "revoke",
        "history",
        "tiers",
      ]);
    });
  });

  describe("Health operations", () => {
    const ops = desc.properties.find(
      (p) =>
        p.name === "operation" &&
        p.displayOptions?.show?.resource?.includes("health"),
    );

    it("should have full, live, ready operations", () => {
      const values = (ops as any)?.options.map((o: any) => o.value);
      expect(values).toEqual(["full", "live", "ready"]);
    });
  });

  describe("Reference operations", () => {
    const ops = desc.properties.find(
      (p) =>
        p.name === "operation" &&
        p.displayOptions?.show?.resource?.includes("reference"),
    );

    it("should have tiers, tierLookup, capabilities, errors, rateLimits, versions", () => {
      const values = (ops as any)?.options.map((o: any) => o.value);
      expect(values).toEqual([
        "tiers",
        "tierLookup",
        "capabilities",
        "errors",
        "rateLimits",
        "versions",
      ]);
    });
  });

  describe("Compliance operations", () => {
    const ops = desc.properties.find(
      (p) =>
        p.name === "operation" &&
        p.displayOptions?.show?.resource?.includes("compliance"),
    );

    it("should have health, frameworkHealth, snapshot, dashboard, evidence, trigger", () => {
      const values = (ops as any)?.options.map((o: any) => o.value);
      expect(values).toEqual([
        "health",
        "frameworkHealth",
        "snapshot",
        "dashboard",
        "evidence",
        "trigger",
      ]);
    });
  });

  describe("Icon", () => {
    it("should reference cognigate.svg", () => {
      expect(desc.icon).toBe("file:cognigate.svg");
    });
  });

  describe("Subtitle", () => {
    it("should show resource + operation", () => {
      expect(desc.subtitle).toBe(
        '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
      );
    });
  });
});
