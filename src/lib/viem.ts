import { Account, Address, createPublicClient, createWalletClient, http } from "viem";
import { abstractTestnet } from "viem/chains";
import { eip712WalletActions } from "viem/zksync";

export const publicClient = createPublicClient({
    chain: abstractTestnet,
    transport: http(),
});

export async function getWalletClient(account: Account | Address | undefined) {
    return createWalletClient({
        transport: http(),
        chain: abstractTestnet,
        account
    }).extend(eip712WalletActions())
}