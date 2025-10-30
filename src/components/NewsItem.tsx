
import { ethers , Wallet} from "ethers";
import React, { useState } from "react";
import { confidentialNewsTipContractAddress, faucetContractAddress} from "../constants/Addresses";

import FaucetArtifact from "../constants/Faucet.json";
import { decryptValue, initializeFheInstance } from '../lib/fhevm';

import { Heart, Eye, DollarSign, User, Check } from "lucide-react";
import { motion } from "framer-motion";

import ConfidentialNewsTip from "../constants/ConfidentialNewsTip.json"



// export type NewsItemType = { id: string; owner: string; // address or username title: string; description: string; likes: number; tips: string | number; // total tips (raw unit, e.g. wei or smallest unit) clearTips: number; // cleared tips count or amount myTip?: string | number; // how much the connected user tipped revealed?: boolean; // whether tip amounts are revealed };

// type Props = { news: NewsItemType; onLike?: (id: string) => Promise<void> | void; onShowMyTip?: (id: string) => Promise<void> | void; onRevealTip?: (id: string) => Promise<void> | void; /**

// Optional formatter for tip values. Example: (raw) => ethers.utils.formatEther(raw) + " ETH" */ formatTip?: (raw: string | number) => string; };


const short = (addr: string) => { if (!addr) return "-"; if (addr.length <= 12) return addr; return addr.slice(0, 6) + "..." + addr.slice(-4); };

export default function NewsItem({ news }) { 
    const [liked, setLiked] = useState(false); 
    const [likesCount, setLikesCount] = useState<number>(news.likes || 0); 
    const [tipsVisible, setTipsVisible] = useState<boolean>(false); 
    const [loadingAction, setLoadingAction] = useState<string | null>(null);

    const [revealedTips, setRevealedTips] = useState('');
    const [myTip, setMyTip] = useState('');
    const [likeStep, setLikeStep] = useState<'idle' | 'loading' | 'success'>('idle');
    const [showMyTipsStep, setShowMyTipsStep] = useState<'idle' | 'loading' | 'success'>('idle');
    const [tipCreatorStep, setTipCreatorStep] = useState<'idle' | 'loading' | 'success'>('idle');
    const [revealTipsStep, setRevealTipsStep] = useState<'idle' | 'loading' | 'success'>('idle');
    const [amount, setAmount] = useState('');

    const handleLike = async () => {
        const id = Number(news.id) + 1;
             try {
          setLikeStep("loading");
          
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(confidentialNewsTipContractAddress, ConfidentialNewsTip.abi, signer);
          
          const tx = await contract.likeAndDislikeNews(id); 
          const r = await tx.wait();
          console.log(`Transaction Response: ${r}`)
          
  
        } catch (error) {
          console.error('Error creating session:', error);
        } finally {
          setLikeStep("success");


        }
    }

    const handleTipCreator = async (amount) => {
        const id = Number(news.id) + 1;
        console.log({amount})
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log({accounts})
           try {
          setTipCreatorStep("loading");
          
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(confidentialNewsTipContractAddress, ConfidentialNewsTip.abi, signer);
          const faucetContract = new ethers.Contract(faucetContractAddress, FaucetArtifact.abi, signer);
           
          
          const fhe = await initializeFheInstance()
                        const inputHandle = fhe.createEncryptedInput(confidentialNewsTipContractAddress, accounts[0]);
                        inputHandle.add64(BigInt(ethers.parseUnits(String(amount), 6)));
                        const result = await inputHandle.encrypt();
        console.log({result});

        const endTime = Math.floor(Date.now() / 1000) + 1800;
        
          const setOperatorTx = await faucetContract.setOperator(confidentialNewsTipContractAddress, endTime);
          const re = await setOperatorTx.wait();
          console.log({re});
          const tx = await contract.tipCreator(id, result.handles[0], result.inputProof); 
          const r = await tx.wait();
          console.log(`Transaction Response: ${r}`)
          
  
        } catch (error) {
          console.error('Error creating session:', error);
        } finally {
          setTipCreatorStep("success");


        }
    }

    // const handleShowMyTip = async () => {
    //     const id = Number(news.id) + 1;
    

    //                  try {
    //       setShowMyTipsStep("loading");
          
    //       const provider = new ethers.BrowserProvider(window.ethereum);
    //       const signer = await provider.getSigner();
    //       const contract = new ethers.Contract(confidentialNewsTipContractAddress, ConfidentialNewsTip.abi, provider);
          
    //       const myTip = await contract.getUserTips(id); 
    //       const news = await contract.getNews(id);
    //       console.log({news, myTip})
    //       const tip = await decryptValue(myTip, confidentialNewsTipContractAddress, signer);
    //       console.log({tip});
    //       setMyTip(String(tip));

          
  
    //     } catch (error) {
    //       console.error('Error creating session:', error);
    //     } finally {
    //       setShowMyTipsStep("success");


    //     }
    // }

    const handleRevealTip = async () => {
        console.log("hello")
        if(tipsVisible) {
            setTipsVisible(false);
            return;
        }

        try {

            setRevealTipsStep("loading");
            const id = Number(news.id) + 1;
         const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();

          const contractS = new ethers.Contract(confidentialNewsTipContractAddress, ConfidentialNewsTip.abi, signer);
          const decryptedTipTx = await contractS.decryptTips(id)
          await decryptedTipTx.wait()


        const contract = new ethers.Contract(confidentialNewsTipContractAddress, ConfidentialNewsTip.abi, provider);
         const revealedTips = await contract.getNews(id)
         console.log({revealedTips})
         console.log({revealedTips: String(revealedTips[5])})

        } catch(err) {
            console.error('Error creating session:', err);
        } finally {
            setTipsVisible(true);
          setRevealTipsStep("success");

        }
        
    }


return ( 
<motion.article 
initial={{ opacity: 0, y: 6 }} 
animate={{ opacity: 1, y: 0 }} 
transition={{ duration: 0.18 }} 
className="w-full bg-white/80 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"> 
<div className="flex gap-4"> 
    <div className="flex-shrink-0"> 
        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold"> {news.owner ? news.owner.slice(2, 4).toUpperCase() : "N"} 
    </div>
    </div>

<div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
            {news.title}
          </h3>

          <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <User size={14} />
              <span className="font-mono">{short(news.owner)}</span>
            </span>

            <span className="flex items-center gap-1">
              <Check size={14} />
              <span>{news.clearTips ?? 0} CNF</span>
            </span>

            <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">#{news.id+1}</span>
          </div>
        </div>

        <div className="text-right text-xl">
            {/* <div className="text-black">My tips</div>
          <div className="mt-0.5 font-medium text-slate-800 dark:text-slate-100">
           {myTip || 0}
          </div> */}
          {/* <div className="text-black">Revealed tips</div> */}
          {/* <div className="mt-0.5 font-medium text-slate-800 dark:text-slate-100"> */}
           {/* {revealedTips || 0} */}
          {/* </div> */}
            
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed break-words">
        {news.description}
      </p>

      <div className="mt-4">
        {tipsVisible ? (
          <div className="rounded-md border border-slate-100 dark:border-slate-800 p-3 text-sm bg-slate-50/60 dark:bg-slate-900/30">
            <div className="flex items-center gap-3">
              <DollarSign size={18} />
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Total (revealed)</div>
                <div className="font-medium text-black">{news.clearTips} CNF</div>
              </div>
            </div>
            
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-slate-500">Tips are hidden. Reveal to see breakdown.</div>
            <div className="text-xs text-slate-400">(creator must reveal)</div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={handleLike}
          disabled={!!loadingAction}
          aria-pressed={liked}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-transparent bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-900/10 dark:text-rose-300 transition"
        >
          <Heart size={16} />
          <span className="text-sm">
             {likeStep === "idle" && "Like"}
             {likeStep === "loading" && "Liking..."}
             {likeStep === "success" && "Liked"}

          </span>
          <span className="ml-2 text-xs text-slate-500">{likesCount}</span>
        </button>

<input 
        type="text"
        className="text-black"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
         />

        <button
          onClick={() => handleTipCreator(amount)}
          disabled={!!loadingAction}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-full border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
        >
          <DollarSign size={16} />
          <span className="text-sm">
             {tipCreatorStep === "idle" && "Tip News Creator"}
             {tipCreatorStep === "loading" && "Tipping Creator..."}
             {tipCreatorStep === "success" && "Tipped"}
            </span>
        </button>
        

        {/* <button
          onClick={handleShowMyTip}
          disabled={!!loadingAction}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-full border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
        >
          <DollarSign size={16} />
          <span className="text-sm">Show my tip</span>
        </button> */}


        <button
          onClick={handleRevealTip}
          className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 transition"
        >
          <Eye size={16} />
          <span className="text-sm">
             {revealTipsStep === "idle" && "Reveal Tip"}
             {revealTipsStep === "loading" && "Revealing Tip..."}
             {revealTipsStep === "success" && "Revealed tip"}
            </span>
        </button>
      </div>
    </div>
  </div>
</motion.article>

); }

