"use client";

import Image from "next/image";
import { useLoginWithAbstract } from "@abstract-foundation/agw-react";
import { useAccount } from "wagmi";

export function LoginContainer() {
  const { login, logout } = useLoginWithAbstract();
  const { status } = useAccount();

  return status === "connecting" || status === "reconnecting" ? (
    <div
      id="loading-spinner-container"
      className="flex items-center justify-center w-10 h-10"
    >
      <div id="loading-spinner" className="animate-spin">
        <Image src="/abs.svg" alt="Loading" width={24} height={24} />
      </div>
    </div>
  ) : status === "connected" ? (
    <button
      onClick={() => logout()}
      className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center text-foreground gap-2 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 font-[family-name:var(--font-roobert)]"
    >
      Sign out
    </button>
  ) : (
    <button
      onClick={() => login()}
      className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] hover:text-white dark:hover:bg-[#e0e0e0] dark:hover:text-black text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 font-[family-name:var(--font-roobert)]"
    >
      <Image
        className="dark:invert"
        src="/abs.svg"
        alt="Abstract logomark"
        width={20}
        height={20}
        style={{ filter: "brightness(0)" }}
      />
      Sign in with Abstract
    </button>
  );
}
