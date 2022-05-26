// SPDX-License-Identifier: MIT

pragma solidity 0.8.13;

/// @title ITreasuryHolderCallback is an interface for chip market to be used
interface ITreasuryHolderCallback {
  function onBadDebt(uint256 _badDebtValue) external;
}
