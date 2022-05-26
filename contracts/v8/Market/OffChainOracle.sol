// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "./Initializable.sol";
import "./AccessControlUpgradeable.sol";
import "./IOracle.sol";

/// @title OffChainOracle
/// @notice Oracle used for off-chain oracle
contract OffChainOracle is IOracle, Initializable, AccessControlUpgradeable {
  bytes32 public constant FEEDER_ROLE = keccak256("FEEDER_ROLE");

  struct PriceData {
    uint192 price;
    uint64 lastUpdate;
  }

  /// @notice Public price data mapping storage.
  mapping(address => mapping(address => PriceData)) public store;

  event LogPriceUpdate(address indexed token0, address indexed token1, uint256 price);

  modifier onlyFeeder() {
    require(hasRole(FEEDER_ROLE, _msgSender()), "OffChainOracle::onlyFeeder::only FEEDER role");
    _;
  }

  function initialize() external initializer {
    AccessControlUpgradeable.__AccessControl_init();

    _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
  }

  /// @dev Set the prices of the token token pairs. Must be called by the feeder.
  function setPrices(
    address[] calldata _token0s,
    address[] calldata _token1s,
    uint256[] calldata _prices
  ) external onlyFeeder {
    uint256 _len = _token0s.length;
    require(_token1s.length == _len, "OffChainOracle::setPrices:: bad token1s length");
    require(_prices.length == _len, "OffChainOracle::setPrices:: bad prices length");
    for (uint256 idx = 0; idx < _len; idx++) {
      address _token0 = _token0s[idx];
      address _token1 = _token1s[idx];
      uint256 _price = _prices[idx];
      store[_token0][_token1] = PriceData({ price: uint192(_price), lastUpdate: uint64(block.timestamp) });
      emit LogPriceUpdate(_token0, _token1, _price);
    }
  }

  /// @dev Return the wad price of token0/token1, multiplied by 1e18
  /// NOTE: (if you have 1 token0 how much you can sell it for token1)
  function _getPrice(address _token0, address _token1) internal view returns (uint256 price, uint256 lastUpdate) {
    PriceData memory _data = store[_token0][_token1];
    price = uint256(_data.price);
    lastUpdate = uint256(_data.lastUpdate);
    require(price != 0 && lastUpdate != 0, "OffChainOracle::getPrice:: bad price data");
    return (price, lastUpdate);
  }

  /// @dev Get the exchange rate
  function get(bytes calldata _data) public view override returns (bool, uint256) {
    (address _token0, address _token1) = abi.decode(_data, (address, address));
    (uint256 _price, uint256 _lastUpdate) = _getPrice(_token0, _token1);
    return (_lastUpdate >= block.timestamp - 1 days, _price);
  }

  /// @dev Return "Offchain" as a name
  function name(bytes calldata) public pure override returns (string memory) {
    return "OffChain";
  }

  /// @dev Return "OFFCHAIN" as a symbol
  function symbol(bytes calldata) public pure override returns (string memory) {
    return "OFFCHAIN";
  }
}
