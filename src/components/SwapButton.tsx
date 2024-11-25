import { encodeFunctionData, parseUnits } from "viem";
import { AbstractClient } from "@abstract-foundation/agw-client";
import { erc20Abi, routerAbi, wethAbi } from "@/const/abi";
import { useState } from "react";
import { publicClient } from "@/lib/viem";

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
      const tokenAmount = parseUnits("0.0001", 18); // Amount of MyToken
      const wethAmount = parseUnits("0.0001", 18); // Amount of WETH
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20); // 20 minutes

      console.log("1. Approving MyToken...");
      const approveMyToken = await agwClient.sendTransaction({
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
      });
      console.log("MyToken approval hash:", approveMyToken);

      console.log("2. Approving WETH...");
      const approveWeth = await agwClient.sendTransaction({
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
      });
      console.log("WETH approval hash:", approveWeth);

      console.log("3. Adding liquidity...");
      const addLiquidityTx = await agwClient.sendTransaction({
        to: ROUTER_ADDRESS,
        functionName: "addLiquidity",
        args: [
          TOKEN_ADDRESS,
          WETH_ADDRESS,
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
      });
      console.log("Add liquidity transaction hash:", addLiquidityTx);

      console.log("All transactions completed successfully!");
    } catch (error) {
      console.error("Transaction failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getWeth = async () => {
    try {
      console.log("Wrapping ETH to WETH...");
      const wrapEthTx = await agwClient.sendTransaction({
        to: WETH_ADDRESS,
        functionName: "deposit",
        account: agwClient.account.address,
        data: encodeFunctionData({
          abi: wethAbi,
          functionName: "deposit",
        }),
        value: parseUnits("0.0001", 18), // Sending 0.0001 ETH
      });
      console.log("Wrap ETH transaction hash:", wrapEthTx);

      // Check WETH balance after wrapping
      const wethBalance = await publicClient.readContract({
        address: WETH_ADDRESS,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [agwClient.account.address],
      });
      console.log("New WETH balance:", wethBalance);
    } catch (error) {
      console.error("Failed to get WETH:", error);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={getWeth}
        className="w-full bg-secondary hover:bg-secondary-dark text-white font-bold py-2 px-4 rounded transition-colors duration-200"
      >
        Get WETH (Test)
      </button>
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
