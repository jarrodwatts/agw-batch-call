import { encodeFunctionData, parseUnits } from "viem";
import { AbstractClient } from "@abstract-foundation/agw-client";
import { erc20Abi, routerAbi } from "@/const/abi";
import { useState } from "react";

// Constants for the addresses
const ROUTER_ADDRESS = "0x07551c0Daf6fCD9bc2A398357E5C92C139724Ef3";
const TOKEN_ADDRESS = "0xdDD0Fb7535A71CD50E4B8735C0c620D6D85d80d5"; // MyToken
const WETH_ADDRESS = "0x9EDCde0257F2386Ce177C3a7FCdd97787F0D841d"; // Abstract WETH

interface SwapButtonProps {
  agwClient: AbstractClient;
}

const SwapButton = ({ agwClient }: SwapButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSwap = async () => {
    setIsProcessing(true);
    try {
      const tokenAmount = parseUnits("0.0001", 18);
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
              0n, // Accept any amount of ETH (min amount out)
              [TOKEN_ADDRESS, WETH_ADDRESS], // Path: MyToken -> WETH
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
    } catch (error) {
      console.error("Transaction failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleSwap}
        disabled={isProcessing}
        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded transition-colors duration-200 disabled:opacity-50"
      >
        {isProcessing ? "Processing..." : "Swap Tokens"}
      </button>
    </div>
  );
};

export default SwapButton;
