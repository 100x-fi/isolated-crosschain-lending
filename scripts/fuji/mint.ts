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
    DEPOSIT_AMOUNT: ethers.utils.parseEther("10"),
  };

  if (!checkActiveNetwork()) {
    console.log("❌ wrong network", network.config.chainId);
    return;
  }

  const collateralToken = SimpleToken__factory.connect(PARAM.COLLATERAL_TOKEN, deployer);
  const userCollateralBalance = ethers.constants.Zero;

  // mint
  const mintTo = deployer.address;
  console.log(`mint ${PARAM.DEPOSIT_AMOUNT.toString()} to ${mintTo}...`);
  const tx = await collateralToken.mint(mintTo, PARAM.DEPOSIT_AMOUNT);
  await tx.wait();
  console.log("tx hash:", tx.hash);
  console.log("✅ Done\n");
  console.log("|--Check state after mint--");
  console.log("| user balance:", ethers.utils.formatEther(await collateralToken.balanceOf(mintTo)));
  console.log("------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
