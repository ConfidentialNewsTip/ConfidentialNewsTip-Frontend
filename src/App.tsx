import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { initializeFheInstance, publicDecrypt } from './lib/fhevm';

import './App.css';
import Form from './components/Form';

import ConfidentialNewsTip from "./constants/ConfidentialNewsTip.json"
import { confidentialNewsTipContractAddress} from "./constants/Addresses";
import Faucet from './components/Faucet';
import NewsItem from './components/NewsItem'

// Contract configuration
const CONTRACT_ADDRESSES = {
  11155111: '0xead137D42d2E6A6a30166EaEf97deBA1C3D1954e', // Sepolia
}

// Sepolia network configuration
const SEPOLIA_CONFIG = {
  chainId: '0xaa36a7', // 11155111 in hex
  chainName: 'Sepolia',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.infura.io/v3/'],
  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
}

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
      isConnected?: () => boolean;
    };
  }
}

function App() {
  const [account, setAccount] = useState<string>('');
  const [chainId, setChainId] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [fhevmStatus, setFhevmStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');


  const [formLoadingStep, setFormLoadingStep] = useState<'idle' | 'loading' | 'success'>('idle');
  const [showCreateModal, setShowCreateModal] = useState(false); 
  const [showFaucet, setShowFaucet] = useState(false); 
  const [showMainContent, setShowMainContent] = useState(false); 
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  
   

  const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || 'Not supported chain';

  // Network switching state
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);
  const [networkError, setNetworkError] = useState<string>('');


  const handleCreateNews = async (title, description) => {
    

      try {
          setFormLoadingStep("loading");
          
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(confidentialNewsTipContractAddress, ConfidentialNewsTip.abi, signer);
          
          const tx = await contract.postNews(title, description); 
          const r = await tx.wait();
          console.log(`Transaction Response: ${r}`)
          
  
        } catch (error) {
          console.error('Error creating session:', error);
        } finally {
          setFormLoadingStep("success");
          setShowCreateModal(false);

        }

  }


  // Initialize FHEVM
  const initializeFhevm = async () => {
    setFhevmStatus('loading');
    
    try {
      await initializeFheInstance();
      setFhevmStatus('ready');
      console.log('✅ FHEVM initialized for React!');
    } catch (error) {
      setFhevmStatus('error');
      console.error('FHEVM initialization failed:', error);
    }
  };

  // Switch network to Sepolia
  const switchNetworkToSepolia = async () => {
    if (!window.ethereum) {
      setNetworkError('No Ethereum provider found');
      return;
    }

    try {
      setIsSwitchingNetwork(true);
      setNetworkError('');
      setMessage('Switching to Sepolia network...');

      // Try to switch to Sepolia network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CONFIG.chainId }],
      });

      // Update chain ID after successful switch
      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(parseInt(chainIdHex, 16));
      setMessage('Successfully switched to Sepolia!');
      
      console.log('✅ Network switched to Sepolia');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Network switch failed:', error);
      
      // If the chain doesn't exist, try to add it
      if (error.code === 4902) {
        try {
          setMessage('Adding Sepolia network...');
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SEPOLIA_CONFIG],
          });
          
          // Update chain ID after adding
          const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
          setChainId(parseInt(chainIdHex, 16));
          setMessage('Sepolia network added and switched!');
          
          console.log('✅ Sepolia network added and switched');
          setTimeout(() => setMessage(''), 3000);
        } catch (addError) {
          console.error('Failed to add Sepolia network:', addError);
          setNetworkError('Failed to add Sepolia network. Please add it manually in your wallet.');
          setMessage('Failed to add Sepolia network');
        }
      } else {
        setNetworkError(`Failed to switch network: ${error.message || 'Unknown error'}`);
        setMessage('Failed to switch network');
      }
    } finally {
      setIsSwitchingNetwork(false);
    }
  };

  // Wallet connection
  const connectWallet = async () => {
    console.log('🔗 Attempting to connect wallet...');
    
    if (typeof window === 'undefined') {
      console.error('❌ Window is undefined - not in browser environment');
      return;
    }
    
    if (!window.ethereum) {
      console.error('❌ No Ethereum provider found. Please install MetaMask or connect a wallet.');
      alert('Please install MetaMask or connect a wallet to use this app.');
      return;
    }
    
    try {
      console.log('📱 Requesting accounts...');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('✅ Accounts received:', accounts);
      
      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('🔗 Chain ID:', chainIdHex);
      
      setAccount(accounts[0]);
      setChainId(parseInt(chainIdHex, 16));
      setIsConnected(true);
      
      console.log('✅ Wallet connected successfully!');
      
      // Initialize FHEVM after wallet connection
      await initializeFhevm();
    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
      alert(`Wallet connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };




  useEffect(() => {
    let mounted = true;
    async function fetchAll() {
      try {
        setShowMainContent(true);
        setLoading(true);

          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(confidentialNewsTipContractAddress, ConfidentialNewsTip.abi, provider);

        const countBN = await contract.newsLength();
        const count = Number(countBN.toString());
        if (count === 0) {
          setNews([]);
          return;
        }

        // fetch in parallel but be careful: too many parallel requests may hit provider limits.
        // For large counts, batch or page them (e.g., 50 at a time).
        // Array.from({ length: count }, (_, i) => i + 1)
        const indices = Array.from({length: count}, (_, i) => i);
        const calls = indices.map(i => contract.getNews(i+1));
        const results = await Promise.all(calls);


        const parsed = results.map((r, index) => ({
          id: index,
          owner: r[0],
          title: r[1],
          description: r[2],
          likes: String(r[3]),
          tips: r[4],
          clearTips: String(r[5]),
        }));
        console.log({parsed})

        if (mounted) setNews(parsed); // reverse to have newest first if that's desired
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchAll();
    return () => { mounted = false; };
  }, []);



  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Enhanced FHEVM Header */}
      <header className="bg-green-500 border-b-4 border-black shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#FFEB3B]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-black text-3xl font-bold tracking-tight">ConfidentialNewsTip</h1>

              </div>
            </div>
            
            <div className="flex items-center gap-3">


              

              {fhevmStatus === 'ready' ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <span className="status-badge bg-green-600 text-white">READY</span>
                </div>
              ) : fhevmStatus === 'error' ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <span className="status-badge bg-red-600 text-white">ERROR</span>
                </div>
              ) : fhevmStatus === 'loading' ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#FFEB3B] animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                  </div>
                  <span className="status-badge bg-black text-[#FFEB3B]">LOADING</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-500 rounded-full"></div>
                  <span className="status-badge bg-gray-500 text-white">IDLE</span>
                </div>
              )}
              

                {!isConnected ? (
                <button onClick={connectWallet} className="btn-primary">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  Connect
                </button>
              ) : (
                <button onClick={() => {
                  setAccount('');
                  setChainId(0);
                  setIsConnected(false);
                  setFhevmStatus('idle');
                  setMessage('');
                  setNetworkError('');
                  setIsSwitchingNetwork(false);
                }} className="btn-danger">
                  Disconnect
                </button>
              )}


            </div>
          </div>
        </div>
      </header>




          <div className="grid grid-cols-4 gap-4 mb-8">
              <button className='btn-primary text-sm' onClick={() => {setShowCreateModal(true); setShowFaucet(false); setShowMainContent(false)}}>Create News</button>
              <button className='btn-primary text-sm' onClick={() => {setShowCreateModal(false); setShowFaucet(false); setShowMainContent(true)}}>All News</button>
              <button className='btn-primary text-sm' onClick={() => {setShowFaucet(true); setShowCreateModal(false); setShowMainContent(false)}}>Get Faucet</button>
              
          </div>
         
      {/* Main Content */}

      <Form  
            formLoadingStep={formLoadingStep}
            setFormLoadingStep={setFormLoadingStep}
            showCreateModal={showCreateModal}
            setShowCreateModal={setShowCreateModal}
            handleCreateNews={handleCreateNews}
            setShowMainContent={setShowMainContent}
           />

           <div>
             {showFaucet && (<Faucet />)}
           </div>

      {showMainContent && (
              <div className="max-w-7xl mx-auto px-6 py-12">
 
        <div className="">

          

        </div>
        <div>

           
           

              <div>
                {
                  news?.map((n, index) => (
                    <NewsItem key={index} news={n} />
                  ))
                }
              </div>
          

          

        </div>
      </div>
      ) }


    </div>
  );
}

export default App;

