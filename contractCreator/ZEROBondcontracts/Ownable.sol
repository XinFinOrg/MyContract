

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
  
  /* release ownership to make it autonomous */
   event OwnershipRenounced(address indexed previousOwner);

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
  
    /**
  * @dev Allows the current owner to relinquish control of the contract.
  * @notice Renouncing to ownership will leave the contract without an owner.
  * It will not be possible to call the functions with the `onlyOwner`
  * modifier anymore.
  */
  function renounceOwnership() public onlyOwner {
    emit OwnershipRenounced(owner);
    owner = address(0);
  }
  
     /**
  * @return true if `msg.sender` is the owner of the contract.
  */
  function isOwner() public view returns(bool) {
    return msg.sender == owner;
  }


}

