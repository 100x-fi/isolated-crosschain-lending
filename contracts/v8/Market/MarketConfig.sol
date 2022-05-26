// SPDX-License-Identifier: GPL-3.0

/**
  |¯¯¯¯¯|||¯¯¯¯|  '      /¯¯¯¯¯| |¯¯¯¯¯|°
  |    ¯¯|  |       |__   /     !     | |         | 
  |__|¯¯'  |______| /___/¯|__'|  ¯|__|¯  
 */

pragma solidity 0.8.13;
pragma experimental ABIEncoderV2;

import "./OwnableUpgradeable.sol";

import "./IMarketConfig.sol";

contract MarketConfig is IMarketConfig, OwnableUpgradeable {
  /// @notice Events
  event LogSetTreasury(address _prevFeeTreasury, address _feeTreasury);
  event LogSetConfig(
    address _caller,
    address indexed _market,
    uint64 _collateralFactor,
    uint64 _liquidationPenalty,
    uint64 _liquidationTreasuryBps,
    uint256 _minDebtSize,
    uint256 _interestPerSecond,
    uint64 _closeFactorBps
  );

  /// @notice Config fro the Markets
  struct Config {
    uint64 collateralFactor;
    uint64 liquidationPenalty;
    uint64 liquidationTreasuryBps;
    uint256 minDebtSize;
    uint64 closeFactorBps;
    uint256 interestPerSecond;
  }

  address public treasury;

  mapping(address => Config) public configs;

  /// @notice The constructor is only used for the initial master contract.
  /// Subsequent clones are initialised via `init`.
  function initialize(address _treasury) external initializer {
    OwnableUpgradeable.__Ownable_init();

    require(_treasury != address(0), "treasury address cannot be address(0)");

    treasury = _treasury;
  }

  /// @notice Return the collateralFactor of the given market
  /// @param _market The market address
  function collateralFactor(
    address _market,
    address /* _user */
  ) external view returns (uint256) {
    return uint256(configs[_market].collateralFactor);
  }

  /// @notice Return interestPerSecond of the given market
  /// @param _market The market address
  function interestPerSecond(address _market) external view returns (uint256) {
    return configs[_market].interestPerSecond;
  }

  /// @notice Return the liquidationPenalty of the given market
  /// @param _market The market address
  function liquidationPenalty(address _market) external view returns (uint256) {
    return uint256(configs[_market].liquidationPenalty);
  }

  /// @notice Return the liquidationPenalty of the given market
  /// @param _market The market address
  function liquidationTreasuryBps(address _market) external view returns (uint256) {
    return uint256(configs[_market].liquidationTreasuryBps);
  }

  /// @notice Return the minDebtSize of the given market
  /// @param _market The market address
  function minDebtSize(address _market) external view returns (uint256) {
    return uint256(configs[_market].minDebtSize);
  }

  /// @notice Return the closeFactorBps of the given market
  /// @param _market The market address
  function closeFactorBps(address _market) external view returns (uint256) {
    return uint256(configs[_market].closeFactorBps);
  }

  /// @notice Set the config for markets
  /// @param _markets The markets addresses
  /// @param _configs Configs for each market
  function setConfig(address[] calldata _markets, Config[] calldata _configs) external onlyOwner {
    uint256 _len = _markets.length;
    require(_len == _configs.length, "bad len");
    for (uint256 i = 0; i < _len; i++) {
      require(_markets[i] != address(0), "bad market");
      require(_configs[i].collateralFactor >= 5000 && _configs[i].collateralFactor <= 9500, "bad collateralFactor");
      require(
        _configs[i].liquidationPenalty >= 10000 && _configs[i].liquidationPenalty <= 19000,
        "bad liquidityPenalty"
      );
      require(
        _configs[i].liquidationTreasuryBps >= 500 && _configs[i].liquidationTreasuryBps <= 8000,
        "bad liquidationTreasuryBps"
      );
      require(_configs[i].closeFactorBps <= 10000, "bad closeFactorBps");

      configs[_markets[i]] = Config({
        collateralFactor: _configs[i].collateralFactor,
        liquidationPenalty: _configs[i].liquidationPenalty,
        liquidationTreasuryBps: _configs[i].liquidationTreasuryBps,
        minDebtSize: _configs[i].minDebtSize,
        interestPerSecond: _configs[i].interestPerSecond,
        closeFactorBps: _configs[i].closeFactorBps
      });
      emit LogSetConfig(
        msg.sender,
        _markets[i],
        _configs[i].collateralFactor,
        _configs[i].liquidationPenalty,
        _configs[i].liquidationTreasuryBps,
        _configs[i].minDebtSize,
        _configs[i].interestPerSecond,
        _configs[i].closeFactorBps
      );
    }
  }

  /// @notice Set the treasury address
  /// @param _newTreasury The new treasury address
  function setTreasury(address _newTreasury) external onlyOwner {
    require(_newTreasury != address(0), "bad _newTreasury");

    address _prevTreasury = treasury;
    treasury = _newTreasury;

    emit LogSetTreasury(_prevTreasury, _newTreasury);
  }
}
