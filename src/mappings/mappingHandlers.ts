import { NearAction, NearTransaction } from "@subql/types-near";
import { Oracle, Price } from "../types";

type NewOracle = {
  account_id: string;
};

type NewPrices = {
  prices: {
    asset_id: string;
    price: {
      multiplier: string;
      decimals: number;
    };
  }[];
};

export async function handleNewOracle(action: NearAction): Promise<void> {
  // Data is encoded in base64 in the args, so we first decode it and parse into the correct type
  const payload: NewOracle = action.action.args.toJson();
  if (payload.account_id && action.transaction) {
    logger.info(
      `Handling new oracle ${payload.account_id} at ${action.transaction.block_height}`
    );
    await checkAndCreateOracle(payload.account_id, action.transaction);
  }
}

export async function handleNewPrice(action: NearAction): Promise<void> {
  // Data is encoded in base64 in the args, so we first decode it and parse into the correct type
  const payload: NewPrices = action.action.args.toJson();
  if (action.transaction) {
    logger.info(
      `Handling new price action at ${action.transaction.block_height}`
    );
    await checkAndCreateOracle(
      action.transaction.signer_id,
      action.transaction
    );
    payload.prices.map(async (p, index) => {
      await Price.create({
        id: `${action.transaction.result.id}-${action.id}-${index}`,
        oracleId: action.transaction.signer_id.toLowerCase(),
        assetID: p.asset_id,
        price: parseInt(p.price.multiplier),
        decimals: p.price.decimals,
        blockHeight: BigInt(action.transaction.block_height),
        timestamp: BigInt(action.transaction.timestamp),
      }).save();
    });
  }
}

async function checkAndCreateOracle(
  account_id: string,
  transaction: NearTransaction
): Promise<void> {
  const oracle = await Oracle.get(account_id.toLowerCase());
  if (!oracle) {
    // We need to create a new one
    await Oracle.create({
      id: account_id.toLowerCase(),
      creator: transaction.signer_id,
      blockHeight: BigInt(transaction.block_height),
      timestamp: BigInt(transaction.timestamp),
    }).save();
  }
}
