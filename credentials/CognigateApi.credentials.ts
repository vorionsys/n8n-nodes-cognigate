// SPDX-License-Identifier: LicenseRef-Sustainable-Use-1.0
// Copyright 2024-2026 Vorion LLC

import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from "n8n-workflow";

export class CognigateApi implements ICredentialType {
  name = "cognigateApi";
  displayName = "Cognigate API";
  documentationUrl = "https://cognigate.dev/docs/api/authentication";

  properties: INodeProperties[] = [
    {
      displayName: "Base URL",
      name: "baseUrl",
      type: "string",
      default: "https://cognigate.dev",
      placeholder: "https://cognigate.dev",
      description:
        "Base URL of the Cognigate API. Use your self-hosted URL if running Cognigate locally.",
      required: true,
    },
    {
      displayName: "API Key",
      name: "apiKey",
      type: "string",
      typeOptions: { password: true },
      default: "",
      description:
        "Pipeline API key (X-API-Key header) for intent, enforce, proof, trust, and auth endpoints.",
      required: true,
    },
    {
      displayName: "Admin Key",
      name: "adminKey",
      type: "string",
      typeOptions: { password: true },
      default: "",
      description:
        "Admin API key (X-Admin-Key header). Required only for admin and compliance trigger operations.",
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: "generic",
    properties: {
      headers: {
        "X-API-Key": "={{$credentials.apiKey}}",
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: "={{$credentials.baseUrl}}",
      url: "/health",
      method: "GET",
    },
    rules: [
      {
        type: "responseSuccessBody",
        properties: {
          key: "status",
          value: "healthy",
          message: "Cognigate instance is not healthy — check your Base URL",
        },
      },
    ],
  };
}
