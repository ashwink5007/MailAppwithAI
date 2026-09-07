'use client';

import React from 'react';
import { CopilotKit } from '@copilotkit/react-core/v2';

/**
 * Wraps the application with the real CopilotKit context provider.
 *
 * This enables `useFrontendTool` (and other CopilotKit hooks) to register
 * tools that the CopilotKit agent can invoke. The runtime URL points to
 * the local Next.js API route that hosts the CopilotKit runtime.
 *
 * NOTE: The actual AI chat flow goes through AICopilotContext -> Spring Boot
 * -> Gemini. CopilotKit is used here for frontend tool registration and
 * the agentic tool UI layer.
 */
export const CopilotKitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <CopilotKit runtimeUrl="/copilotkit/api">
      {children}
    </CopilotKit>
  );
};
