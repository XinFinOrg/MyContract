const axios = require("axios");
const Web3 = require("web3");
const web3 = new Web3(
  // new Web3.providers.HttpProvider("https://rpc.xinfin.network")
  new Web3.providers.HttpProvider("https://rpc.apothem.network")
);

const ejs = require("ejs");

const VerifyContract = async (
  address,
  code,
  { net = "apothem", tokenName = "Coin", abi = "", ...rest }
) => {
  try {
    console.log("called VerifyContract", net, tokenName, abi);
    net = net.trim();
    tokenName = tokenName.trim();
    let url;
    switch (net) {
      case "mainnet": {
        url = "https://explorer.xinfin.network/compile";
        break;
      }
      case "testnet": {
        return;
      }
      case "apothem": {
        url = "https://explorer.apothem.network/compile";
        break;
      }
      default: {
        url = "https://explorer.apothem.network/compile";
        break;
      }
    }

    console.log(url, tokenName);

    // code = code.replace(/\"/g, '\\"');
    const resp = await axios.post(url, {
      address: address,
      optimization: false,
      name: tokenName,
      version: "v0.4.24+commit.e67f0147",
      action: "compile",
      code: code,
      abi: abi,
    });
    console.log(`token verified`, resp.data.valid);
  } catch (e) {
    if (e.response) console.log("e:", e.response.data);
    else console.log(e);
  }
};

// ejs.renderFile(
//   "/home/rudresh/Workspace/MyContract/contractCreator/USDC/Token.sol",
//   {},
//   (err, code) => {
//     console.log(err, code);
//     VerifyContract("xdcc708d0c0a66caf415bf55cecd1fc6038f599e4dd", code, {
//       net: "mainnet",
//       tokenName: "FiatTokenV1",
//       constructor: web3.eth.abi
//         .encodeParameters(
//           [
//             "string",
//             "string",
//             "string",
//             "uint8",
//             "address",
//             "address",
//             "address",
//             "address",
//           ],
//           [
//             "TestT",
//             "TestT",
//             "TestT",
//             18,
//             "0x1635227c78be48e81921ce523e8bab47b6bfe41b",
//             "0x1635227c78be48e81921ce523e8bab47b6bfe41b",
//             "0x1635227c78be48e81921ce523e8bab47b6bfe41b",
//             "0x1635227c78be48e81921ce523e8bab47b6bfe41b",
//           ]
//         )
//         .slice(2),
//     });
//   }
// );

// console.log(
//   "equal",
//   web3.eth.abi
//     .encodeParameters(
//       [
//         "string",
//         "string",
//         "string",
//         "uint8",
//         "address",
//         "address",
//         "address",
//         "address",
//       ],
//       [
//         "TestT",
//         "TestT",
//         "TestT",
//         18,
//         "0x1635227c78be48e81921ce523e8bab47b6bfe41b",
//         "0x1635227c78be48e81921ce523e8bab47b6bfe41b",
//         "0x1635227c78be48e81921ce523e8bab47b6bfe41b",
//         "0x1635227c78be48e81921ce523e8bab47b6bfe41b",
//       ]
//     )
//     .slice(2) ===
//     web3.eth.abi
//       .encodeParameters(
//         [
//           "string",
//           "string",
//           "string",
//           "uint8",
//           "address",
//           "address",
//           "address",
//           "address",
//         ],
//         [
//           "TestT",
//           "TestT",
//           "TestT",
//           "18",
//           "0x1635227c78be48e81921ce523e8bab47b6bfe41b",
//           "0x1635227c78be48e81921ce523e8bab47b6bfe41b",
//           "0x1635227c78be48e81921ce523e8bab47b6bfe41b",
//           "0x1635227c78be48e81921ce523e8bab47b6bfe41b",
//         ]
//       )
//       .slice(2)
// ) ;

// const solc = require("solc");
// const resp = solc.compile(code).contracts[":FiatTokenV1"];
// console.log(
//   resp.bytecode,
//   web3.eth.abi
//     .encodeParameters(
//       [
//         "string",
//         "string",
//         "string",
//         "uint8",
//         "address",
//         "address",
//         "address",
//         "address",
//       ],
//       [
//         "TestRav",
//         "TestRav",
//         "TestRav",
//         "18",
//         "0x1635227c78be48e81921ce523e8bab47b6bfe41b",
//         "0x1635227c78be48e81921ce523e8bab47b6bfe41b",
//         "0x1635227c78be48e81921ce523e8bab47b6bfe41b",
//         "0x1635227c78be48e81921ce523e8bab47b6bfe41b",
//       ]
//     )
//     .slice(2)
// );

exports.VerifyContract = VerifyContract;
