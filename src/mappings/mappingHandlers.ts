import { NearAction, NearTransaction } from "@subql/types-near";

export async function handleNewPrice(
  transaction: NearTransaction
): Promise<void> {
  logger.info(`Handling transaction at ${transaction.block_height}`);
  logger.info(`Handling transaction at ${JSON.stringify(transaction)}`);
}

export async function handleNewPriceAction(action: NearAction): Promise<void> {
  logger.info(`Handling action at ${action.transaction.block_height}`);
  logger.info(`Handling action at ${JSON.stringify(action)}`);
}
