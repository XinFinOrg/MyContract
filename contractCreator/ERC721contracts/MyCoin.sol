pragma solidity ^0.4.24;

import './ERC721Full.sol';
import './ERC721Mintable.sol';
import './ERC721Pausable.sol';
import './ERC721Burnable.sol';

contract Coin is ERC721Full, ERC721Mintable, ERC721Pausable, ERC721Burnable {
  constructor() ERC721Full("NISHANT", "NMC") public {
  }
}
