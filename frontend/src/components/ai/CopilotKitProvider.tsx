'use client';

import React from 'react';
import { CopilotKit } from '@copilotkit/react-core/v2';
import '@copilotkit/react-core/v2/styles.css';

export const CopilotKitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <CopilotKit runtimeUrl="/copilotkit" useSingleEndpoint={false}>
      {children}
    </CopilotKit>
  );
};
