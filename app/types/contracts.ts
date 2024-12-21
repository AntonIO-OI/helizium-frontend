export type ContractAction = 'create' | 'delete' | 'accept';

export interface ContractSignature {
  signature: string;
  signer: string;
  timestamp: number;
}

export interface ContractResult {
  success: boolean;
  signature?: ContractSignature;
  error?: string;
}

export interface ContractMessage {
  taskId: number;
  taskTitle: string;
  action: ContractAction;
  performerId?: number;
} 