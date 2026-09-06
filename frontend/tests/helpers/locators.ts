import { Page } from '@playwright/test';

/** Layout mounts desktop + mobile copies; target only the visible one. */
export const onScreen = (page: Page) => ({
  composeButton: page.getByRole('button', { name: 'Compose', exact: true }).filter({ visible: true }),
  folder: (name: string) => page.getByRole('button', { name, exact: true }).filter({ visible: true }),
  label: (name: string) => page.getByRole('button', { name, exact: true }).filter({ visible: true }),
  copilotInput: page.getByPlaceholder('Ask Copilot or type a command...').filter({ visible: true }),
  copilotSend: page.getByTitle('Send prompt').filter({ visible: true }),
  prompt: (name: string) => page.getByRole('button', { name, exact: true }).filter({ visible: true }),
  mailboxHeading: (name: string | RegExp) => page.getByRole('heading', { name }).filter({ visible: true }),
  emailSubject: (name: string) => page.getByText(name, { exact: true }).filter({ visible: true }),
});
