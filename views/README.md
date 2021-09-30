[![Build Status](https://badgen.net/badge/Product-Status/Live/blue)](https://github.com/XinFinOrg/MyContract/blob/master/README.md)
[![Stage](https://badgen.net/badge/Product-Stage/Beta/green)](https://github.com/XinFinOrg/MyContract)
[![License](https://badgen.net/badge/License/ApacheV2.0/grey)](https://github.com/XinFinOrg/MyContract/blob/master/LICENSE)

# Introduction Summary

<p align="center">
<img src="https://user-images.githubusercontent.com/35517875/51681029-6b63ae00-2009-11e9-9188-fee8e6a06f44.png" alt="51681029-6b63ae00-2009-11e9-9188-fee8e6a06f44.png">
</p>

MyContract.co a WebApp that allows users to create smart contracts for issuing tokens to crowdsale or asset tokenization without a need for any programming expertise, just in a few clicks. MyContract.co initially allows contract creation on Ethereum public blockchain with any of the ERC standards for issuing or tokenizing an array of asset classes: fungible cryptocurrencies and tradable assets (ERC 20 and ERC 223), non-fungible assets (ERC 721), or fixed income financial instruments (ERC 888).

# Table of Content
- [Current Problem Statement](#current-problem-statement)
- [Light Paper](#light-paper)
    - About Smart Contracts & Token Systems
    - About ERC20 & Features
    - About ERC223 & Features
    - About Tokenization Platform & Features
- [How is Mycontract Useful](#how-is-mycontract-useful)
    - Advantages of Tokenization using Mycontract.co
    - Industrial Use Cases
- [What you can build on Mycontract.co](#what-you-can-build-on-mycontractco)
    -  Smart Contracts
    -  Crowdsale Contract
    -  Automatic Contract Deployment
    -  Contract Interaction
    -  Tokenization Platform
    -  Currency Support
- [How it works](#how-it-works)
- [FAQs](#faqs)
- [Technical Overview](#technical-overview)
- [Whitelable Smart Contract and Tokenization](#how-can-you-do-whitelable-setup-for-reselling-smart-contracts--tokenization-platform-without-coding-knowledge)
- [Want a Customised Solution on Mycontract.co?](#want-a-customised-solution-on-mycontractco)
- [How to Contribute?](#how-to-contribute)
- [Where can you get more help?](#where-can-you-get-more-help)
- [Terms & Condition for Commercial usage](#terms--condition-for-commercial-usage)
    



# Current Problem Statement

Tokenization on Blockchain is a steady trend for coming years. It seems that everything is being tokenized on Blockchain from paintings, diamonds and company stocks to real estate. But the main problem stems from the fact that so far no country has a solid regulation for cryptocurrency. For example, what happens if a company that handles tokenization sells the property? Token owners just own tokens. They have no legal rights on the property and thus are not protected by the law. Therefore, legal changes are needed to accommodate these new business models.

Problem is that this system brings us back some sort of centralization. The whole idea of Blockchain and especially smart contracts is to create a trustless environment. While this is possible to achieve when tokenizing digital assets, with real world, physical assets, this is not the case. Therefore, we have to accept a certain dose of centralization. 

Smart contracts, token issuing, Commodities tokenization, Currencies  tokenization, Exclusive Goods Tokenization, Private Shares Tokenisation and ICOs are some of the major services that XinFin has been providing their clients for quite some time and subsequently occupies significant working time of the company. This results in developers working on repetitive tasks, where this effort could be better invested. As a result, the company felt a dire need to automate this process. By exercising the technical assets within XinFin it developed an in-house solution that enables their clients to easily and quickly service these needs themselves, with no coding required.

# Light Paper

***About Smart Contracts & Token Systems***

Early work on smart contracts has been done by Szabo [1997] and Miller [1997]. Around the 1990s it became clear that algorithmic enforcement of agreements could become a significant force in human cooperation. Though no specific system was proposed to implement such a system, it was proposed that the future of law would be heavily affected by such systems. In this light, Mycontract by using Ethereum & EOS may be seen as a general implementation of such a crypto-law system. 

Mycontract.co creates a Smart contracts, which are cryptographic "boxes" that contain value and only unlock it if certain conditions are met, can also be built on top of the Ethereum/EOS platform, with vastly more power than that offered by Bitcoin scripting because of the added powers of Turing-completeness, value-awareness, blockchain-awareness and state.

On-blockchain token systems have many applications ranging from sub-currencies representing assets such as USD or gold to company stocks, individual tokens representing smart property, secure unforgeable coupons, and even token systems with no ties to conventional value at all, used as point systems for incentivization. Token systems are surprisingly easy to implement in Ethereum/EOS. The key point to understand is that a currency, or token system, fundamentally is a database with one operation: subtract X units from A and give X units to B, with the provision that (1) A had at least X units before the transaction and (2) the transaction is approved by A. All that it takes to implement a token system is to implement this logic into a contract.

The basic code for implementing a token system in Serpent looks as follows:


```
def send(to, value):
    if self.storage[msg.sender] >= value:
        self.storage[msg.sender] = self.storage[msg.sender] - value
        self.storage[to] = self.storage[to] + value
```

This is essentially a literal implementation of the "banking system" state transition function described further above in this document. A few extra lines of code need to be added to provide for the initial step of distributing the currency units in the first place and a few other edge cases, and ideally a function would be added to let other contracts query for the balance of an address.

***About ERC20 & Features***

ERC-20 is the universal language that all tokens on the Ethereum network use. It allows one token to be traded with another. Smart contracts are written in the programming language “Solidity” on the basis of If-This-Then-That (IFTTT) logic. The ERC-20 token has the following method-related functions on mycontract.co:

SafeMath - This prevents unsigned integer overflow issue.

OpenZeppelin - OpenZeppelin is a library for secure smart contract development. It provides implementations of standards like ERC20 and ERC721 which you can deploy as-is or extend to suit your needs, as well as Solidity components to build custom contracts and more complex decentralized systems.

SafeERC20 - The library SafeERC20 is to safely interact with a third party token. for eg. token.safeTransfer(...), etc.

SignerRole - This is used to put check on who can make modification on contract.

MinterRole - This is used to put check on who can mint new tokens on contract.

PauserRole - This is used to put check on who can put stop to all contract functions.

UpgradeAgent - This address can upgrade contract.

Burnable - This is used to burn tokens to reduce the supply for their project or burn unsold tokens.

Capped - This is used to keep cap value on how much one can mint new tokens.

Child Contract - This implementation is used to create contract from deployed contract.
```
syntax:
 pragma solidity ^0.4.25;

contract Child {
   string public a;
   constructor (string arg) public payable { 
       a = arg;
   }
}
contract Factory {
    constructor () public {}
    function createChild(string arg) public payable {
        address issueContract = (new Child).value(msg.value)(arg);
    }
}

```

Super Transfer - The super keyword in Solidity gives access to the immediate parent contract from which the current contract is derived. When having a contract A with a function f() that derives from B which also has a function f(), A overrides the f of B. That means that myInstanceOfA.f() will call the version of f that is implemented inside A itself, the original version implemented inside B is not visible anymore. The original function f from B (being A's parent) is thus available inside A via super.f(). Alternatively, one can explicitly specifying the parent of which one wants to call the overridden function because multiple overriding steps are possible.

```
syntax :
pragma solidity ^0.4.5;

contract C {
  uint u;
  function f() {
    u = 1;
  }
}

contract B is C {
  function f() {
    u = 2;
  }
}

contract A is B {
  function f() {  // will set u to 3
    u = 3;
  }
  function f1() { // will set u to 2
    super.f();
  }
  function f2() { // will set u to 2
    B.f();
  }
  function f3() { // will set u to 1
    C.f();
  }
}

```

***About ERC223 & Features***

If you send 100 ETH to a contract that is not intended to work with Ether, then it will reject a transaction and nothing bad will happen. If you will send 100 ERC20 tokens to a contract that is not intended to work with ERC20 tokens, then it will not reject tokens because it can't recognize an incoming transaction. As the result, your tokens will get stuck at the contracts balance. If the address is contract or not is checked by assembly method in solidity.

```
syntax:
function isContract(address _addr) private returns (bool isContract){
  uint32 size;
  assembly {
    size := extcodesize(_addr)
  }
  return (size > 0);
}

```

When transfer function is called first it checks for "is address is contract or not" Invokes the `tokenFallback` function if the recipient is a contract. The token transfer fails if the recipient is a contract but does not implement the `tokenFallback` function or the fallback function to receive funds.  Also with transfer function we can send data in bytes that can call the relevant function from the receiver contract.

```
syntax
 function transfer(address _to, uint _value, bytes _data) {
        // Standard function transfer similar to ERC20 transfer with no _data .
        // Added due to backwards compatibility reasons .
        uint codeLength;

        assembly {
            // Retrieve the size of the code on target address, this needs assembly .
            codeLength := extcodesize(_to)
        }

        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
        if(codeLength>0) {
            ERC223ReceivingContract receiver = ERC223ReceivingContract(_to);
            receiver.tokenFallback(msg.sender, _value, _data);
        }
        emit Transfer(msg.sender, _to, _value, _data);
    }

```

***About Tokenization Platform & Features***

* Mycontract.co provides contract creation and deployment as well as tokenization platform where user can create smartcontract for Initial token offering and deploy it in easy steps and start Initial token offering by doing KYC in very convenient manner.
* Tokenization platform accepts ETHER and BITCOIN as contribution method.
* Admin dashboard will be provided where user can access all the data as well as accounts.
* KYC and AML services are provided by default for Initial token offering in tokenization platform.
* User will be provided with individual account for ETHER and BTC as well as Token for contribution as well as withdrawal.
* Initial token offering platform will be provided with various theme options as well as custom platform logo.
* Full custom platform services provided as a addon.

# How is Mycontract Useful

Smart Contract and Tokenization is a method to convert rights to an asset into a digital token. By Tokenizing assets, we have a digital representation of a real-world asset on a blockchain. The advocates of the new “Tokenized” economy claim that slicing and dicing assets into fractions of ownership on a blockchain will enhance liquidity, price discovery and accessibility to high value illiquid assets at a fraction of current transaction costs.

With liquidity, investors have the flexibility to sell private securities for an efficient market price, increasing marketability and unlocking greater potential asset value for issuers. There are many asset categories that can benefit, Mycontract.co can be as Tokenization platform provider to such industries and asset categories.

The primary objective of Mycontract.co is to provide Token-as-a-Service (TAAS) which will eventually result in greater liquidity, real-time market pricing, cost savings, and transparency.

**Advantages of Tokenization using Mycontract.co**

* Unlock Liquidity of your physical asset or business
* Enforce compliance on secondary trades
* Attract New Investors
* Lower investment minimums by unbundling
* Create new fund types by rebundling
* Reach global investors
* Faster, Easier, Low-Cost Capital Formation
* Tokenize individual assets
* Enforce regulations through technology
* Maintain accurate records

**Industrial Use Cases** : Any Industries can use the platform and bring the asset to tokenization world.

# What you can build on Mycontract.co

**Smart Contracts :**  
* ERC20 - used for token Smart Contracts 
* ERC223 - Provides extra safety during token transfers 
* ERC 721 - Asset Tokenisation, STO

**Crowdsale Contract :** 
This is a Audited smart contract with additional features for eg, Bonus rates, Send tokens to Investor etc.

**Automatic Contract Deployment :**
Automatic & Manual Deployment with various ways to access wallets.

**Contract Interaction :**
This Features can enable easy smart contract interaction with built in interaction platform.

**Tokenization Platform :**
This platform provides convenient way to conduct initial coin offering with admin dashboard for KYC and AML support.

**Currency Support :**
Ethereum and Bitcoin Support, Top 10 Cryptocurrency Support in near future and Secured Gateway for Keystore handling & withdrawal.

# How it works
![image](https://raw.githubusercontent.com/XinFinOrg/MyContract/master/public/video1.gif)

Watch the Demo Here : [https://www.youtube.com/watch?v=thR-pTpF7Sw](https://www.youtube.com/watch?v=thR-pTpF7Sw)

# FAQs 
[Click here to know more about platforms as well as FAQ's](https://medium.com/xinfin/https-medium-com-xinfin-xinfin-launches-mycontract-technical-aspects-part-1-9c3604a4b6df)

# Technical Overview

Mycontract.co an open source platform for Smart Contract Generation, Deployment, Interaction and Tokenization Platform is build on below mentioned technologies:

* Express Framework of Node.js for backend support.
* EJS(Embedded JavaScript templates) templating engine with HTML, CSS, Javascript/Jquery for Front end. 
* PostgreSQL for database.
* Web3.js is used for blockchain interactions.

All files structures as per the standard the code Node.js Express framework.


# How can you do Whitelable Setup for reselling Smart Contracts & Tokenization Platform without Coding Knowledge?

1. [Go to mycontract admin page for signup or login](http://api.mycontract.co:3002) 
2. Fill in the details and hit the signup button. 
3. Verification mail will be send to your registerd email address, please verify your account by clicking the link provided inside the mail.
4. This will redirect you to admin login page once account is verified.
5. Next step is to complete the KYC by uploading the KYC relevent data as well as company name and company logo in PNG format in the KYC tab that you can find on dashboard.
6. KYC verification will be done in a day.
7. Once the KYC is completed & accpeted by Mycontract you can buy admin package by contributing 10,000,000 XDCE.
8. Next step is to send 10,000,000 XDCE to wallet address that has be provided my platform. you can find that address in payment tab.
9. In case you don't have XDCE then you can use Bancor tab or  [AlphaEx](https://alphaex.net) or any other XDCE provider to buy XDCE and transfer to platform wallet.
10. Once you have 10,000,000 XDCE in your platform wallet you can buy admin package in payment tab by clicking on Buy Package and it will prompt for OTP that will be send to your registerd email address.
11. Upon complition of payment you will find client registration link in 'Client Registration tab', use that link for client registation.

# Want a Customised Solution on Mycontract.co?

**API Link : http://api.mycontract.co/#introduction  

# How to Contribute?
    
MyContract.co invites Community Contribution for development of various usecase library for Bond Creation, real estate tokenization and Security token creation as per local law etc. Feel free to add usecase library. 

* Fork Repository (https://github.com/XinFinOrg/MyContract/fork)
* Create your feature branch (git checkout -b feature/fooBar)
* Commit your changes (git commit -am 'Add some fooBar')
* Push to the branch (git push origin feature/fooBar)
* Create a new Pull Request

# Where can you get more help?

Please note that this is an issue tracker reserved for bug reports and feature requests on Github Mycontract.co Repo. For general questions please use XinFin Public Slack Channel https://xinfin-public.slack.com/

**System information** 
Version: Windows/Linux/OSX 

**Expected behaviour**

**Actual behaviour**

**Steps to reproduce the behaviour**

**Backtrace**

# Terms & Condition for Commercial usage

Copyright 2019, My Contract. https://www.mycontract.co

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. 

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

Please refer to License associated to Mycontract.co : https://github.com/XinFinOrg/MyContract/blob/master/LICENSE
