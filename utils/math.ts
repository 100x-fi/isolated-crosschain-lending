import { BigNumber, constants } from "ethers";

export const mulTruncateBN = (a: BigNumber, b: BigNumber): BigNumber => {
  return a.mul(b).div(constants.WeiPerEther);
};

export const divScaleBN = (a: BigNumber, b: BigNumber): BigNumber => {
  return a.mul(constants.WeiPerEther).div(b);
};
