import { encodeFunctionData, parseUnits } from "viem";
import { AbstractClient } from "@abstract-foundation/agw-client";
import { erc20Abi, routerAbi } from "@/const/abi";
import { useState, useEffect } from "react";

// Constants for the addresses
const ROUTER_ADDRESS = "0x07551c0Daf6fCD9bc2A398357E5C92C139724Ef3";
const TOKEN_ADDRESS = "0xdDD0Fb7535A71CD50E4B8735C0c620D6D85d80d5"; // MyToken
const WETH_ADDRESS = "0x9EDCde0257F2386Ce177C3a7FCdd97787F0D841d"; // Abstract WETH

interface SwapButtonProps {
  agwClient: AbstractClient;
}

const SwapButton = ({ agwClient }: SwapButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputAmount, setInputAmount] = useState<string>("");
  const [outputAmount, setOutputAmount] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");

  // Calculate output amount with artificial delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!inputAmount || isNaN(Number(inputAmount))) {
        setOutputAmount("");
        return;
      }
      const conversionRate = 0.49924887330996; // MTK to WETH rate
      setOutputAmount((Number(inputAmount) * conversionRate).toFixed(18));
    }, 500); // 500ms delay

    return () => clearTimeout(timer); // Cleanup timeout on input change
  }, [inputAmount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputAmount(e.target.value);
  };

  const handleSwap = async () => {
    if (!inputAmount) return;
    setIsProcessing(true);
    setTxHash("");
    try {
      const tokenAmount = parseUnits(inputAmount, 18);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);

      console.log("Sending batch transaction...");

      const batchTx = await agwClient.sendTransactionBatch({
        calls: [
          // 1 - MyToken approval
          {
            to: TOKEN_ADDRESS,
            functionName: "approve",
            args: [ROUTER_ADDRESS, tokenAmount],
            account: agwClient.account.address,
            data: encodeFunctionData({
              abi: erc20Abi,
              functionName: "approve",
              args: [ROUTER_ADDRESS, tokenAmount],
            }),
            value: 0n,
          },

          // 2 - Swap exact tokens for ETH
          {
            to: ROUTER_ADDRESS,
            functionName: "swapExactTokensForETH",
            args: [
              tokenAmount,
              0n,
              [TOKEN_ADDRESS, WETH_ADDRESS],
              agwClient.account.address,
              deadline,
            ],
            account: agwClient.account.address,
            data: encodeFunctionData({
              abi: routerAbi,
              functionName: "swapExactTokensForETH",
              args: [
                tokenAmount,
                0n,
                [TOKEN_ADDRESS, WETH_ADDRESS],
                agwClient.account.address,
                deadline,
              ],
            }),
            value: 0n,
          },
        ],
      });
      console.log("Batch transaction hash:", batchTx);
      setTxHash(batchTx);
    } catch (error) {
      console.error("Transaction failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-gray-900 rounded-2xl p-4 w-full max-w-md">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between bg-gray-800 rounded-xl p-3">
          <input
            type="number"
            placeholder="0"
            value={inputAmount}
            onChange={handleInputChange}
            className="bg-transparent text-white text-2xl w-full outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <div className="text-white font-medium">MTK</div>
        </div>
      </div>

      {/* Swap Arrow */}
      <div className="flex justify-center -my-2">
        <div className="bg-gray-800 p-2 rounded-full">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4L12 20M12 20L18 14M12 20L6 14"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between bg-gray-800 rounded-xl p-3">
          <input
            type="number"
            placeholder="0"
            value={outputAmount}
            readOnly
            className="bg-transparent text-white text-2xl w-full outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <div className="text-white font-medium">ETH</div>
        </div>
      </div>

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        disabled={isProcessing}
        className="w-full bg-[#00ff00]/20 hover:bg-[#00ff00]/30 text-[#00ff00] font-medium py-4 px-4 rounded-xl transition-colors duration-200 disabled:opacity-50 mt-2 backdrop-blur-sm border border-[#00ff00]/20"
      >
        {isProcessing ? "Processing..." : "Trade tokens"}
      </button>

      {txHash && (
        <a
          href={`https://explorer.testnet.abs.xyz/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#00ff00] text-sm text-center hover:underline mt-2"
        >
          View transaction on explorer
        </a>
      )}
    </div>
  );
};

export default SwapButton;
