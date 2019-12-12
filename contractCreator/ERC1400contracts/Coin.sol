pragma solidity ^0.4.25;

<%- ERC1400 %>
contract Coin is ERC1400{
    constructor() ERC1400('<%- name %>', '<%- symbol %>' ,<%- granularity %>, <%- controllers %>
    ,<%- certificateSigner %> ,<%- defaultPartitions %>)
     {}
}

