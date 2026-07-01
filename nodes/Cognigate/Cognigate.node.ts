// SPDX-License-Identifier: LicenseRef-Sustainable-Use-1.0
// Copyright 2024-2026 Vorion LLC

import type {
  IDataObject,
  IExecuteFunctions,
  IHttpRequestMethods,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  JsonObject,
} from "n8n-workflow";
import { NodeApiError, NodeOperationError } from "n8n-workflow";

// ─── helpers ───────────────────────────────────────────────────────────────────

async function cognigateRequest(
  this: IExecuteFunctions,
  method: IHttpRequestMethods,
  path: string,
  body?: IDataObject,
  qs?: IDataObject,
  useAdminKey = false,
): Promise<IDataObject | IDataObject[]> {
  const credentials = await this.getCredentials("cognigateApi");
  const baseUrl = (credentials.baseUrl as string).replace(/\/+$/, "");

  const headers: IDataObject = {
    "Content-Type": "application/json",
    "X-API-Key": credentials.apiKey as string,
  };
  if (useAdminKey && credentials.adminKey) {
    headers["X-Admin-Key"] = credentials.adminKey as string;
  }

  const options = {
    method,
    url: `${baseUrl}${path}`,
    headers,
    body,
    qs,
    json: true,
  };

  try {
    return (await this.helpers.httpRequest(options)) as
      | IDataObject
      | IDataObject[];
  } catch (error) {
    throw new NodeApiError(this.getNode(), error as JsonObject);
  }
}

// ─── node ──────────────────────────────────────────────────────────────────────

export class Cognigate implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Cognigate",
    name: "cognigate",
    icon: "file:cognigate.svg",
    group: ["transform"],
    version: 1,
    subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
    description:
      "AI agent governance — trust scoring, capability enforcement, and cryptographic audit proof via the BASIS standard",
    defaults: { name: "Cognigate" },
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      {
        name: "cognigateApi",
        required: true,
      },
    ],
    properties: [
      // ── Resource selector ────────────────────────────────────────────────
      {
        displayName: "Resource",
        name: "resource",
        type: "options",
        noDataExpression: true,
        options: [
          {
            name: "Agent",
            value: "agent",
            description: "Register and manage AI agents",
          },
          {
            name: "Compliance",
            value: "compliance",
            description: "Continuous compliance monitoring (CA-7)",
          },
          {
            name: "Enforce",
            value: "enforce",
            description: "Validate plans against BASIS policies",
          },
          {
            name: "Health",
            value: "health",
            description: "Instance health checks",
          },
          {
            name: "Intent",
            value: "intent",
            description: "Normalize goals into structured plans",
          },
          {
            name: "Proof",
            value: "proof",
            description: "Cryptographic audit ledger",
          },
          {
            name: "Reference",
            value: "reference",
            description: "Read-only lookups (tiers, capabilities, errors)",
          },
          {
            name: "Trust",
            value: "trust",
            description: "Trust lifecycle management",
          },
        ],
        default: "intent",
      },

      // ════════════════════════════════════════════════════════════════════
      //  INTENT
      // ════════════════════════════════════════════════════════════════════
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: { show: { resource: ["intent"] } },
        options: [
          {
            name: "Create",
            value: "create",
            description: "Normalize a goal into a structured plan",
            action: "Create an intent",
          },
          {
            name: "Get",
            value: "get",
            description: "Retrieve a previously processed intent",
            action: "Get an intent",
          },
        ],
        default: "create",
      },
      // Intent → Create
      {
        displayName: "Entity ID",
        name: "entityId",
        type: "string",
        required: true,
        default: "",
        displayOptions: {
          show: { resource: ["intent"], operation: ["create"] },
        },
        description: "ID of the requesting entity/agent",
      },
      {
        displayName: "Goal",
        name: "goal",
        type: "string",
        required: true,
        default: "",
        typeOptions: { rows: 4 },
        displayOptions: {
          show: { resource: ["intent"], operation: ["create"] },
        },
        description: "The goal or prompt to process (1-4096 chars)",
      },
      {
        displayName: "Additional Fields",
        name: "additionalFields",
        type: "collection",
        placeholder: "Add Field",
        default: {},
        displayOptions: {
          show: { resource: ["intent"], operation: ["create"] },
        },
        options: [
          {
            displayName: "Context (JSON)",
            name: "context",
            type: "json",
            default: "{}",
            description: "Additional context as JSON object",
          },
          {
            displayName: "Metadata (JSON)",
            name: "metadata",
            type: "json",
            default: "{}",
            description: "Request metadata as JSON object",
          },
        ],
      },
      // Intent → Get
      {
        displayName: "Intent ID",
        name: "intentId",
        type: "string",
        required: true,
        default: "",
        displayOptions: { show: { resource: ["intent"], operation: ["get"] } },
        description: "The intent ID (int_*) to retrieve",
      },

      // ════════════════════════════════════════════════════════════════════
      //  ENFORCE
      // ════════════════════════════════════════════════════════════════════
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: { show: { resource: ["enforce"] } },
        options: [
          {
            name: "Validate",
            value: "validate",
            description: "Validate a plan against policies",
            action: "Validate a plan",
          },
          {
            name: "List Policies",
            value: "listPolicies",
            description: "List available policies",
            action: "List policies",
          },
          {
            name: "Get Policy",
            value: "getPolicy",
            description: "Get a specific policy",
            action: "Get a policy",
          },
        ],
        default: "validate",
      },
      // Enforce → Validate
      {
        displayName: "Plan (JSON)",
        name: "plan",
        type: "json",
        required: true,
        default: "{}",
        displayOptions: {
          show: { resource: ["enforce"], operation: ["validate"] },
        },
        description: "The StructuredPlan object from an intent response",
      },
      {
        displayName: "Entity ID",
        name: "enforceEntityId",
        type: "string",
        required: true,
        default: "",
        displayOptions: {
          show: { resource: ["enforce"], operation: ["validate"] },
        },
        description: "ID of the requesting entity",
      },
      {
        displayName: "Trust Level",
        name: "trustLevel",
        type: "number",
        required: true,
        default: 0,
        typeOptions: { minValue: 0, maxValue: 7 },
        displayOptions: {
          show: { resource: ["enforce"], operation: ["validate"] },
        },
        description: "Entity trust level (0-7)",
      },
      {
        displayName: "Trust Score",
        name: "trustScore",
        type: "number",
        required: true,
        default: 0,
        typeOptions: { minValue: 0, maxValue: 1000 },
        displayOptions: {
          show: { resource: ["enforce"], operation: ["validate"] },
        },
        description: "Entity trust score (0-1000)",
      },
      {
        displayName: "Enforce Options",
        name: "enforceOptions",
        type: "collection",
        placeholder: "Add Option",
        default: {},
        displayOptions: {
          show: { resource: ["enforce"], operation: ["validate"] },
        },
        options: [
          {
            displayName: "Rigor Mode",
            name: "rigorMode",
            type: "options",
            options: [
              { name: "Lite", value: "lite" },
              { name: "Standard", value: "standard" },
              { name: "Strict", value: "strict" },
            ],
            default: "standard",
            description:
              "Enforcement rigor level — auto-selected from trust level if omitted",
          },
          {
            displayName: "Policy IDs",
            name: "policyIds",
            type: "string",
            default: "",
            description:
              "Comma-separated policy IDs to evaluate (all if empty)",
          },
          {
            displayName: "Context (JSON)",
            name: "context",
            type: "json",
            default: "{}",
            description: "Additional enforcement context",
          },
        ],
      },
      // Enforce → Get Policy
      {
        displayName: "Policy ID",
        name: "policyId",
        type: "string",
        required: true,
        default: "",
        displayOptions: {
          show: { resource: ["enforce"], operation: ["getPolicy"] },
        },
        description: "The policy ID to retrieve",
      },

      // ════════════════════════════════════════════════════════════════════
      //  PROOF
      // ════════════════════════════════════════════════════════════════════
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: { show: { resource: ["proof"] } },
        options: [
          {
            name: "Create",
            value: "create",
            description: "Create a proof record from an enforcement verdict",
            action: "Create a proof",
          },
          {
            name: "Get",
            value: "get",
            description: "Retrieve a proof record",
            action: "Get a proof",
          },
          {
            name: "Query",
            value: "query",
            description: "Query proof records with filters",
            action: "Query proofs",
          },
          {
            name: "Stats",
            value: "stats",
            description: "Get proof ledger statistics",
            action: "Get proof stats",
          },
          {
            name: "Verify",
            value: "verify",
            description: "Verify proof integrity and chain linkage",
            action: "Verify a proof",
          },
        ],
        default: "create",
      },
      // Proof → Create
      {
        displayName: "Verdict (JSON)",
        name: "verdict",
        type: "json",
        required: true,
        default: "{}",
        displayOptions: {
          show: { resource: ["proof"], operation: ["create"] },
        },
        description: "The EnforceResponse verdict object",
      },
      // Proof → Get / Verify
      {
        displayName: "Proof ID",
        name: "proofId",
        type: "string",
        required: true,
        default: "",
        displayOptions: {
          show: { resource: ["proof"], operation: ["get", "verify"] },
        },
        description: "The proof ID (prf_*) to retrieve or verify",
      },
      // Proof → Query
      {
        displayName: "Query Filters",
        name: "proofQueryFilters",
        type: "collection",
        placeholder: "Add Filter",
        default: {},
        displayOptions: { show: { resource: ["proof"], operation: ["query"] } },
        options: [
          {
            displayName: "Entity ID",
            name: "entity_id",
            type: "string",
            default: "",
          },
          {
            displayName: "Intent ID",
            name: "intent_id",
            type: "string",
            default: "",
          },
          {
            displayName: "Verdict ID",
            name: "verdict_id",
            type: "string",
            default: "",
          },
          {
            displayName: "Decision",
            name: "decision",
            type: "options",
            options: [
              { name: "Allowed", value: "allowed" },
              { name: "Denied", value: "denied" },
              { name: "Escalated", value: "escalated" },
              { name: "Modified", value: "modified" },
            ],
            default: "allowed",
          },
          {
            displayName: "Start Date",
            name: "start_date",
            type: "dateTime",
            default: "",
          },
          {
            displayName: "End Date",
            name: "end_date",
            type: "dateTime",
            default: "",
          },
          {
            displayName: "Limit",
            name: "limit",
            type: "number",
            default: 100,
            typeOptions: { minValue: 1, maxValue: 1000 },
          },
          {
            displayName: "Offset",
            name: "offset",
            type: "number",
            default: 0,
            typeOptions: { minValue: 0 },
          },
        ],
      },

      // ════════════════════════════════════════════════════════════════════
      //  AGENT
      // ════════════════════════════════════════════════════════════════════
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: { show: { resource: ["agent"] } },
        options: [
          {
            name: "Register",
            value: "create",
            description: "Register a new agent",
            action: "Register an agent",
          },
          {
            name: "List",
            value: "list",
            description: "List all registered agents",
            action: "List agents",
          },
          {
            name: "Get",
            value: "get",
            description: "Get agent details",
            action: "Get an agent",
          },
          {
            name: "Update",
            value: "update",
            description: "Update an agent",
            action: "Update an agent",
          },
          {
            name: "Revoke",
            value: "delete",
            description: "Revoke an agent",
            action: "Revoke an agent",
          },
        ],
        default: "create",
      },
      // Agent → Register
      {
        displayName: "Agent Name",
        name: "agentName",
        type: "string",
        required: true,
        default: "",
        displayOptions: {
          show: { resource: ["agent"], operation: ["create"] },
        },
        description: "Name of the agent to register",
      },
      {
        displayName: "Agent Options",
        name: "agentOptions",
        type: "collection",
        placeholder: "Add Option",
        default: {},
        displayOptions: {
          show: { resource: ["agent"], operation: ["create"] },
        },
        options: [
          {
            displayName: "Agent ID",
            name: "agentId",
            type: "string",
            default: "",
            description: "Custom agent ID (auto-generated if empty)",
          },
          {
            displayName: "Capabilities",
            name: "capabilities",
            type: "string",
            default: "",
            description: "Comma-separated capability codes",
          },
          {
            displayName: "Observation Tier",
            name: "observationTier",
            type: "options",
            options: [
              { name: "Black Box", value: "BLACK_BOX" },
              { name: "Gray Box", value: "GRAY_BOX" },
              { name: "White Box", value: "WHITE_BOX" },
            ],
            default: "GRAY_BOX",
          },
        ],
      },
      // Agent → Get / Update / Delete
      {
        displayName: "Agent ID",
        name: "agentId",
        type: "string",
        required: true,
        default: "",
        displayOptions: {
          show: { resource: ["agent"], operation: ["get", "update", "delete"] },
        },
        description: "The agent ID",
      },
      // Agent → Update fields
      {
        displayName: "Update Fields",
        name: "agentUpdateFields",
        type: "collection",
        placeholder: "Add Field",
        default: {},
        displayOptions: {
          show: { resource: ["agent"], operation: ["update"] },
        },
        options: [
          { displayName: "Name", name: "name", type: "string", default: "" },
          {
            displayName: "Capabilities",
            name: "capabilities",
            type: "string",
            default: "",
            description: "Comma-separated capability codes",
          },
        ],
      },
      // Agent → List
      {
        displayName: "List Options",
        name: "agentListOptions",
        type: "collection",
        placeholder: "Add Option",
        default: {},
        displayOptions: { show: { resource: ["agent"], operation: ["list"] } },
        options: [
          {
            displayName: "Limit",
            name: "limit",
            type: "number",
            default: 100,
            typeOptions: { minValue: 1, maxValue: 1000 },
          },
          {
            displayName: "Tier",
            name: "tier",
            type: "number",
            default: -1,
            typeOptions: { minValue: -1, maxValue: 7 },
            description: "Filter by trust tier (0-7). Use -1 for all.",
          },
        ],
      },

      // ════════════════════════════════════════════════════════════════════
      //  TRUST
      // ════════════════════════════════════════════════════════════════════
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: { show: { resource: ["trust"] } },
        options: [
          {
            name: "Admit",
            value: "admit",
            description: "Admit an agent into the trust system",
            action: "Admit an agent",
          },
          {
            name: "Get Status",
            value: "get",
            description: "Get current trust status",
            action: "Get trust status",
          },
          {
            name: "Record Signal",
            value: "signal",
            description: "Record a trust signal",
            action: "Record a signal",
          },
          {
            name: "Revoke",
            value: "revoke",
            description: "Revoke agent trust",
            action: "Revoke trust",
          },
          {
            name: "History",
            value: "history",
            description: "Get trust signal history",
            action: "Get trust history",
          },
          {
            name: "List Tiers",
            value: "tiers",
            description: "Get all tier definitions",
            action: "List tiers",
          },
        ],
        default: "get",
      },
      // Trust → Admit
      {
        displayName: "Agent ID",
        name: "trustAgentId",
        type: "string",
        required: true,
        default: "",
        displayOptions: { show: { resource: ["trust"], operation: ["admit"] } },
        description: "Agent ID to admit",
      },
      {
        displayName: "Agent Name",
        name: "trustAgentName",
        type: "string",
        required: true,
        default: "",
        displayOptions: { show: { resource: ["trust"], operation: ["admit"] } },
        description: "Agent name",
      },
      {
        displayName: "Admit Options",
        name: "admitOptions",
        type: "collection",
        placeholder: "Add Option",
        default: {},
        displayOptions: { show: { resource: ["trust"], operation: ["admit"] } },
        options: [
          {
            displayName: "Capabilities",
            name: "capabilities",
            type: "string",
            default: "",
            description: "Comma-separated capability codes",
          },
          {
            displayName: "Observation Tier",
            name: "observationTier",
            type: "options",
            options: [
              { name: "Black Box", value: "BLACK_BOX" },
              { name: "Gray Box", value: "GRAY_BOX" },
              { name: "White Box", value: "WHITE_BOX" },
            ],
            default: "GRAY_BOX",
          },
        ],
      },
      // Trust → Get / Signal / Revoke / History
      {
        displayName: "Agent ID",
        name: "trustEntityId",
        type: "string",
        required: true,
        default: "",
        displayOptions: {
          show: {
            resource: ["trust"],
            operation: ["get", "signal", "revoke", "history"],
          },
        },
        description: "The agent ID",
      },
      // Trust → Signal
      {
        displayName: "Signal Type",
        name: "signalType",
        type: "options",
        required: true,
        displayOptions: {
          show: { resource: ["trust"], operation: ["signal"] },
        },
        options: [
          { name: "Success", value: "success" },
          { name: "Failure", value: "failure" },
          { name: "Violation", value: "violation" },
          { name: "Neutral", value: "neutral" },
        ],
        default: "success",
        description: "Type of trust signal",
      },
      {
        displayName: "Signal Source",
        name: "signalSource",
        type: "string",
        required: true,
        default: "n8n",
        displayOptions: {
          show: { resource: ["trust"], operation: ["signal"] },
        },
        description: "Source of the signal (e.g. n8n, monitoring, audit)",
      },
      {
        displayName: "Signal Options",
        name: "signalOptions",
        type: "collection",
        placeholder: "Add Option",
        default: {},
        displayOptions: {
          show: { resource: ["trust"], operation: ["signal"] },
        },
        options: [
          {
            displayName: "Weight",
            name: "weight",
            type: "number",
            default: 0.5,
            typeOptions: { minValue: 0, maxValue: 1 },
          },
          {
            displayName: "Context (JSON)",
            name: "context",
            type: "json",
            default: "{}",
          },
        ],
      },
      // Trust → Revoke
      {
        displayName: "Reason",
        name: "revokeReason",
        type: "string",
        required: true,
        default: "",
        displayOptions: {
          show: { resource: ["trust"], operation: ["revoke"] },
        },
        description: "Reason for revoking trust",
      },
      // Trust → History
      {
        displayName: "Limit",
        name: "historyLimit",
        type: "number",
        default: 50,
        displayOptions: {
          show: { resource: ["trust"], operation: ["history"] },
        },
        description: "Max number of history records to return",
      },

      // ════════════════════════════════════════════════════════════════════
      //  HEALTH
      // ════════════════════════════════════════════════════════════════════
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: { show: { resource: ["health"] } },
        options: [
          {
            name: "Full Check",
            value: "full",
            description: "Full health check with subsystem status",
            action: "Full health check",
          },
          {
            name: "Liveness",
            value: "live",
            description: "Lightweight liveness probe",
            action: "Liveness check",
          },
          {
            name: "Readiness",
            value: "ready",
            description: "Readiness check",
            action: "Readiness check",
          },
        ],
        default: "full",
      },

      // ════════════════════════════════════════════════════════════════════
      //  REFERENCE
      // ════════════════════════════════════════════════════════════════════
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: { show: { resource: ["reference"] } },
        options: [
          {
            name: "List Tiers",
            value: "tiers",
            description: "List all 8 trust tiers",
            action: "List tiers",
          },
          {
            name: "Lookup Tier by Score",
            value: "tierLookup",
            description: "Lookup tier for a trust score",
            action: "Lookup tier",
          },
          {
            name: "List Capabilities",
            value: "capabilities",
            description: "List all 24 capabilities",
            action: "List capabilities",
          },
          {
            name: "List Errors",
            value: "errors",
            description: "List all error codes",
            action: "List errors",
          },
          {
            name: "Rate Limits",
            value: "rateLimits",
            description: "Get rate limits by tier",
            action: "Get rate limits",
          },
          {
            name: "Versions",
            value: "versions",
            description: "API version registry",
            action: "Get versions",
          },
        ],
        default: "tiers",
      },
      // Reference → Tier Lookup
      {
        displayName: "Trust Score",
        name: "lookupScore",
        type: "number",
        required: true,
        default: 500,
        typeOptions: { minValue: 0, maxValue: 1000 },
        displayOptions: {
          show: { resource: ["reference"], operation: ["tierLookup"] },
        },
        description: "Trust score (0-1000) to lookup the tier for",
      },

      // ════════════════════════════════════════════════════════════════════
      //  COMPLIANCE
      // ════════════════════════════════════════════════════════════════════
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: { show: { resource: ["compliance"] } },
        options: [
          {
            name: "Health",
            value: "health",
            description: "All control health across frameworks",
            action: "Get compliance health",
          },
          {
            name: "Framework Health",
            value: "frameworkHealth",
            description: "Framework-specific health",
            action: "Get framework health",
          },
          {
            name: "Snapshot",
            value: "snapshot",
            description: "Point-in-time compliance snapshot",
            action: "Get snapshot",
          },
          {
            name: "Dashboard",
            value: "dashboard",
            description: "Aggregated dashboard data",
            action: "Get dashboard",
          },
          {
            name: "Evidence",
            value: "evidence",
            description: "Evidence for a specific control",
            action: "Get evidence",
          },
          {
            name: "Trigger Monitor",
            value: "trigger",
            description: "Trigger full compliance check (admin)",
            action: "Trigger check",
          },
        ],
        default: "health",
      },
      // Compliance → Framework Health / Snapshot
      {
        displayName: "Framework",
        name: "framework",
        type: "options",
        displayOptions: {
          show: {
            resource: ["compliance"],
            operation: ["frameworkHealth", "snapshot", "evidence"],
          },
        },
        options: [
          { name: "NIST 800-53", value: "NIST-800-53" },
          { name: "EU AI Act", value: "EU-AI-ACT" },
          { name: "ISO 42001", value: "ISO-42001" },
          { name: "SOC 2", value: "SOC-2" },
        ],
        default: "NIST-800-53",
      },
      // Compliance → Evidence
      {
        displayName: "Control ID",
        name: "controlId",
        type: "string",
        required: true,
        default: "",
        displayOptions: {
          show: { resource: ["compliance"], operation: ["evidence"] },
        },
        description: "The control ID to get evidence for",
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const resource = this.getNodeParameter("resource", i) as string;
        const operation = this.getNodeParameter("operation", i) as string;
        let responseData: IDataObject | IDataObject[];

        // ── INTENT ─────────────────────────────────────────────────────
        if (resource === "intent") {
          if (operation === "create") {
            const body: IDataObject = {
              entity_id: this.getNodeParameter("entityId", i) as string,
              goal: this.getNodeParameter("goal", i) as string,
            };
            const additional = this.getNodeParameter(
              "additionalFields",
              i,
            ) as IDataObject;
            if (additional.context)
              body.context = JSON.parse(additional.context as string);
            if (additional.metadata)
              body.metadata = JSON.parse(additional.metadata as string);
            responseData = await cognigateRequest.call(
              this,
              "POST",
              "/v1/intent",
              body,
            );
          } else {
            // get
            const intentId = this.getNodeParameter("intentId", i) as string;
            responseData = await cognigateRequest.call(
              this,
              "GET",
              `/v1/intent/${intentId}`,
            );
          }
        }

        // ── ENFORCE ────────────────────────────────────────────────────
        else if (resource === "enforce") {
          if (operation === "validate") {
            const body: IDataObject = {
              plan: JSON.parse(this.getNodeParameter("plan", i) as string),
              entity_id: this.getNodeParameter("enforceEntityId", i) as string,
              trust_level: this.getNodeParameter("trustLevel", i) as number,
              trust_score: this.getNodeParameter("trustScore", i) as number,
            };
            const opts = this.getNodeParameter(
              "enforceOptions",
              i,
            ) as IDataObject;
            if (opts.rigorMode) body.rigor_mode = opts.rigorMode;
            if (opts.policyIds)
              body.policy_ids = (opts.policyIds as string)
                .split(",")
                .map((s: string) => s.trim());
            if (opts.context) body.context = JSON.parse(opts.context as string);
            responseData = await cognigateRequest.call(
              this,
              "POST",
              "/v1/enforce",
              body,
            );
          } else if (operation === "listPolicies") {
            responseData = await cognigateRequest.call(
              this,
              "GET",
              "/v1/enforce/policies",
            );
          } else {
            // getPolicy
            const policyId = this.getNodeParameter("policyId", i) as string;
            responseData = await cognigateRequest.call(
              this,
              "GET",
              `/v1/enforce/policies/${policyId}`,
            );
          }
        }

        // ── PROOF ──────────────────────────────────────────────────────
        else if (resource === "proof") {
          if (operation === "create") {
            const verdict = JSON.parse(
              this.getNodeParameter("verdict", i) as string,
            );
            responseData = await cognigateRequest.call(
              this,
              "POST",
              "/v1/proof",
              verdict as IDataObject,
            );
          } else if (operation === "get") {
            const proofId = this.getNodeParameter("proofId", i) as string;
            responseData = await cognigateRequest.call(
              this,
              "GET",
              `/v1/proof/${proofId}`,
            );
          } else if (operation === "query") {
            const filters = this.getNodeParameter(
              "proofQueryFilters",
              i,
            ) as IDataObject;
            const body: IDataObject = {};
            for (const [k, v] of Object.entries(filters)) {
              if (v !== "" && v !== undefined) body[k] = v;
            }
            responseData = await cognigateRequest.call(
              this,
              "POST",
              "/v1/proof/query",
              body,
            );
          } else if (operation === "stats") {
            responseData = await cognigateRequest.call(
              this,
              "GET",
              "/v1/proof/stats",
            );
          } else {
            // verify
            const proofId = this.getNodeParameter("proofId", i) as string;
            responseData = await cognigateRequest.call(
              this,
              "GET",
              `/v1/proof/${proofId}/verify`,
            );
          }
        }

        // ── AGENT ──────────────────────────────────────────────────────
        else if (resource === "agent") {
          if (operation === "create") {
            const body: IDataObject = {
              name: this.getNodeParameter("agentName", i) as string,
            };
            const opts = this.getNodeParameter(
              "agentOptions",
              i,
            ) as IDataObject;
            if (opts.agentId) body.agentId = opts.agentId;
            if (opts.capabilities)
              body.capabilities = (opts.capabilities as string)
                .split(",")
                .map((s: string) => s.trim());
            if (opts.observationTier)
              body.observationTier = opts.observationTier;
            responseData = await cognigateRequest.call(
              this,
              "POST",
              "/v1/agents",
              body,
            );
          } else if (operation === "list") {
            const opts = this.getNodeParameter(
              "agentListOptions",
              i,
            ) as IDataObject;
            const qs: IDataObject = {};
            if (opts.limit) qs.limit = opts.limit;
            if (opts.tier !== undefined && (opts.tier as number) >= 0)
              qs.tier = opts.tier;
            responseData = await cognigateRequest.call(
              this,
              "GET",
              "/v1/agents",
              undefined,
              qs,
            );
          } else if (operation === "get") {
            const agentId = this.getNodeParameter("agentId", i) as string;
            responseData = await cognigateRequest.call(
              this,
              "GET",
              `/v1/agents/${agentId}`,
            );
          } else if (operation === "update") {
            const agentId = this.getNodeParameter("agentId", i) as string;
            const fields = this.getNodeParameter(
              "agentUpdateFields",
              i,
            ) as IDataObject;
            const body: IDataObject = {};
            if (fields.name) body.name = fields.name;
            if (fields.capabilities)
              body.capabilities = (fields.capabilities as string)
                .split(",")
                .map((s: string) => s.trim());
            responseData = await cognigateRequest.call(
              this,
              "PATCH",
              `/v1/agents/${agentId}`,
              body,
            );
          } else {
            // delete
            const agentId = this.getNodeParameter("agentId", i) as string;
            await cognigateRequest.call(
              this,
              "DELETE",
              `/v1/agents/${agentId}`,
            );
            responseData = { success: true, agentId };
          }
        }

        // ── TRUST ──────────────────────────────────────────────────────
        else if (resource === "trust") {
          if (operation === "admit") {
            const body: IDataObject = {
              agentId: this.getNodeParameter("trustAgentId", i) as string,
              name: this.getNodeParameter("trustAgentName", i) as string,
            };
            const opts = this.getNodeParameter(
              "admitOptions",
              i,
            ) as IDataObject;
            if (opts.capabilities)
              body.capabilities = (opts.capabilities as string)
                .split(",")
                .map((s: string) => s.trim());
            if (opts.observationTier)
              body.observationTier = opts.observationTier;
            responseData = await cognigateRequest.call(
              this,
              "POST",
              "/v1/trust/admit",
              body,
            );
          } else if (operation === "get") {
            const agentId = this.getNodeParameter("trustEntityId", i) as string;
            responseData = await cognigateRequest.call(
              this,
              "GET",
              `/v1/trust/${agentId}`,
            );
          } else if (operation === "signal") {
            const agentId = this.getNodeParameter("trustEntityId", i) as string;
            const body: IDataObject = {
              type: this.getNodeParameter("signalType", i) as string,
              source: this.getNodeParameter("signalSource", i) as string,
            };
            const opts = this.getNodeParameter(
              "signalOptions",
              i,
            ) as IDataObject;
            if (opts.weight !== undefined) body.weight = opts.weight;
            if (opts.context) body.context = JSON.parse(opts.context as string);
            responseData = await cognigateRequest.call(
              this,
              "POST",
              `/v1/trust/${agentId}/signal`,
              body,
            );
          } else if (operation === "revoke") {
            const agentId = this.getNodeParameter("trustEntityId", i) as string;
            const body: IDataObject = {
              reason: this.getNodeParameter("revokeReason", i) as string,
            };
            responseData = await cognigateRequest.call(
              this,
              "POST",
              `/v1/trust/${agentId}/revoke`,
              body,
            );
          } else if (operation === "history") {
            const agentId = this.getNodeParameter("trustEntityId", i) as string;
            const limit = this.getNodeParameter("historyLimit", i) as number;
            responseData = await cognigateRequest.call(
              this,
              "GET",
              `/v1/trust/${agentId}/history`,
              undefined,
              { limit },
            );
          } else {
            // tiers
            responseData = await cognigateRequest.call(
              this,
              "GET",
              "/v1/trust/tiers",
            );
          }
        }

        // ── HEALTH ─────────────────────────────────────────────────────
        else if (resource === "health") {
          if (operation === "full") {
            responseData = await cognigateRequest.call(this, "GET", "/health");
          } else if (operation === "live") {
            responseData = await cognigateRequest.call(
              this,
              "GET",
              "/health/live",
            );
          } else {
            responseData = await cognigateRequest.call(this, "GET", "/ready");
          }
        }

        // ── REFERENCE ──────────────────────────────────────────────────
        else if (resource === "reference") {
          if (operation === "tiers") {
            responseData = await cognigateRequest.call(
              this,
              "GET",
              "/v1/reference/tiers",
            );
          } else if (operation === "tierLookup") {
            const score = this.getNodeParameter("lookupScore", i) as number;
            responseData = await cognigateRequest.call(
              this,
              "GET",
              `/v1/reference/tiers/lookup/${score}`,
            );
          } else if (operation === "capabilities") {
            responseData = await cognigateRequest.call(
              this,
              "GET",
              "/v1/reference/capabilities",
            );
          } else if (operation === "errors") {
            responseData = await cognigateRequest.call(
              this,
              "GET",
              "/v1/reference/errors",
            );
          } else if (operation === "rateLimits") {
            responseData = await cognigateRequest.call(
              this,
              "GET",
              "/v1/reference/rate-limits",
            );
          } else {
            // versions
            responseData = await cognigateRequest.call(
              this,
              "GET",
              "/v1/reference/versions",
            );
          }
        }

        // ── COMPLIANCE ─────────────────────────────────────────────────
        else if (resource === "compliance") {
          if (operation === "health") {
            responseData = await cognigateRequest.call(
              this,
              "GET",
              "/v1/compliance/health",
            );
          } else if (operation === "frameworkHealth") {
            const fw = this.getNodeParameter("framework", i) as string;
            responseData = await cognigateRequest.call(
              this,
              "GET",
              `/v1/compliance/health/${fw}`,
            );
          } else if (operation === "snapshot") {
            const fw = this.getNodeParameter("framework", i) as string;
            responseData = await cognigateRequest.call(
              this,
              "GET",
              `/v1/compliance/snapshot/${fw}`,
            );
          } else if (operation === "dashboard") {
            responseData = await cognigateRequest.call(
              this,
              "GET",
              "/v1/compliance/dashboard",
            );
          } else if (operation === "evidence") {
            const controlId = this.getNodeParameter("controlId", i) as string;
            const fw = this.getNodeParameter("framework", i) as string;
            responseData = await cognigateRequest.call(
              this,
              "GET",
              `/v1/compliance/evidence/${controlId}`,
              undefined,
              { framework: fw },
            );
          } else {
            // trigger — requires admin key
            responseData = await cognigateRequest.call(
              this,
              "POST",
              "/v1/compliance/monitor/trigger",
              {},
              undefined,
              true,
            );
          }
        }

        // ── unknown ────────────────────────────────────────────────────
        else {
          throw new NodeOperationError(
            this.getNode(),
            `Unknown resource: ${resource}`,
            { itemIndex: i },
          );
        }

        // Normalize output
        if (Array.isArray(responseData)) {
          returnData.push(...responseData.map((d) => ({ json: d })));
        } else {
          returnData.push({ json: responseData });
        }
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: (error as Error).message },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
