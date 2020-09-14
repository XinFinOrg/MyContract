const LinkToken = artifacts.require("LinkToken");
const Oracle = artifacts.require("Oracle");
const Pointer = artifacts.require("Pointer");

module.exports = function (deployer) {
  deployer.deploy(LinkToken).then(async () => {
    const CoinAddr = (await LinkToken.deployed()).address;
    await deployer.deploy(Oracle, CoinAddr);
    await deployer.deploy(Pointer, CoinAddr);
  });
};
