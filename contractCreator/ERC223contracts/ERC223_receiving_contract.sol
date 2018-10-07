
 /**
 * @title Contract that will work with ERC223 tokens.
 */
 
interface ERC223ReceivingContract { 
/**
 * @dev Standard ERC223 function that will handle incoming token transfers.
 *
 * @param from  Token sender address.
 * @param value Amount of tokens.
 * @param data  Transaction metadata.
 */
    function tokenFallback(address from, uint value, bytes data) external;
}