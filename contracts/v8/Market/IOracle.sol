// SPDX-License-Identifier: MIT

pragma solidity 0.8.13;

interface IOracle {
  function get(bytes calldata data) external view returns (bool _success, uint256 _rate);

  function symbol(bytes calldata data) external view returns (string memory);

  function name(bytes calldata data) external view returns (string memory);
}
