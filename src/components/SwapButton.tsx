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

  const handleAddLiquidity = async () => {
    setIsProcessing(true);
    try {
      const tokenAmount = parseUnits("0.0001", 18);
      const wethAmount = parseUnits("0.0001", 18);
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
          // 2 - WETH approval
          {
            to: WETH_ADDRESS,
            functionName: "approve",
            args: [ROUTER_ADDRESS, wethAmount],
            account: agwClient.account.address,
            data: encodeFunctionData({
              abi: erc20Abi,
              functionName: "approve",
              args: [ROUTER_ADDRESS, wethAmount],
            }),
            value: 0n,
          },
          // 3 - Add liquidity
          {
            to: ROUTER_ADDRESS,
            functionName: "addLiquidity",
            args: [
              TOKEN_ADDRESS,
              WETH_ADDRESS,
              tokenAmount,
              wethAmount,
              0n,
              0n,
              agwClient.account.address,
              deadline,
            ],
            account: agwClient.account.address,
            data: encodeFunctionData({
              abi: routerAbi,
              functionName: "addLiquidity",
              args: [
                TOKEN_ADDRESS,
                WETH_ADDRESS,
                tokenAmount,
                wethAmount,
                0n,
                0n,
                agwClient.account.address,
                deadline,
              ],
            }),
            value: 0n,
          },
        ],
      });
      console.log("Batch transaction hash:", batchTx);
      console.log("All transactions completed successfully!");
    } catch (error) {
      console.error("Transaction failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleAddLiquidity}
        disabled={isProcessing}
        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded transition-colors duration-200 disabled:opacity-50"
      >
        {isProcessing ? "Processing..." : "Add Liquidity"}
      </button>
    </div>
  );
};

export default SwapButton;
