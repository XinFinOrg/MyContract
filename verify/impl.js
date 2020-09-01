const axios = require("axios");

exports.VerifyContract = async (address, code, net) => {
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

    const resp = await axios.post(url, {
      address: address,
      optimization: false,
      name: "Coin",
      version: "v0.4.24+commit.e67f0147",
      action: "compile",
      code: code,
    });
  } catch (e) {
    console.log("e:", e);
  }
};
