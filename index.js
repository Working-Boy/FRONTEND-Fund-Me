import { ethers } from "./ethers-5.2.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");



withdrawButton.onclick = withdraw;
balanceButton.onclick = getBalance;
connectButton.onclick = connect;
fundButton.onclick = fund; // Ensures no event object gets passed


async function connect() {
  if (typeof window.ethereum !== "undefined") {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    connectButton.innerHTML = "Connected!";
  } else {
    connectButton.innerHTML = "Please install metamask!";
  }
}


async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance))
  }
}

async function fund() {
  
  const ethAmount = document.getElementById("ethAmount").value;
  console.log(`Funding with ${ethAmount} ETH...`, "info");
  

  if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try {
        const transactionResponse = await contract.fund({
          value: ethers.utils.parseEther(ethAmount) // Ensure ethAmount is correctly passed
        });
        await listenForTransactionMine(transactionResponse, provider);

      } catch (error) {
          console.log(error);
      }
      

    }

}

async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    console.log("Withdrawing...");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.log(error);
    }

  }
}


function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}....`);
    return new Promise((resolve, reject) => {
      provider.once(transactionResponse.hash, (transactionReceipt) => {
        console.log(
          `Completed with ${transactionReceipt.confirmations} confirmations`
        )
        resolve();
      })
    })

}

// This function would be called after successful wallet connection
function walletConnected() {
  connectButton.classList.add('connected');
  connectButton.textContent = 'Connected';
  connectButton.disabled = true;
}

// Example of how you might use it (adapt to your actual connection code):
connectButton.addEventListener('click', async () => {
  try {
      // Your wallet connection logic here...
      // After successful connection:
      walletConnected();
  } catch (error) {
      console.error(error);
  }
});
