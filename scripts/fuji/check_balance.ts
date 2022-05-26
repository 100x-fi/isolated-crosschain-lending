import { ethers, network } from "hardhat";
import {
  Cashier__factory,
  MarketConfig__factory,
  Market__factory,
  OffChainOracle__factory,
  SimpleToken__factory,
} from "../../typechain/v8";
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
    COLLATERAL_TOKEN: collateralConfig.tokens["SimpleToken"],
    MARKET: collateralConfig.markets["bsctest-fuji:SimpleToken-SimpleToken"],
    MARKET_CONFIG: collateralConfig.marketConfig,
    CASHIER: collateralConfig.cashier,
    ORACLE: collateralConfig.oracle.offChain,
    USD: collateralConfig.tokens.USD,
  };

  if (!checkActiveNetwork()) {
    console.log("❌ wrong network", network.config.chainId);
    return;
  }

  const address = deployer.address;

  console.log("wallet addr:", address);
  console.log("market token addr:", PARAM.COLLATERAL_TOKEN);

  const collateralToken = SimpleToken__factory.connect(PARAM.COLLATERAL_TOKEN, deployer);
  const market = Market__factory.connect(PARAM.MARKET, deployer);
  const offChainOracle = OffChainOracle__factory.connect(PARAM.ORACLE, deployer);
  const cashier = Cashier__factory.connect(PARAM.CASHIER, deployer);
  const userBalance = await collateralToken.balanceOf(address);
  const marketConfig = MarketConfig__factory.connect(PARAM.MARKET_CONFIG, deployer);

  console.log("market debt address (another chain):", await market.debtMarket());

  const collateralFactor = await marketConfig.collateralFactor(market.address, address);
  console.log("collateralFactor", collateralFactor);

  let tx;
  // tx = await market.updateCollateralPrice({ gasLimit: 7000000 });
  // await tx.wait();
  // console.log("DONE update collateral price");
  // tx = await market.updateDebtPrice({ gasLimit: 7000000 });
  // await tx.wait();
  // console.log("DONE update debt price");

  // Try get collateral price
  const collateralByteCode = ethers.utils.defaultAbiCoder.encode(
    ["address", "address"],
    [PARAM.COLLATERAL_TOKEN, PARAM.USD]
  );
  console.log("collateral price from mkt:", ethers.utils.formatEther(await market.collateralPrice()));
  const collateralPriceData = await offChainOracle.get(collateralByteCode);
  console.log("Collateral price data from oracle:", collateralPriceData[1].toString());
  console.log("debt price from mkt:", ethers.utils.formatEther(await market.debtPrice()));
  const debtPriceData = await offChainOracle.get(collateralByteCode);
  console.log("Debt price data from oracle:", debtPriceData[1].toString());

  console.log("user SimpleToken balance:", ethers.utils.formatEther(userBalance));

  const userCollateralShare = await market.userCollateralShare(address);
  console.log("userDebtShareLocal:", ethers.utils.formatEther(userCollateralShare));
  console.log(
    "userCollateralAmount:",
    ethers.utils.formatEther(await cashier.toAmount(collateralToken.address, userCollateralShare, false))
  );
  console.log("totalCollateralAmount:", ethers.utils.formatEther(await market.totalCollateralShare()));

  console.log("userDebtShareLocal:", ethers.utils.formatEther(await market.userDebtShareLocal(address)));
  console.log("totalDebtShareLocal:", ethers.utils.formatEther(await market.totalDebtShareLocal()));
  console.log("totalDebtValeLocal:", ethers.utils.formatEther(await market.totalDebtValueLocal()));
  console.log("userDebtShare:", ethers.utils.formatEther(await market.userDebtShare(address)));
  console.log("totalDebtShare:", ethers.utils.formatEther(await market.totalDebtShare()));
  console.log("totalDebtValue:", ethers.utils.formatEther(await market.totalDebtValue()));
  console.log("✅ Done\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
