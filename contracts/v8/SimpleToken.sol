// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleToken is ERC20("SimpleToken", "SimpleToken"), Ownable {
  function mint(address _to, uint256 _amount) public onlyOwner {
    _mint(_to, _amount);
  }

  receive() external payable {
    _mint(msg.sender, msg.value);
  }
}
