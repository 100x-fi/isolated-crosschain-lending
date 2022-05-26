import { expect } from "chai";
import { ethers, network } from "hardhat";
import { Market__factory } from "../../typechain/v8";
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
    MARKET: collateralConfig.markets["bsctest-fuji:SimpleToken-SimpleToken"],
    COLLATERAL_TOKEN: collateralConfig.tokens["SimpleToken"],
    DEBT_TOKEN: debtConfig.tokens["SimpleToken"],
    DEBT_MARKET: debtConfig.markets["bsctest-fuji:SimpleToken-SimpleToken"],
    DEBT_ORACLE_DATA: ethers.utils.defaultAbiCoder.encode(
      ["address", "address"],
      [debtConfig.tokens["SimpleToken"], debtConfig.tokens["USD"]]
    ),
  };

  if (!checkActiveNetwork()) {
    console.log("❌ wrong network", network.config.chainId);
    return;
  }

  console.log("deployer addr:", deployer.address);
  console.log("collateral market (bsctest) addr:", PARAM.MARKET);
  console.log("debt market (rinkeby) addr:", PARAM.DEBT_MARKET);
  console.log("market token addr:", PARAM.COLLATERAL_TOKEN);

  const market = Market__factory.connect(PARAM.MARKET, deployer);

  let tx;

  console.log("(1) Set debt token", PARAM.DEBT_TOKEN, "to market", market.address);
  tx = await market.setDebt(PARAM.DEBT_TOKEN);
  await tx.wait();
  console.log("tx hash:", tx.hash);
  console.log("✅ Done\n");

  console.log("(2) Set debt market", PARAM.DEBT_MARKET, "to market", market.address);
  tx = await market.setDebtMarket(PARAM.DEBT_MARKET);
  await tx.wait();
  console.log("tx hash:", tx.hash);
  console.log("✅ Done\n");

  console.log("(3) Set debt oracle data as", PARAM.DEBT_ORACLE_DATA);
  tx = await market.setDebtOracleData(PARAM.DEBT_ORACLE_DATA);
  await tx.wait();
  console.log("tx hash:", tx.hash);
  console.log("✅ Done\n");

  console.log("(4) Verify debt configs");
  expect(await market.debt(), "debt").to.equal(PARAM.DEBT_TOKEN);
  expect(await market.debtOracleData(), "debtOracleData").to.equal(PARAM.DEBT_ORACLE_DATA);
  console.log("✅ Pass\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
