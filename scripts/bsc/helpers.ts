import { network } from "hardhat";

export const checkActiveNetwork = (): boolean => [97].includes(network.config.chainId ?? 0);
