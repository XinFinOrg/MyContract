pragma solidity ^0.4.24;
<%- SafeMath %>
<%- IERC20 %>
<%- SafeERC20 %>


/**
 * @title Crowdsale
 * @dev Crowdsale is a base contract for managing a token crowdsale,
 * allowing investors to purchase tokens with ether. This contract implements
 * such functionality in its most fundamental form and can be extended to provide additional
 * functionality and/or custom behavior.
 * The external interface represents the basic interface for purchasing tokens, and conform
 * the base architecture for crowdsales. They are *not* intended to be modified / overridden.
 * The internal interface conforms the extensible and modifiable surface of crowdsales. Override
 * the methods to add functionality. Consider using 'super' where appropriate to concatenate
 * behavior.
 */
contract Crowdsale {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  // The token being sold
  IERC20 private _token;

  // Address where funds are collected
  address private _wallet;

  // How many token units a buyer gets per wei.
  // The rate is the conversion between wei and the smallest and indivisible token unit.
  // So, if you are using a rate of 1 with a ERC20Detailed token with 3 decimals called TOK
  // 1 wei will give you 1 unit, or 0.001 TOK.
  uint256 private _rate;

  // Amount of wei raised
  uint256 private _weiRaised;
  
  //Owner
  address private _owner;
  
  //sale status
  bool private _isCrowdsaleOpen; 
  
  //bouns rate
  uint256 private _bonusRate;
  
  //bool for bouns status
  bool private _isBonusOn;

  /**
   * Event for token purchase logging
   * @param purchaser who paid for the tokens
   * @param beneficiary who got the tokens
   * @param value weis paid for purchase
   * @param amount amount of tokens purchased
   */
  event TokensPurchased(
    address indexed purchaser,
    address indexed beneficiary,
    uint256 value,
    uint256 amount
  );
  
  event TokensPurchased( 
    address indexed beneficiary,
    uint256 amount);
  
  /*modifier to control Crowdsale function access*/
   modifier onlyOwner {
    require(msg.sender == _owner);
    _;
  }
  
   modifier isSaleOn {
    require(_isCrowdsaleOpen == true);
    _;
  }


  /**
   * @param rate Number of token units a buyer gets per wei
   * @dev The rate is the conversion between wei and the smallest and indivisible
   * token unit. So, if you are using a rate of 1 with a ERC20Detailed token
   * with 3 decimals called TOK, 1 wei will give you 1 unit, or 0.001 TOK.
   * @param wallet Address where collected funds will be forwarded to
   * @param token Address of the token being sold
   */
    constructor(uint256 rate,uint256 bonusRate,address wallet,IERC20 token,bool isBonusOn) public {
    _rate = rate;
    _wallet = wallet;
    _token = token;
    _owner = msg.sender;
    _bonusRate = bonusRate;
    _isCrowdsaleOpen = true;
    _isBonusOn = isBonusOn;
  }
  // -----------------------------------------
  // Crowdsale external interface
  // -----------------------------------------

  /**
   * @dev fallback function ***DO NOT OVERRIDE***
   */
   
   //custom start
   function startCrowdSale() onlyOwner {
     _isCrowdsaleOpen=true;
  }

   function stopCrowdSale() onlyOwner {
     _isCrowdsaleOpen=false;
  }
  
   function updateTokenPrice(uint _value) onlyOwner{
      require(_value != 0);
      _rate = _value;
  } 
  
    function updateBounsRate(uint _value) onlyOwner{
      require(_value != 0);
      _bonusRate = _value;
  }
    function updateBounsStatus(bool _value) onlyOwner{
      _isBonusOn = _value;
  }
    /* A dispense feature to allocate some addresses with tokens
  * calculation done using token count
  *  Can be called only by owner
  */
  function dispenseTokensToInvestorAddressesByValue(address[] _addresses, uint[] _value) onlyOwner returns (bool ok){
     require(_addresses.length == _value.length);
     for(uint256 i=0; i<_addresses.length; i++){
        _preValidatePurchase(_addresses[i], _value[i]);
        _processPurchase(_addresses[i], _value[i]);
        emit TokensPurchased(_addresses[i], _value[i]);
     }
     return true;
  }
  
  /* single address */
  function sendTokensToInvestors(address _investor, uint _tokens) onlyOwner returns (bool ok){
        _preValidatePurchase(_investor,_tokens);
        _processPurchase(_investor,_tokens);
        emit TokensPurchased(_investor,_tokens);
      return true;
  }

  
  //custom end
   
   
  function () external payable {
    buyTokens(msg.sender);
  }

  /**
   * @return the token being sold.
   */
  function token() public view returns(IERC20) {
    return _token;
  }
  /**
   * @return the token bonus status.
   */
  function isBonusOn() public view returns(bool) {
    return _isBonusOn;
  }
  /**
   * @return the token bonus Rate.
   */
  function bonusRate() public view returns(uint256) {
    return _bonusRate;
  }

  /**
   * @return the address where funds are collected.
   */
  function wallet() public view returns(address) {
    return _wallet;
  }

  /**
   * @return the number of token units a buyer gets per wei.
   */
  function rate() public view returns(uint256) {
    return _rate;
  }

  /**
   * @return the mount of wei raised.
   */
  function weiRaised() public view returns (uint256) {
    return _weiRaised;
  }

  /**
   * @dev low level token purchase ***DO NOT OVERRIDE***
   * @param beneficiary Address performing the token purchase
   */
  function buyTokens(address beneficiary) public isSaleOn payable {

    uint256 weiAmount = msg.value;
    _preValidatePurchase(beneficiary, weiAmount);

    // calculate token amount to be created
    uint256 tokens = _getTokenAmount(weiAmount);
    
    if(_isBonusOn == true){
    //add Bonus tokens to total tokens
    tokens = _addBonusTokens(tokens);
    }
    // update state
    _weiRaised = _weiRaised.add(weiAmount);

    _processPurchase(beneficiary, tokens);
    emit TokensPurchased(
      msg.sender,
      beneficiary,
      weiAmount,
      tokens
    );

    _updatePurchasingState(beneficiary, weiAmount);

    _forwardFunds();
    _postValidatePurchase(beneficiary, weiAmount);
  }

  // -----------------------------------------
  // Internal interface (extensible)
  // -----------------------------------------

  /**
   * @dev Validation of an incoming purchase. Use require statements to revert state when conditions are not met. Use `super` in contracts that inherit from Crowdsale to extend their validations.
   * Example from CappedCrowdsale.sol's _preValidatePurchase method:
   *   super._preValidatePurchase(beneficiary, weiAmount);
   *   require(weiRaised().add(weiAmount) <= cap);
   * @param beneficiary Address performing the token purchase
   * @param weiAmount Value in wei involved in the purchase
   */
  function _preValidatePurchase(
    address beneficiary,
    uint256 weiAmount
  )
    internal
  {
    require(beneficiary != address(0));
    require(weiAmount != 0);
  }

  /**
   * @dev Validation of an executed purchase. Observe state and use revert statements to undo rollback when valid conditions are not met.
   * @param beneficiary Address performing the token purchase
   * @param weiAmount Value in wei involved in the purchase
   */
  function _postValidatePurchase(
    address beneficiary,
    uint256 weiAmount
  )
    internal
  {
    // optional override
  }

  /**
   * @dev Source of tokens. Override this method to modify the way in which the crowdsale ultimately gets and sends its tokens.
   * @param beneficiary Address performing the token purchase
   * @param tokenAmount Number of tokens to be emitted
   */
  function _deliverTokens(
    address beneficiary,
    uint256 tokenAmount
  )
    internal
  {
    _token.safeTransfer(beneficiary, tokenAmount);
  }

  /**
   * @dev Executed when a purchase has been validated and is ready to be executed. Not necessarily emits/sends tokens.
   * @param beneficiary Address receiving the tokens
   * @param tokenAmount Number of tokens to be purchased
   */
  function _processPurchase(
    address beneficiary,
    uint256 tokenAmount
  )
    internal
  {
    _deliverTokens(beneficiary, tokenAmount);
  }

  /**
   * @dev Override for extensions that require an internal state to check for validity (current user contributions, etc.)
   * @param beneficiary Address receiving the tokens
   * @param weiAmount Value in wei involved in the purchase
   */
  function _updatePurchasingState(
    address beneficiary,
    uint256 weiAmount
  )
    internal
  {
    // optional override
  }

  /**
   * @dev Override to extend the way in which ether is converted to tokens.
   * @param weiAmount Value in wei to be converted into tokens
   * @return Number of tokens that can be purchased with the specified _weiAmount
   */
  function _getTokenAmount(uint256 weiAmount)
    internal view returns (uint256)
  {
    return weiAmount.mul(_rate);
  }
   /**
   * @dev Determines how ETH is stored/forwarded on purchases.
   */
  function _addBonusTokens(uint256 tokens)
   internal view returns (uint256)
   {
    uint256 totalTokens;
    totalTokens = tokens.mul(_bonusRate).div(100) ;
    return tokens.add(totalTokens);
  }

  /**
   * @dev Determines how ETH is stored/forwarded on purchases.
   */
  function _forwardFunds() internal {
    _wallet.transfer(msg.value);
  }
}
