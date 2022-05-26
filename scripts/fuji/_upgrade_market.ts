import { ethers, upgrades } from "hardhat";
import { Market, Market__factory } from "../../typechain/v8";
import { getConfig, withNetworkFile } from "../../utils";

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
  const config = getConfig();
  const collateralConfig = config.fuji;
  const debtConfig = config.bsc;

  const deployer = (await ethers.getSigners())[0];
  const TARGET_CONTRACT = collateralConfig.markets["bsctest-fuji:SimpleToken-SimpleToken"];
  console.log(`>> Upgrading a Contract ${TARGET_CONTRACT}`);
  const Market = (await ethers.getContractFactory("Market", deployer)) as Market__factory;
  const market = (await upgrades.upgradeProxy(TARGET_CONTRACT, Market)) as Market;
  await market.deployed();
  console.log(`✅ Done Upgrading a Contract`);
}

withNetworkFile(main)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
