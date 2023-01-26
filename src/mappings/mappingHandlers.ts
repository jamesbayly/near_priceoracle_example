import { NearAction, NearTransaction } from "@subql/types-near";
import { Oracle, Price } from "../types";

type NewPrices = {
  prices: {
    asset_id: string;
    price: {
      multiplier: string;
      decimals: number;
    };
  }[];
};

export async function handleNewPrice(
  transaction: NearTransaction
): Promise<void> {
  logger.info(`Handling transaction at ${transaction.block_height}`);
  logger.info(`Handling transaction at ${JSON.stringify(transaction)}`);
}

export async function handleNewOracle(action: NearAction): Promise<void> {
  logger.info(`Handling action at ${action.transaction.block_height}`);
  logger.info(`Handling action at ${JSON.stringify(action)}`);
  await checkAndCreateOracle(action.action.args, action.transaction);
}

export async function handleNewPriceAction(
  action: NearAction<NewPrices>
): Promise<void> {
  logger.info(
    `Handling new price action at ${action.transaction.block_height}`
  );
  logger.info(`Handling new price action at ${JSON.stringify(action)}`);
  await checkAndCreateOracle(action.transaction.signer_id, action.transaction);
  action.action.prices.map(async (p, index) => {
    await Price.create({
      id: `${action.transaction.result.id}-${action.id}-${index}`,
      oracleId: action.transaction.signer_id.toLowerCase(),
      assetID: p.asset_id,
      price: parseInt(p.price.multiplier),
      decimals: p.price.decimals,
    }).save();
  });
}

async function checkAndCreateOracle(
  account_id: string,
  transaction: NearTransaction
): Promise<void> {
  const oracle = Oracle.get(account_id.toLowerCase());
  if (!oracle) {
    // We need to create a new one
    await Oracle.create({
      id: account_id.toLowerCase(),
      creator: transaction.signer_id,
      blockHeight: BigInt(transaction.block_height),
      timestamp: transaction.timestamp,
    }).save();
  }
}
