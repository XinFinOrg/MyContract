contract Mintable is ReleasableToken,UpgradeableToken{
    function mint(uint _amount) onlyOwner {
        address contractAddr = address(this);
        require(_amount > 0 );
        totalSupply = safeAdd(totalSupply, _amount);
        balances[contractAddr] = safeAdd(balances[contractAddr],_amount);
    }
}
