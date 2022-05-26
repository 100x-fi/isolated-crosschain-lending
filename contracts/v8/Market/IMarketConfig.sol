// SPDX-License-Identifier: MIT

pragma solidity 0.8.13;

interface IMarketConfig {
  function collateralFactor(address _market, address _user) external view returns (uint256);

  function interestPerSecond(address _market) external view returns (uint256);

  function liquidationPenalty(address _market) external view returns (uint256);

  function liquidationTreasuryBps(address _market) external view returns (uint256);

  function closeFactorBps(address _market) external view returns (uint256);

  function minDebtSize(address _market) external view returns (uint256);

  function treasury() external view returns (address);
}
