require("dotenv").config();
const { assert, expect } = require("chai");

const Oracle = artifacts.require("Oracle");
const Coin = artifacts.require("Coin");
const Pointer = artifacts.require("Pointer");

contract("Oracle", (accounts) => {
  let CoinInst, OracleInst, PointerInst;

  before(async () => {
    CoinInst = await Coin.deployed();
    OracleInst = await Oracle.deployed();
    PointerInst = await Pointer.deployed();
  });

  it("owner test", async () => {
    expect(
      accounts[0] !== (await OracleInst.owner()),
      "first address is initial owner"
    );
  });
});
