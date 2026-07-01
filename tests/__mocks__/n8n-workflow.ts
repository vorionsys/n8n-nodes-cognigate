// Mock n8n-workflow types for testing
export class NodeApiError extends Error {
  constructor(node: any, error: any) {
    super(error.message || 'API Error');
    this.name = 'NodeApiError';
  }
}

export class NodeOperationError extends Error {
  constructor(node: any, message: string, options?: any) {
    super(message);
    this.name = 'NodeOperationError';
  }
}

// Type stubs
export type IDataObject = Record<string, any>;
export type IExecuteFunctions = any;
export type IHttpRequestMethods = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type INodeExecutionData = { json: IDataObject; pairedItem?: any };
export type INodeType = any;
export type INodeTypeDescription = any;
export type INodeProperties = any;
export type IAuthenticateGeneric = any;
export type ICredentialTestRequest = any;
export type ICredentialType = any;
