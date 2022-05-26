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

  const market = Market__factory.connect(PARAM.MARKET, deployer);
  const marketConfig = MarketConfig__factory.connect(PARAM.MARKET_CONFIG, deployer);
  const cashier = Cashier__factory.connect(PARAM.CASHIER, deployer);
  const collateralToken = SimpleToken__factory.connect(PARAM.COLLATERAL_TOKEN, deployer);

  let tx;
  let userCollateralBalance = ethers.constants.Zero;
  let userCollateralShare = ethers.constants.Zero;
  let userCollateralAmount = ethers.constants.Zero;
  let cashierBalance = ethers.constants.Zero;

  // Check user balance
  userCollateralBalance = await collateralToken.balanceOf(deployer.address);
  // console.log("user balance:", ethers.utils.formatEther(userCollateralBalance));

  if (userCollateralBalance.lt(PARAM.DEPOSIT_AMOUNT)) {
    // mint
    console.log(
      `(0.0) balance amt (${userCollateralBalance.toString()}) < depositing amt (${PARAM.DEPOSIT_AMOUNT.toString()}), then mint ${PARAM.DEPOSIT_AMOUNT.toString()} to ${
        deployer.address
      }...`
    );
    tx = await collateralToken.mint(deployer.address, PARAM.DEPOSIT_AMOUNT);
    await tx.wait();
    console.log("tx hash:", tx.hash);
    console.log("✅ Done\n");
  }

  // Check allowance
  const allowance = await collateralToken.allowance(deployer.address, cashier.address);
  if (allowance.lt(PARAM.DEPOSIT_AMOUNT)) {
    console.log(
      `(0.1) allowance amt (${allowance.toString()}) < depositing amt (${PARAM.DEPOSIT_AMOUNT.toString()}), then approving spending to cashier ${
        cashier.address
      }...`
    );
    tx = await collateralToken.approve(cashier.address, PARAM.DEPOSIT_AMOUNT);
    await tx.wait();
    console.log("tx hash:", tx.hash);
    console.log("✅ Done\n");
  }

  // Deposit collateral
  console.log(`(1) Depositing and add collateral = ${PARAM.DEPOSIT_AMOUNT}`);
  tx = await market.depositAndAddCollateral(deployer.address, PARAM.DEPOSIT_AMOUNT);
  await tx.wait();
  console.log("tx hash:", tx.hash);
  console.log("✅ Done\n");

  // // Check balance
  userCollateralBalance = await collateralToken.balanceOf(deployer.address);
  userCollateralShare = await market.userCollateralShare(deployer.address);
  userCollateralAmount = await cashier.toAmount(collateralToken.address, userCollateralShare, false);
  cashierBalance = await collateralToken.balanceOf(cashier.address);
  console.log("|--Check state after deposit--");
  console.log("| user balance:", ethers.utils.formatEther(userCollateralBalance));
  console.log("| collateral share in market", ethers.utils.formatEther(userCollateralShare));
  console.log("| collateral amount in market", ethers.utils.formatEther(userCollateralAmount));
  console.log("| cashier balance", ethers.utils.formatEther(cashierBalance));
  console.log("------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
