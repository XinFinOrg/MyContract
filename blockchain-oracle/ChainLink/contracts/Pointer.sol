pragma solidity 0.4.24;

import "./vendor/Ownable.sol";

contract Pointer is Ownable {
    
    address private currAddress;
    
    constructor(address _address) public {
        currAddress = _address;
    }
    
    function setAddress(address _address) public onlyOwner {
        currAddress = _address;
    }
    function getAddress() view public returns(address) {
        return currAddress;
    }
}