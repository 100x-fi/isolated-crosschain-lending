import { ethers, network } from "hardhat";
import { OffChainOracle__factory } from "../../typechain/v8";
import { getConfig } from "../../utils";
import { checkActiveNetwork } from "./helpers";

async function main() {
  const [deployer] = await ethers.getSigners();
  const config = getConfig();
  const collateralConfig = config.fuji;
  const debtConfig = config.bsc;

  const PARAM = {
    MARKET: collateralConfig.markets["bsctest-fuji:SimpleToken-SimpleToken"],
    COLLATERAL_TOKEN: collateralConfig.tokens["SimpleToken"],
    DEBT_TOKEN: debtConfig.tokens["SimpleToken"],
    DEBT_ORACLE_DATA: ethers.utils.defaultAbiCoder.encode(["address"], [collateralConfig.tokens["SimpleToken"]]),
    ORACLE: collateralConfig.oracle.offChain,
    USD: collateralConfig.tokens["USD"],
  };

  if (!checkActiveNetwork()) {
    console.log("❌ wrong network", network.config.chainId);
    return;
  }

  console.log("deployer addr:", deployer.address);

  const offChainOracle = OffChainOracle__factory.connect(PARAM.ORACLE, deployer);

  const deployerIsFeeder = await offChainOracle.hasRole(await offChainOracle.FEEDER_ROLE(), deployer.address);
  if (!deployerIsFeeder) {
    console.log(`(0) Grant FEEDER ROLE to deployer: ${deployer.address}}`);
    const tx = await offChainOracle.grantRole(await offChainOracle.FEEDER_ROLE(), deployer.address);
    await tx.wait();
    console.log("tx hash:", tx.hash);
    console.log("✅ Done\n");
  }

  let tx;

  // 10 USD
  const collateralPriceUSD = ethers.utils.parseEther("300");
  console.log(
    `(1) Feed collateral price offChainOracle: token ${
      PARAM.COLLATERAL_TOKEN
    } @ price = ${collateralPriceUSD.toString()}`
  );
  tx = await offChainOracle.setPrices([PARAM.COLLATERAL_TOKEN], [PARAM.USD], [collateralPriceUSD]);
  console.log("tx hash:", tx.hash);
  console.log("✅ Done\n");

  // 300 USD
  const debtPriceUSD = ethers.utils.parseEther("300");
  console.log(`(2) Feed debt price offChainOracle: token ${PARAM.DEBT_TOKEN} @ price = ${debtPriceUSD.toString()}`);
  tx = await offChainOracle.setPrices([PARAM.DEBT_TOKEN], [PARAM.USD], [debtPriceUSD]);
  console.log("tx hash:", tx.hash);
  console.log("✅ Done\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
