"use client";

import { StyledAppContainer } from "@/components/StyledAppContainer";
import { LoginContainer } from "@/components/LoginContainer";
import { useAbstractClient } from "@abstract-foundation/agw-react";
import SwapButton from "@/components/SwapButton";

export default function Home() {
  const { data: agwClient } = useAbstractClient();

  return (
    <StyledAppContainer>
      <main className="relative flex flex-col items-center justify-center z-10 text-white text-center">
        <div className="flex flex-col items-center gap-8">
          <LoginContainer />
          {agwClient && <SwapButton agwClient={agwClient} />}
        </div>
      </main>
    </StyledAppContainer>
  );
}
