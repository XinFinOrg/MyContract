pragma solidity ^0.4.24;


<%- SafeMath %>
<%- IERC20 %>
<%- ERC20 %>
<%- SafeERC20 %>
<%- ERC20Detailed %>
<%- Ownable %>
<%- Roles %>
<%- CapperRole %>
<%- SignerRole %>
<%- PauserRole %>
<%- MinterRole %>
<%- Upgradable %>
<%- Pausable %>
<%- ERC20Pausable %>
<%- ERC20Burnable %>
<%- ERC20Mintable %>
<%- ERC20Capped %>


contract Coin is ERC20,Ownable,ERC20Detailed<%- inherits %>{
    constructor() ERC20(<%- totalSupply %><%- decimalInZero %>)ERC20Detailed('<%- name %>','<%- symbol %>',<%- decimal %>)<%- ERC20CappedSign %>{}
}