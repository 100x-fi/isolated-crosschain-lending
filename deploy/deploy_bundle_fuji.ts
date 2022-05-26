import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, upgrades } from "hardhat";
import {
  Cashier,
  Cashier__factory,
  TreasuryHolder,
  TreasuryHolder__factory,
  SimpleToken,
  SimpleToken__factory,
  OffChainOracle,
  OffChainOracle__factory,
  MarketConfig,
  MarketConfig__factory,
  Market,
  Market__factory,
} from "../typechain/v8";
import { getConfig } from "../utils";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const config = getConfig();
  const PARAM = {
    USD: config.fuji.tokens["USD"],
  };

  const deployer = (await ethers.getSigners())[0];
  console.log("deployer addr:", await deployer.getAddress());

  // const LZ_RINKEBY_CHAIN_ID = "10001";
  const LZ_BSC_CHAIN_ID = "10002";
  const LZ_FUJI_ENDPOINT = "_____";

  console.log(`(1) deploying a SimpleToken (collateral)`);
  const SimpleToken = (await ethers.getContractFactory("SimpleToken", deployer)) as SimpleToken__factory;
  const simpleToken = (await SimpleToken.deploy()) as SimpleToken;
  await simpleToken.deployed();
  console.log(`Deployed simpleToken at ${simpleToken.address}`);
  console.log("✅ Done deploying a SimpleToken\n");

  console.log(`(2) deploying a Cashier`);
  const Cashier = (await ethers.getContractFactory("Cashier", deployer)) as Cashier__factory;
  const cashier = (await upgrades.deployProxy(Cashier, [])) as Cashier;
  await cashier.deployed();
  console.log(`Deployed cashier at ${cashier.address}`);
  console.log("✅ Done deploying a Cashier\n");

  console.log(`(3) deploying an TreasuryHolder`);
  const TreasuryHolder = (await ethers.getContractFactory("TreasuryHolder", deployer)) as TreasuryHolder__factory;
  const treasuryHolder = (await upgrades.deployProxy(TreasuryHolder, [
    deployer.address,
    cashier.address,
    simpleToken.address,
  ])) as TreasuryHolder;
  await treasuryHolder.deployed();
  console.log(`Deployed treasuryHolder at ${treasuryHolder.address}`);
  console.log("✅ Done deploying a TreasuryHolder\n");

  console.log(`(4) deploying an OffChainOracle`);
  const OffChainOracle = (await ethers.getContractFactory("OffChainOracle", deployer)) as OffChainOracle__factory;
  const offChainOracle = (await upgrades.deployProxy(OffChainOracle, [])) as OffChainOracle;
  await offChainOracle.deployed();
  console.log(`Deployed offChainOracle at ${offChainOracle.address}`);
  console.log("✅ Done deploying an OffChainOracle\n");

  console.log(`(5) deploying a MarketConfig`);
  const MarketConfig = (await ethers.getContractFactory("MarketConfig", deployer)) as MarketConfig__factory;
  const marketConfig = (await upgrades.deployProxy(MarketConfig, [deployer.address])) as MarketConfig;
  await marketConfig.deployed();
  console.log(`Deployed marketConfig at ${marketConfig.address}`);
  console.log("✅ Done deploying an MarketConfig\n");

  console.log(`(6) deploying a Market`);
  const Market = (await ethers.getContractFactory("Market", deployer)) as Market__factory;
  const market = (await upgrades.deployProxy(Market, [
    cashier.address, // _cashier
    simpleToken.address, // _collateral
    marketConfig.address, // _marketConfig
    offChainOracle.address, // _oracle
    ethers.utils.defaultAbiCoder.encode(["address", "address"], [simpleToken.address, PARAM.USD]), // _collateralOracleData
    LZ_FUJI_ENDPOINT,
    LZ_BSC_CHAIN_ID,
  ])) as Market;
  await market.deployed();
  console.log(`Deployed market at ${market.address}`);
  console.log("✅ Done deploying an Market\n");
};

export default func;
func.tags = ["DeployBundleFUJI"];
