// SPDX-License-Identifier: MIT

pragma solidity 0.8.13;

/**
  wad : fixed point decimal with 18 decimals (for basic quantities, e.g. balances)
  ray : fixed point decimal with 27 decimals (for precise quantites, e.g. ratios)
  rad : fixed point decimal with 45 decimals (result of integer multiplication with a wad and a ray)
*/

library WadRayMath {
  uint256 internal constant WAD = 10**18;
  uint256 internal constant RAY = 10**27;

  function divup(uint256 _x, uint256 _y) internal pure returns (uint256 _z) {
    _z = (_x + (_y - 1)) / _y;
  }

  function wmul(uint256 _x, uint256 _y) internal pure returns (uint256 _z) {
    _z = (_x * _y) / WAD;
  }

  function wdiv(uint256 _x, uint256 _y) internal pure returns (uint256 _z) {
    _z = (_x * WAD) / _y;
  }

  function wdivup(uint256 _x, uint256 _y) internal pure returns (uint256 _z) {
    _z = divup(_x * WAD, _y);
  }

  function rmul(uint256 _x, uint256 _y) internal pure returns (uint256 _z) {
    _z = (_x * _y) / RAY;
  }

  function rmulup(uint256 _x, uint256 _y) internal pure returns (uint256 _z) {
    _z = divup((_x * _y), RAY);
  }

  function rdiv(uint256 _x, uint256 _y) internal pure returns (uint256 _z) {
    _z = (_x * RAY) / _y;
  }
}
