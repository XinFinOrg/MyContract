let {
  ropsten,
  xdc,
  apothem,
  ConnectionEmitter,
} = require("./blockchain/index");
const { Stablecoin } = require("./abi");
const { add } = require("lodash");

ConnectionEmitter.on("xdc", () => {
  console.log("[*] xdc reconnected");
  xdc = require("./blockchain/index").xdc;
});
ConnectionEmitter.on("ropsten", () => {
  console.log("[*] ropsten reconnected");
  ropsten = require("./blockchain/index").ropsten;
});
ConnectionEmitter.on("apothem", () => {
  console.log("[*] apothem reconnected");
  apothem = require("./blockchain/index").apothem;
});

exports.ConfigureMinterStableCoin = async (req, res) => {
  try {
    const { network, address, privateKey, minter, amount } = req.body;
    const netVar = getNetVar(network);
    if (netVar === null)
      return res.status(400).json({ message: "Network unidentified" });
    const contractInst = new netVar.eth.Contract(Stablecoin, address);

    const encodedData = contractInst.methods
      .configureMinter(minter, amount)
      .encodeABI();
    const tx = {
      data: encodedData,
      to: address,
    };
    const receipt = await MakeTx(netVar, tx, privateKey);
    res.json({ ...receipt });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "server error" });
  }
};

exports.MintStablecoin = async (req, res) => {
  try {
    const { network, address, privateKey, to, amount } = req.body;
    const netVar = getNetVar(network);
    if (netVar === null)
      return res.status(400).json({ message: "Network unidentified" });
    const contractInst = new netVar.eth.Contract(Stablecoin, address);

    const encodedData = contractInst.methods.mint(to, amount).encodeABI();
    const tx = {
      data: encodedData,
      to: address,
    };
    const receipt = await MakeTx(netVar, tx, privateKey);
    res.json({ ...receipt });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "server error" });
  }
};

exports.BurnStablecoin = async (req, res) => {
  try {
    const { network, address, privateKey, amount } = req.body;
    const netVar = getNetVar(network);
    if (netVar === null)
      return res.status(400).json({ message: "Network unidentified" });
    const contractInst = new netVar.eth.Contract(Stablecoin, address);

    const encodedData = contractInst.methods.burn(amount).encodeABI();
    const tx = {
      data: encodedData,
      to: address,
    };
    const receipt = await MakeTx(netVar, tx, privateKey);
    res.json({ ...receipt });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "server error" });
  }
};

/**
 * Internal function
 */

function getNetVar(netName) {
  switch (netName) {
    case "ropsten": {
      return ropsten;
    }
    case "apothem": {
      return apothem;
    }
    case "xdc": {
      return xdc;
    }
    default: {
      return null;
    }
  }
}

/**
 * will reolve on TX hash
 * @param {*} netVar
 * @param {*} tx
 * @param {*} privateKey
 */
function MakeTx(netVar, tx, privateKey) {
  return new Promise(async (resolve, reject) => {
    //
    try {
      if (!privateKey.startsWith("0x")) privateKey = "0x" + privateKey;
      const { address } = netVar.eth.accounts.privateKeyToAccount(privateKey);
      const nonce = await netVar.eth.getTransaction(address, "pending");
      tx["from"] = address;
      tx["nonce"] = nonce;
      const gas = netVar.eth.estimateGas(tx);
      tx["gas"] = gas;
      const signed = await netVar.eth.accounts.signTransaction(tx, privateKey);
      netVar.eth
        .sendSignedTransaction(signed.rawTransaction)
        .on("receipt", (receipt) => {
          resolve(receipt);
        })
        .on("erorr", (err) => {
          reject(err);
        });
    } catch (e) {
      console.trace(e);
      reject(e);
    }
  });
}
