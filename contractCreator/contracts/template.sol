pragma solidity ^0.4.4;

/**
 * @title ERC20 interface
 * see https://github.com/ethereum/EIPs/issues/20
 */
contract ERC20 {

  uint public totalSupply;
  uint public decimals;

  function balanceOf(address who) constant returns (uint);
  function allowance(address owner, address spender) constant returns (uint);

  function transfer(address to, uint value) returns (bool ok);
  function transferFrom(address from, address to, uint value) returns (bool ok);
  function approve(address spender, uint value) returns (bool ok);

  event Transfer(address indexed from, address indexed to, uint value);
  event Approval(address indexed owner, address indexed spender, uint value);

}

/**
 * @title Ownable
 * The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
  /* Current Owner */
  address public owner;

  /* New owner which can be set in future */
  address public newOwner;

  /* event to indicate finally ownership has been succesfully transferred and accepted */
  event OwnershipTransferred(address indexed _from, address indexed _to);

  /**
   * The Ownable constructor sets the original `owner` of the contract to the sender account.
   */
  function Ownable() {
    owner = msg.sender;
  }

  /**
   * Throws if called by any account other than the owner.
   */
  modifier onlyOwner {
    require(msg.sender == owner);
    _;
  }

  /**
   * Allows the current owner to transfer control of the contract to a newOwner.
   * @param _newOwner The address to transfer ownership to.
   */
  function transferOwnership(address _newOwner) onlyOwner {
    require(_newOwner != address(0));
    newOwner = _newOwner;
  }

  /**
   * Allows the new owner toaccept ownership
   */
  function acceptOwnership() {
    require(msg.sender == newOwner);
    OwnershipTransferred(owner, newOwner);
    owner = newOwner;
  }

}

/*
*This library is used to do mathematics safely
*/
contract SafeMathLib {
  function safeMul(uint a, uint b) returns (uint) {
    uint c = a * b;
    assert(a == 0 || c / a == b);
    return c;
  }

  function safeSub(uint a, uint b) returns (uint) {
    assert(b <= a);
    return a - b;
  }

  function safeAdd(uint a, uint b) returns (uint) {
    uint c = a + b;
    assert(c>=a);
    return c;
  }
}

/**
 * Standard ERC20 token with Short Hand Attack and approve() race condition mitigation.
 */
contract StandardToken is ERC20, SafeMathLib {

  /* Actual balances of token holders */
  mapping(address => uint) balances;

  /* approve() allowances */
  mapping (address => mapping (address => uint)) allowed;

  function transfer(address _to, uint _value) returns (bool success) {

      // SafMaths will automatically handle the overflow checks
      balances[msg.sender] = safeSub(balances[msg.sender],_value);
      balances[_to] = safeAdd(balances[_to],_value);
      Transfer(msg.sender, _to, _value);
      return true;

  }

  function transferFrom(address _from, address _to, uint _value) returns (bool success) {

    uint _allowance = allowed[_from][msg.sender];

    // Check is not needed because safeSub(_allowance, _value) will already throw if this condition is not met
    balances[_to] = safeAdd(balances[_to],_value);
    balances[_from] = safeSub(balances[_from],_value);
    allowed[_from][msg.sender] = safeSub(_allowance,_value);
    Transfer(_from, _to, _value);
    return true;

  }

  function balanceOf(address _owner) constant returns (uint balance) {
    return balances[_owner];
  }

  function approve(address _spender, uint _value) returns (bool success) {

    /** To change the approve amount you first have to reduce the addresses`
    *  allowance to zero by calling `approve(_spender, 0)` if it is not
    *  already 0 to mitigate the race condition described here:
    *  https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
    */
    require(!((_value != 0) && (allowed[msg.sender][_spender] != 0)));

    allowed[msg.sender][_spender] = _value;
    Approval(msg.sender, _spender, _value);
    return true;
  }

  function allowance(address _owner, address _spender) constant returns (uint remaining) {
    return allowed[_owner][_spender];
  }

}


upgradeableToken


 releaseableToken


 burnableToken


 mintableToken


contract Coin is allContracts {

  event UpdatedTokenInformation(string newName, string newSymbol);

  /* name of the token */
  string public name = "tokenName";

  /* symbol of the token */
  string public symbol = "tokenSymbol";

  /* token decimals to handle fractions */
  uint public decimals = tokenDecimals;

  /* initial token supply */

  uint public onSaleTokens = tokenOnSale * (10 ** decimals);

  uint256 pricePerToken = tokenPricePerToken;

  uint minETH = 0;                  // 0 ether
  uint maxETH = 500 * 10**decimals; // 500 ether

  //Crowdsale running
  bool public isCrowdsaleOpen=false;

  uint tokensForPublicSale = 0;

  address contractAddress;

  function Coin() upgradeCon {
    owner = msg.sender;
    contractAddress = address(this);
    totalSupply = tokenTotalSupply * (10 ** decimals);
    //tokens are kept in contract address rather than owner
    balances[contractAddress] = totalSupply;
  }

  /* function to update token name and symbol */
  function updateTokenInformation(string _name, string _symbol) onlyOwner {
    name = _name;
    symbol = _symbol;
    UpdatedTokenInformation(name, symbol);
  }

  function sendTokensToOwner(uint _tokens) onlyOwner returns (bool ok){
      require(balances[contractAddress] >= _tokens);
      balances[contractAddress] = safeSub(balances[contractAddress],_tokens);
      balances[owner] = safeAdd(balances[owner],_tokens);
      return true;
  }

  /* single address */
  function sendTokensToInvestors(address _investor, uint _tokens) onlyOwner returns (bool ok){
      require(balances[contractAddress] >= _tokens);
      onSaleTokens = safeSub(onSaleTokens, _tokens);
      balances[contractAddress] = safeSub(balances[contractAddress],_tokens);
      balances[_investor] = safeAdd(balances[_investor],_tokens);
      return true;
  }

  /* A dispense feature to allocate some addresses with tokens
  * calculation done using token count
  *  Can be called only by owner
  */
  function dispenseTokensToInvestorAddressesByValue(address[] _addresses, uint[] _value) onlyOwner returns (bool ok){
     require(_addresses.length == _value.length);
     for(uint256 i=0; i<_addresses.length; i++){
        onSaleTokens = safeSub(onSaleTokens, _value[i]);
        balances[_addresses[i]] = safeAdd(balances[_addresses[i]], _value[i]);
        balances[contractAddress] = safeSub(balances[contractAddress], _value[i]);
     }
     return true;
  }

  function startCrowdSale() onlyOwner {
     isCrowdsaleOpen=true;
  }

   function stopCrowdSale() onlyOwner {
     isCrowdsaleOpen=false;
  }

 function setPublicSaleParams(uint _tokensForPublicSale, uint _min, uint _max, bool _crowdsaleStatus ) onlyOwner {
    require(_tokensForPublicSale != 0);
    require(_tokensForPublicSale <= onSaleTokens);
    tokensForPublicSale = _tokensForPublicSale;
    isCrowdsaleOpen=_crowdsaleStatus;
    require(_min >= 0);
    require(_max > _min+1);
    minETH = _min;
    maxETH = _max;
 }


 function setTotalTokensForPublicSale(uint _value) onlyOwner{
      require(_value != 0);
      tokensForPublicSale = _value;
  }

  function setMinAndMaxEthersForPublicSale(uint _min, uint _max) onlyOwner{
      require(_min >= 0);
      require(_max > _min+1);
      minETH = _min;
      maxETH = _max;
  }

  function updateTokenPrice(uint _value) onlyOwner{
      require(_value != 0);
      pricePerToken = _value;
  }

  function updateOnSaleSupply(uint _newSupply) onlyOwner{
      require(_newSupply != 0);
      onSaleTokens = _newSupply;
  }

  function buyTokens() public payable returns(uint tokenAmount) {
    uint _tokenAmount;
    uint multiplier = (10 ** decimals);
    uint weiAmount = msg.value;

    require(isCrowdsaleOpen);
    require(weiAmount >= minETH);
    require(weiAmount <= maxETH);

    _tokenAmount = safeMul(weiAmount,pricePerToken);

    require(_tokenAmount > 0);

    //safe sub will automatically handle overflows
    tokensForPublicSale = safeSub(tokensForPublicSale, _tokenAmount);
    onSaleTokens = safeSub(onSaleTokens, _tokenAmount);
    balances[contractAddress] = safeSub(balances[contractAddress],_tokenAmount);
    //assign tokens
    balances[msg.sender] = safeAdd(balances[msg.sender], _tokenAmount);

    //send money to the owner
    require(owner.send(weiAmount));
    return _tokenAmount;

  }

  // There is no need for vesting. It will be done manually by manually releasing tokens to certain addresses

  function() payable {
      buyTokens();
  }

  function destroyToken() public onlyOwner {
      selfdestruct(msg.sender);
  }

}
