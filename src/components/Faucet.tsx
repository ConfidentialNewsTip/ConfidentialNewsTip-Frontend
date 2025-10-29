
import { ethers , Wallet} from "ethers";
import { useState } from "react"
import { faucetContractAddress } from "../constants/Addresses";
import FaucetArtifact from "../constants/Faucet.json";



const Faucet = () => {
    const [faucetRequestStep, setFaucetRequestStep] = useState<'idle' | 'loading' | 'success'>('idle');
    

    const handleRequestFaucet = async () => {
              try {
                  setFaucetRequestStep("loading");
                  
                  const provider = new ethers.BrowserProvider(window.ethereum);
                  const signer = await provider.getSigner();

                  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                  console.log(accounts[0])

                  const contract = new ethers.Contract(faucetContractAddress, FaucetArtifact.abi, signer);

                  const amount = ethers.parseUnits("100", 6);
                        

                 //    Perform the confidential transfer
                    const tx = await contract.airdrop(amount);
                  
                  const r = await tx.wait();
                  console.log(`Transaction Response: ${r}`)
                  
          
                } catch (error) {
                  console.error('Error creating session:', error);
                } finally {
                  setFaucetRequestStep("success");
        
                }
    }


    return (
        <div className="max-w-3xl mx-auto">


        <div className="bg-white p-6 rounded-2xl shadow-lg w-full">
    <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800">CNF Faucet</h2>
    
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-medium mb-1">
        Amount (CNF)
      </label>
      <input
        id="amount"
        type="text"
        value="100 CNF"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 focus:outline-none cursor-not-allowed"
      />
    </div>

    <button
      type="button"
      className="w-full btn-primary text-white py-2 rounded-lg font-medium"
      onClick={handleRequestFaucet}
    >
        {faucetRequestStep === 'idle' && "Request Faucet"}
        {faucetRequestStep === "loading" && "Requesting Faucet..."}
        {faucetRequestStep === "success" && "Request Faucet Success ✅"}
      
      
    </button>
  </div>
          </div>
    )
}
export default Faucet;

