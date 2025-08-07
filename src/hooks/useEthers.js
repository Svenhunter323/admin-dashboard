const { ethers } = require("ethers");

const LINK_TOKEN_ADDRESS = "0x779877A7B0D9E8603169DdbD7836e478b4624789"; // Sepolia
const VRF_CONSUMER_ADDRESS = "0x9da078c09a45704d3127a4d8ac9ef366a7da3440"; // Replace with your VRF consumer contract address
const erc20Abi = require("../abi/erc20.json"); // Adjust the path as

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL); // or WebSocketProvider
const linkContract = new ethers.Contract(LINK_TOKEN_ADDRESS, erc20Abi, provider);

async function getLinkBalance() {
  const balance = await linkContract.balanceOf(VRF_CONSUMER_ADDRESS);
  const decimals = await linkContract.decimals();
  const formatted = ethers.formatUnits(balance, decimals);
  console.log(`LINK Balance: ${formatted}`);
  return formatted;
}

module.exports = {
  getLinkBalance,
};
