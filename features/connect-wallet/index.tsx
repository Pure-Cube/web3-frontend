import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import {
  ProviderNotFoundError,
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
} from "wagmi";
import { injected } from "wagmi/connectors";
import { Button } from "shared/ui";
import Swal from "sweetalert2";
import walletStore from "entities/wallet/model"; // Import MobX store
import { formatEther } from "viem";

export interface ConnectWalletProps {
  children: string;
  type: string;
}

export const ConnectWallet = observer(
  ({ children, type }: ConnectWalletProps) => {
    // Wagmi hooks
    const { connect, error: connectError } = useConnect();
    const { disconnect } = useDisconnect();
    const { address, isConnected } = useAccount();
    const { data: balanceData, error: balanceError } = useBalance({
      address: address,
    });

    // Connect MetaMask wallet
    const connectMetaMask = async () => {
      await connect({ connector: injected() });
    };

    // Disconnect wallet
    const disconnectWallet = async () => {
      disconnect();
      walletStore.reset(); // Reset the wallet data in MobX store
      Swal.fire({
        icon: "info",
        title: "Wallet disconnected.",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    };

    // Update MobX store when account or balance changes
    useEffect(() => {
      if (isConnected && address) {
        walletStore.setAccount(address);
        Swal.fire({
          icon: "success",
          title: "Successfully connected to MetaMask!",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      }
    }, [address, isConnected]);

    useEffect(() => {
      if (balanceData) {
        walletStore.setBalance(formatEther(balanceData.value)); // Use formatEther instead of formatted
      }
    }, [balanceData]);

    // Handle connection errors
    useEffect(() => {
      if (connectError) {
        if (connectError instanceof ProviderNotFoundError) {
          console.log("MetaMask is not installed!");
          Swal.fire({
            icon: "error",
            title: "MetaMask is not installed!",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error connecting to MetaMask!",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });
        }
      }
    }, [connectError]);

    // Handle balance errors
    useEffect(() => {
      if (balanceError) {
        console.error("Balance fetch error:", balanceError);
        Swal.fire({
          icon: "error",
          title: "Error fetching balance!",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      }
    }, [balanceError]);

    return (
      <div>
        {type === "profile" ? (
          walletStore.account ? (
            <div className="text-center">
              <div className="text-white text-lg">
                Account: {walletStore.account}
              </div>
              <div className="text-white text-base">
                Balance: {walletStore.balance} ETH
              </div>
              <button
                onClick={disconnectWallet}
                className="mt-2 bg-red-500 text-white py-1 px-3 rounded-full"
              >
                Disconnect Wallet
              </button>
            </div>
          ) : (
            <div
              className="flex justify-center items-center text-2xl rounded-full bg-neutral-700 w-12 h-12"
              onClick={connectMetaMask}
            >
              +
            </div>
          )
        ) : walletStore.account ? (
          <Button onClick={disconnectWallet}>Disconnect Wallet</Button>
        ) : (
          <Button onClick={connectMetaMask}>{children}</Button>
        )}
      </div>
    );
  }
);
