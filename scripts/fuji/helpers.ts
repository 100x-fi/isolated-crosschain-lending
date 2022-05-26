import { network } from "hardhat";

export const checkActiveNetwork = (): boolean => [43113].includes(network.config.chainId ?? 0);
