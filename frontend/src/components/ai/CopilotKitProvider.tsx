'use client';

import React, { useRef } from 'react';
import { CopilotKitCoreReact, CopilotKitContext } from '@copilotkit/react-core/v2/context';

/**
 * Custom CopilotKit context provider that bypasses the CopilotKit component's
 * runtime agent discovery. The CopilotKit component calls useAgent() internally,
 * which requires a runtime with registered agents — but this app uses its own
 * AI pipeline (AICopilotContext → Spring Boot → Gemini).
 *
 * This provider creates a minimal CopilotKitCoreReact instance that allows
 * useFrontendTool hooks to register tools locally without a runtime connection.
 */
export const CopilotKitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const copilotkitRef = useRef<CopilotKitCoreReact | null>(null);

  if (copilotkitRef.current === null) {
    copilotkitRef.current = new CopilotKitCoreReact({});
  }

  const contextValue = React.useMemo(
    () => ({ copilotkit: copilotkitRef.current!, executingToolCallIds: new Set<string>() }),
    []
  );

  return (
    <CopilotKitContext.Provider value={contextValue}>
      {children}
    </CopilotKitContext.Provider>
  );
};
