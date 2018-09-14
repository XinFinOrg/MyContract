contract Burnable is ReleasableToken,UpgradeableToken {

    function burn(uint _amount) onlyOwner {
        address contractAddr = address(this);
        require(_amount <= balances[contractAddr] && _amount > 0);
        totalSupply = safeSub(totalSupply, _amount);
        balances[contractAddr] = safeSub(balances[contractAddr],_amount);
    }
}
