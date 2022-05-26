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
  const collateralConfig = config.fuji;
  const debtConfig = config.bsc;
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

  const market = Market__factory.connect(PARAM.MARKET, deployer);

  let tx;
  // Borrow
  const borrowAmount = ethers.utils.parseEther("1");
  console.log(`(1) Send borrowing request (amount = ${borrowAmount}) to another chain`);
  tx = await market.borrow(deployer.address, borrowAmount, {
    gasLimit: 8000000,
    value: ethers.utils.parseEther("3"),
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
