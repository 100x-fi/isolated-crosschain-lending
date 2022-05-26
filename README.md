# Isolated Market Cross-chain Lending

⚠️ **Notice**
- This code is currently not audited and not yet testing properly
- use or extend it at your own risk!

# Isolated cross-chain lending utilizing LayerZero functionalities

<img width="660" alt="image" src="https://user-images.githubusercontent.com/97577998/170431789-c814f7c8-1148-417e-b802-ed171fdbfcdc.png">


**IMPORTANT CONTRACTS**
- **Market** (Market.sol): 
  - Market is the only contact point between protocol and users (to deposit, withdraw, borrow, repaying assets)
  - `market.sol` is designed to deployed on 2 chains and set to be paired with one another (like mirror)
  - All markets located in the same chain may share the same cashier to share liquidity over market, but not sharing any accounting. In the figure above, BNBCHAIN-BUSD:ETHCHAIN-ETH (2rd row) and BNBCHAIN-BUSD:ETHCHAIN-USDC (3rd row) together share BUSD in BNBCHAIN cashier
  - User can collateralize assets on one chain (BNB chain) in order to borrow assets out from another paired chain (Ethereum chain)
  - While the assets is being borrowed, the collateral will be locked at certain amount based on the `collateral factor` of the collateral and how much user borrowed out on the other side
  - After user done using borrowed assets, user can then repay the borrowed assets (debt) back to the protocol on Ethereum chain and unlock the locked collateral back on the original chain, BNB chain
- **Cashier** (Cashier.sol): 
  - The place where ERC20 assets actually stored, each chain is designed to have only one cashier, shared among markets
  - Assembling assets in a single vault as `cashier` will remediate illiquidity problem of isolated market where assets were stored on each isolated market
- **Offchain-oracle** (OffChainOracle.sol): 
  - simple price oracle to feed price of any available assets to the markets
- **SimpleToken** (SimpleToken.sol): 
  - a typical ERC20 token 

