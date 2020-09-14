# Chainlink Oracle Stub

Basic contracts required to create an oracle for chainlink services. Need to run a chainlink node in order to consume the incoming request & fulfill them.

## Test

Oracle.sol is the primary smart contract. An audit result file has also been added.
In order to test run the following commands:

1. `npm i`
2. `truffle test`

## About Setup

1. First step is to deploy the required contracts like Oracle, Pointer, Link token.
2. By following the instructions from [chainlink doc](https://docs.chain.link/docs/node-operator-overview) run a local chainlink node with PostgreSQL db.
3. Give the address of chainlink node required permissions in the oracle.
4. In order to fulfill custom requests, run an application which listens for incoming traffic at a specific port. 
5. Create a bridge to this application from the chainlink node dashboard & generate custom jobs using the generated bridge as a task.
6. Fund the chainlink node address with XDC so the node address can fulfill the custom requests.

## Deployed At

### Apothem

1. Oracle Address - [xdc5ee4ba477eb7a034426de7daea41410880c84d69](https://explorer.apothem.network/addr/xdc5ee4ba477eb7a034426de7daea41410880c84d69)
2. Link Token Address - [xdc8d2e1dff891a93e342de290f0c8196570c3931fd](https://explorer.apothem.network/addr/xdc8d2e1dff891a93e342de290f0c8196570c3931fd)
3. Owner address - [xdc7d831bc9b77d1d5f60e68dcc174f313f575ca1c4](https://explorer.apothem.network/addr/xdc7d831bc9b77d1d5f60e68dcc174f313f575ca1c4)
4. Node Operator Address ( Simple ) - [xdce98f83692FDbD667c348f17AfBb1357E6D281B17](https://explorer.apothem.network/addr/xdce98f83692fdbd667c348f17afbb1357e6d281b17)
5. Pointer Address - [xdc6ed3cdeea5849c534fda3c7a1dfef817204c11e2](https://explorer.apothem.network/addr/xdc6ed3cdeea5849c534fda3c7a1dfef817204c11e2)
6. TestClient - [xdcefd88962be8a0451e07d44b9eb36d6116cc20c2e](https://explorer.apothem.network/addr/xdcefd88962be8a0451e07d44b9eb36d6116cc20c2e)

### XinFin Mainnet

1. Oracle Address - xdc1cda61c1c068810e981d524f08fc8c2fa0ec13d8
2. Link Token Address - xdc9eea5486b95ef892194cf37bb3c0d0836743e2e8
3. Owner address - xdc7d831bc9b77d1d5f60e68dcc174f313f575ca1c4
4. Node Operator Address - xdccfFed1fF4AB8423f68820B8E61fc655B230dE467
5. Pointer Address - xdc9e82dad9a71b5efa9d3ed1963b4ad26e2961126d
6. TestClient - xdc9e82dad9a71b5efa9d3ed1963b4ad26e2961126d

### Rinkeby Testnet

1. Oracle Address - 0x9839588E37F373F9AB5148DE5117E717b2C3C0b9
2. Link Token Address - 0x01be23585060835e02b77ef475b0cc51aa1e0709
3. Owner address - 0xc90CEE7AADdbf29AB90EE6baB561f55c17a876f0
4. Node Operator Address - 0x6E4dFbC660f6E3D96aDE1091E5F78805856DA5Ad
5. TestClient - 0xD0886Fd1c49a6616E6EE4dCd10A1e339B55c951F


### Usage Flow

1. A user, who wants to use services provided by the chainlink node identified by the job-id, will first have to deploy a client contract similar to [TestClient](https://explorer.apothem.network/addr/xdcefd88962be8a0451e07d44b9eb36d6116cc20c2e).
2. The client contract's function needs to build a chainlink request with arguements of jobid and oracle address.
  Here the oracle address is the address of the oracle which provides the services & jobid is the identification of the process/service that the oracle provides.
3. The client contract needs to have some minimum amount of LINK token ( as per the charge of oracle ) 
4. On submitting this chainlink request, the result will be passed as an arguement to the fulfill function specified while building the chainlink request when the operation completes.

## TODO

 - [ ] add more tests