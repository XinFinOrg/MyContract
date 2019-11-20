pragma solidity ^0.5.0;



contract Coin is ERC1400ERC20 {
    constructor ()  ERC1400ERC20(<%- ERC1400ERC20 %>, "DAU", 1
    , <%- controller %>, <%- CERTIFICATE_SIGNER %>, <%- partitions %>)
     public
    {
    }
}