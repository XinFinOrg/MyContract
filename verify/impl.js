const axios = require("axios");

exports.VerifyContract = async (address, code, net, tokenName="Coin") => {
  try {
    let url;
    switch (net) {
      case "mainnet": {
        url = "https://explorer.xinfin.network/compile";
      }
      case "testnet": {
        return;
      }
      case "apothem": {
        url = "https://explorer.apothem.network/compile";
      }
      default: {
        url = "https://explorer.apothem.network/compile";
      }
    }
    // code = code.replace(/\"/g, '\\"');
    const resp = await axios.post(url, {
      address: address,
      optimization: false,
      name: tokenName,
      version: "v0.4.24+commit.e67f0147",
      action: "compile",
      code: code,
    });
    console.log(`token verified`,resp.data.valid);
  } catch (e) {
    console.log("e:", e.response);
  }
};
