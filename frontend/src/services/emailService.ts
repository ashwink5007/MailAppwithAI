/**
 * Email API service.
 *
 * The ONLY module that knows about email-related API endpoints.
 * React components and contexts call these functions — never fetch() directly.
 *
 * Data flow:
 *   Component / Context → emailService → api (base client) → Spring Boot Backend
 *
 * Future: when Gmail is integrated, only the backend changes.
 * This service and the frontend types remain stable.
 */

import { api } from './api';
import { Email } from '../types/email';

/**
 * Fetch all emails (all folders combined).
 * Used by EmailContext to load the initial email list.
 */
export async function getAllEmails(): Promise<Email[]> {
  const response = await api.get<Email[]>('/api/emails');
  return response.data;
}

/**
 * Fetch inbox emails only.
 */
export async function getInboxEmails(): Promise<Email[]> {
  const response = await api.get<Email[]>('/api/emails/inbox');
  return response.data;
}

/**
 * Fetch sent emails only.
 */
export async function getSentEmails(): Promise<Email[]> {
  const response = await api.get<Email[]>('/api/emails/sent');
  return response.data;
}

/**
 * Fetch a single email by ID with full thread.
 */
export async function getEmailById(id: string): Promise<Email> {
  const response = await api.get<Email>(`/api/emails/${id}`);
  return response.data;
}

export interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
}

export async function sendEmail(request: SendEmailRequest): Promise<string> {
  const response = await api.post<string>('/api/emails/send', request);
  return response.data;
}

export async function sendReply(id: string, body: string): Promise<string> {
  const response = await api.post<string>(`/api/emails/${id}/reply`, { body });
  return response.data;
}

export async function markEmailAsRead(id: string): Promise<void> {
  await api.patch<void>(`/api/emails/${id}/read`, {});
}

export async function markEmailAsUnread(id: string): Promise<void> {
  await api.patch<void>(`/api/emails/${id}/unread`, {});
}

export async function toggleEmailStar(id: string): Promise<void> {
  await api.patch<void>(`/api/emails/${id}/star`, {});
}

export async function toggleEmailImportant(id: string): Promise<void> {
  await api.patch<void>(`/api/emails/${id}/important`, {});
}

export async function deleteEmail(id: string): Promise<void> {
  await api.delete<void>(`/api/emails/${id}`);
}

/**
 * Check if the backend is reachable.
 * Returns true if backend is up, false otherwise.
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    await api.get('/api/health');
    return true;
  } catch {
    return false;
  }
}
