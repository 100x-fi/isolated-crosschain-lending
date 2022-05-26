import { expect } from "chai";
import { ethers, network } from "hardhat";
import { MarketConfig__factory, Cashier__factory, Market__factory } from "../../typechain/v8";
import { getConfig } from "../../utils";
import { checkActiveNetwork } from "./helpers";

async function main() {
  /*
  ░██╗░░░░░░░██╗░█████╗░██████╗░███╗░░██╗██╗███╗░░██╗░██████╗░
  ░██║░░██╗░░██║██╔══██╗██╔══██╗████╗░██║██║████╗░██║██╔════╝░
  ░╚██╗████╗██╔╝███████║██████╔╝██╔██╗██║██║██╔██╗██║██║░░██╗░
  ░░████╔═████║░██╔══██║██╔══██╗██║╚████║██║██║╚████║██║░░╚██╗
  ░░╚██╔╝░╚██╔╝░██║░░██║██║░░██║██║░╚███║██║██║░╚███║╚██████╔╝
  ░░░╚═╝░░░╚═╝░░╚═╝░░╚═╝╚═╝░░╚═╝╚═╝░░╚══╝╚═╝╚═╝░░╚══╝░╚═════╝░
  Check all variables below before execute the deployment script
  */
  const [deployer] = await ethers.getSigners();
  const config = getConfig();
  const collateralConfig = config.fuji;
  const debtConfig = config.bsc;
  const PARAM = {
    CASHIER: collateralConfig.cashier,
    MARKET: collateralConfig.markets["bsctest-fuji:SimpleToken-SimpleToken"],
    DEBT_MARKET: debtConfig.markets["bsctest-fuji:SimpleToken-SimpleToken"],
    MARKET_CONFIG: collateralConfig.marketConfig,
    // configs
    COLLATERAL_FACTOR: "7000",
    LIQUIDATION_PENALTY: "10500",
    LIQUIDATION_TREASURY_BPS: "8000",
    MIN_DEBT_SIZE: ethers.utils.parseEther("100"), // 100 Token
    INTEREST_PER_SECOND: "792744799",
    CLOSE_FACTOR_BPS: "5000",
  };

  if (!checkActiveNetwork()) {
    console.log("❌ wrong network", network.config.chainId);
    return;
  }

  console.log("wallet addr:", deployer.address);
  console.log("market addr:", PARAM.MARKET);
  console.log("market config addr:", PARAM.MARKET_CONFIG);

  const marketConfig = MarketConfig__factory.connect(PARAM.MARKET_CONFIG, deployer);
  const cashier = Cashier__factory.connect(PARAM.CASHIER, deployer);
  const market = Market__factory.connect(PARAM.MARKET, deployer);
  let tx;

  console.log("(1) Set market configs");
  tx = await marketConfig.setConfig(
    [PARAM.MARKET],
    [
      {
        collateralFactor: PARAM.COLLATERAL_FACTOR,
        liquidationPenalty: PARAM.LIQUIDATION_PENALTY,
        liquidationTreasuryBps: PARAM.LIQUIDATION_TREASURY_BPS,
        minDebtSize: PARAM.MIN_DEBT_SIZE,
        interestPerSecond: PARAM.INTEREST_PER_SECOND,
        closeFactorBps: PARAM.CLOSE_FACTOR_BPS,
      },
    ]
  );
  await tx.wait();
  console.log("tx hash:", tx.hash);
  console.log("✅ Done\n");

  console.log("(2) Verify market configs");
  const configs = await marketConfig.configs(PARAM.MARKET);
  expect(configs.collateralFactor, "collateralFactor").to.be.equal(PARAM.COLLATERAL_FACTOR);
  expect(configs.liquidationPenalty, "liquidationPenalty").to.be.equal(PARAM.LIQUIDATION_PENALTY);
  expect(configs.liquidationTreasuryBps, "liquidationTreasuryBps").to.be.equal(PARAM.LIQUIDATION_TREASURY_BPS);
  expect(configs.minDebtSize, "minDebtSize").to.be.equal(PARAM.MIN_DEBT_SIZE);
  expect(configs.interestPerSecond, "interestPerSecond").to.be.equal(PARAM.INTEREST_PER_SECOND);
  expect(configs.closeFactorBps, "closeFactorBps").to.be.equal(PARAM.CLOSE_FACTOR_BPS);
  console.log("✅ Pass\n");

  console.log("(3) Whitelist market:", PARAM.MARKET);
  tx = await cashier.whitelistMarket(PARAM.MARKET, true, { gasLimit: 7000000 });
  await tx.wait();
  console.log("tx hash:", tx.hash);
  console.log("✅ Done\n");

  const LZ_BSC_CHAIN_ID = "10002";
  console.log("(4) set trust remote lzApp:", LZ_BSC_CHAIN_ID, PARAM.DEBT_MARKET);
  tx = await market.setTrustedRemote(LZ_BSC_CHAIN_ID, PARAM.DEBT_MARKET, { gasLimit: 7000000 });
  await tx.wait();
  console.log("tx hash:", tx.hash);
  console.log("✅ Done\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
