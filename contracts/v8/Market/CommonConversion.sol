// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "./SafeCast.sol";

struct Conversion {
  uint128 amount;
  uint128 share;
}

/// @notice A Conversion library for converting amount to share and vice versa
library CommonConversion {
  using SafeCast for uint256;

  /// @notice Calculates the share value in relationship to `amount` and `total`.
  function toShare(
    Conversion memory total,
    uint256 amount,
    bool roundUp
  ) internal pure returns (uint256 share) {
    if (total.amount == 0) {
      share = amount;
    } else {
      share = (amount * (total.share)) / total.amount;
      if (roundUp && (share * (total.amount)) / total.share < amount) {
        share = share + 1;
      }
    }
  }

  /// @notice Calculates the amount value in relationship to `share` and `total`.
  function toAmount(
    Conversion memory total,
    uint256 share,
    bool roundUp
  ) internal pure returns (uint256 amount) {
    if (total.share == 0) {
      amount = share;
    } else {
      amount = (share * (total.amount)) / total.share;
      if (roundUp && (amount * (total.share)) / total.amount < share) {
        amount = amount + 1;
      }
    }
  }

  /// @notice Add `amount` to `total` and doubles `total.share`.
  /// @return (Conversion) The new total.
  /// @return share in relationship to `amount`.
  function add(
    Conversion memory total,
    uint256 amount,
    bool roundUp
  ) internal pure returns (Conversion memory, uint256 share) {
    share = toShare(total, amount, roundUp);
    total.amount = total.amount + amount.toUint128();
    total.share = total.share + share.toUint128();
    return (total, share);
  }

  /// @notice Sub `share` from `total` and update `total.amount`.
  /// @return (Conversion) The new total.
  /// @return amount in relationship to `share`.
  function sub(
    Conversion memory total,
    uint256 share,
    bool roundUp
  ) internal pure returns (Conversion memory, uint256 amount) {
    amount = toAmount(total, share, roundUp);
    total.amount = total.amount - amount.toUint128();
    total.share = total.share - share.toUint128();
    return (total, amount);
  }

  /// @notice Add `amount` and `share` to `total`.
  function add(
    Conversion memory total,
    uint256 amount,
    uint256 share
  ) internal pure returns (Conversion memory) {
    total.amount = total.amount + amount.toUint128();
    total.share = total.share + share.toUint128();
    return total;
  }

  /// @notice Subtract `amount` and `share` to `total`.
  function sub(
    Conversion memory total,
    uint256 amount,
    uint256 share
  ) internal pure returns (Conversion memory) {
    total.amount = total.amount - amount.toUint128();
    total.share = total.share - share.toUint128();
    return total;
  }

  /// @notice Add `amount` to `total` and update storage.
  /// @return newAmount Returns updated `amount`.
  function addAmount(Conversion storage total, uint256 amount) internal returns (uint256 newAmount) {
    newAmount = total.amount = total.amount + amount.toUint128();
  }

  /// @notice Subtract `amount` from `total` and update storage.
  /// @return newAmount Returns updated `amount`.
  function subAmount(Conversion storage total, uint256 amount) internal returns (uint256 newAmount) {
    newAmount = total.amount = total.amount - amount.toUint128();
  }
}
