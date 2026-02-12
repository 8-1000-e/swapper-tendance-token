import { getOrder } from '../jupiter/orderService';
import { executeSwap } from '../jupiter/executeService';
import { OrderRequest, OrderResponse, ExecuteResponse } from '../../types/swap';

// Step 1 — Order : quote + TX unsigned en 1 appel
export async function order(request: OrderRequest, toMint: string): Promise<OrderResponse> {
  return getOrder({
    ...request,
    outputMint: toMint,
  });
}

// Step 2 — Execute : broadcast la TX signée par Turnkey
export async function execute(requestId: string, signedTransaction: string): Promise<ExecuteResponse> {
  return executeSwap({ requestId, signedTransaction });
}
