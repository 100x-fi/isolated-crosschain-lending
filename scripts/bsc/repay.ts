import { ethers, network } from "hardhat";
import { Cashier__factory, MarketConfig__factory, Market__factory, SimpleToken__factory } from "../../typechain/v8";
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
  const collateralConfig = config.bsc;
  const debtConfig = config.fuji;
  const PARAM = {
    MARKET: collateralConfig.markets["bsctest-fuji:SimpleToken-SimpleToken"],
    MARKET_CONFIG: collateralConfig.marketConfig,
    CASHIER: collateralConfig.cashier,
    COLLATERAL_TOKEN: collateralConfig.tokens["SimpleToken"],
    DEPOSIT_AMOUNT: ethers.utils.parseEther("12"),
  };

  if (!checkActiveNetwork()) {
    console.log("❌ wrong network", network.config.chainId);
    return;
  }

  console.log("wallet addr:", deployer.address);
  console.log("market addr:", PARAM.MARKET);
  console.log("market config addr:", PARAM.MARKET_CONFIG);
  console.log("cashier addr:", PARAM.CASHIER);
  console.log("market token addr:", PARAM.COLLATERAL_TOKEN);

  const collateralToken = SimpleToken__factory.connect(PARAM.COLLATERAL_TOKEN, deployer);
  const market = Market__factory.connect(PARAM.MARKET, deployer);
  const cashier = Cashier__factory.connect(PARAM.CASHIER, deployer);
  let tx;
  const repayAmount = 1;

  // Check allowance
  const allowance = await collateralToken.allowance(deployer.address, cashier.address);
  if (allowance.lt(repayAmount)) {
    console.log(
      `(0.1) allowance amt (${allowance.toString()}) < repay amt (${repayAmount.toString()}), then approving spending to cashier ${
        cashier.address
      }...`
    );
    tx = await collateralToken.approve(cashier.address, PARAM.DEPOSIT_AMOUNT);
    await tx.wait();
    console.log("tx hash:", tx.hash);
    console.log("✅ Done\n");
  }

  // Repay
  console.log(`(1) Send repaying request (amount = ${repayAmount}) to another chain`);
  tx = await market.repay(deployer.address, repayAmount, {
    gasLimit: 7000000,
    value: ethers.utils.parseEther("0.1"),
  });
  await tx.wait();
  console.log("tx hash:", tx.hash);
  console.log("✅ Done\n");
  tx = 0;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
