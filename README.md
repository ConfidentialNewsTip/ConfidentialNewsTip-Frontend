## ConfidentialNewsTip

A privacy-preserving decentralized news platform built on Fully Homomorphic Encryption (FHE), allowing users to post news, like posts, and send confidential encrypted tips to creators.

This contract uses Zama’s FHEVM to ensure that all tipping transactions remain fully encrypted on-chain — meaning no one (not even the contract owner) can view the actual tip amounts unless decrypted with the correct proof.

### Features

Post News: Users can share stories with a title and description.

Like And Unlike: Toggle between liking and unliking any post.

Confidential Tipping: Send encrypted tips to news creators using FHE.

Decrypt Tips: News creators can request decryption of total received tips.

Faucet Integration: All tipping operations interact with the Faucet contract for token transfers.

### Smart Contract Overview
#### Contract: ConfidentialNewsTip

Inherits from: SepoliaConfig


This project relies on:
```
@fhevm/solidity
SepoliaConfig
```

Make sure to install dependencies before running:
```
npm install
```

🧠 Example Usage

Post a news item
```
confidentialNewsTip.postNews("Breaking News", "Ethereum just hit a new milestone!");
```


Like or unlike a post
```
confidentialNewsTip.likeAndDislikeNews(1);
```

Tip the creator confidentially
```
confidentialNewsTip.tipCreator(1, encryptedAmount, proof);
```

Decrypt total tips
```
confidentialNewsTip.decryptTips(1);
```

📄 License

This project is licensed under the MIT License.
