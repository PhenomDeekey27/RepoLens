import { AIProvider, AICompletionRequest, AICompletionResponse } from '../providers/base';
import {
  createProviderInstance,
  ProviderName,
  isProviderConfigured,
} from '../providers/registry';
import { getTaskModelChain, getTestFailProvider, TaskModelEntry } from '../config';

export interface RunRequest {
  task: string;
  messages: AICompletionRequest['messages'];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: AICompletionRequest['responseFormat'];
}

export interface RunResponse extends AICompletionResponse {
  fallbackCount: number;
  attemptedProviders: Array<{ provider: ProviderName; model: string; error?: string }>;
}

type ErrorCategory =
  | 'auth'
  | 'rate_limit'
  | 'timeout'
  | 'server_error'
  | 'capacity'
  | 'invalid_request'
  | 'context_too_large'
  | 'network'
  | 'unknown';

function classifyError(error: Error): ErrorCategory {
  const msg = error.message.toLowerCase();

  if (msg.includes('401') || msg.includes('403') || msg.includes('unauthorized') || msg.includes('authentication') || msg.includes('invalid api key')) {
    return 'auth';
  }
  if (msg.includes('429') || msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'rate_limit';
  }
  if (msg.includes('timeout') || msg.includes('timed out')) {
    return 'timeout';
  }
  if (msg.includes('500') || msg.includes('502') || msg.includes('503') || msg.includes('504') || msg.includes('internal server error') || msg.includes('bad gateway') || msg.includes('service unavailable')) {
    return 'server_error';
  }
  if (msg.includes('capacity') || msg.includes('overloaded') || msg.includes('quota')) {
    return 'capacity';
  }
  if (msg.includes('400') || msg.includes('bad request') || msg.includes('invalid') || msg.includes('malformed')) {
    return 'invalid_request';
  }
  if (msg.includes('context') && (msg.includes('too long') || msg.includes('exceed') || msg.includes('limit'))) {
    return 'context_too_large';
  }
  if (msg.includes('econnrefused') || msg.includes('enotfound') || msg.includes('fetch failed') || msg.includes('network')) {
    return 'network';
  }
  return 'unknown';
}

function isFallbackWorthy(category: ErrorCategory): boolean {
  return ['rate_limit', 'timeout', 'server_error', 'capacity', 'network'].includes(category);
}

function isTestFailure(providerName: ProviderName, error: Error): boolean {
  const testFail = getTestFailProvider();
  if (!testFail) return false;
  return providerName === testFail && error.message.includes('[TEST_INJECT]');
}

function logAttempt(
  task: string,
  provider: ProviderName,
  model: string,
  success: boolean,
  duration: number,
  error?: string,
  fallbackCount?: number
) {
  const status = success ? 'SUCCESS' : 'FAILED';
  const fallbackInfo = fallbackCount !== undefined ? ` [fallback #${fallbackCount}]` : '';
  console.log(
    `[model-router] ${status} | task=${task} | provider=${provider} | model=${model} | ${duration}ms${fallbackInfo}${error ? ` | error=${error}` : ''}`
  );
}

const providerInstances = new Map<string, AIProvider>();

function getOrCreateProvider(entry: TaskModelEntry): AIProvider {
  const key = `${entry.provider}:${entry.model}`;
  if (!providerInstances.has(key)) {
    providerInstances.set(key, createProviderInstance(entry.provider));
  }
  return providerInstances.get(key)!;
}

export async function runWithFallback(request: RunRequest): Promise<RunResponse> {
  const chain = getTaskModelChain(request.task);
  const attempted: RunResponse['attemptedProviders'] = [];
  let fallbackCount = 0;
  let lastError = new Error('All providers in fallback chain failed');

  for (const entry of chain) {
    if (!isProviderConfigured(entry.provider)) {
      console.log(`[model-router] Skipping unconfigured provider: ${entry.provider} for task: ${request.task}`);
      continue;
    }

    const provider = getOrCreateProvider(entry);
    const startTime = Date.now();

    try {
      console.log(
        `[model-router] Attempt ${fallbackCount + 1}: ${entry.provider}/${entry.model} for task: ${request.task}`
      );

      const completion = await provider.generate({
        messages: request.messages,
        model: entry.model,
        temperature: request.temperature,
        maxTokens: request.maxTokens,
        responseFormat: request.responseFormat,
      });

      const duration = Date.now() - startTime;
      logAttempt(request.task, entry.provider, entry.model, true, duration, undefined, fallbackCount);

      return {
        ...completion,
        fallbackCount,
        attemptedProviders: [...attempted, { provider: entry.provider, model: entry.model }],
      };
    } catch (err) {
      const duration = Date.now() - startTime;
      const error = err instanceof Error ? err : new Error(String(err));
      const category = classifyError(error);
      const errorMsg = `${category}: ${error.message.slice(0, 200)}`;

      logAttempt(request.task, entry.provider, entry.model, false, duration, errorMsg, fallbackCount);
      attempted.push({ provider: entry.provider, model: entry.model, error: errorMsg });

      if (isTestFailure(entry.provider, error)) {
        console.log(`[model-router] Test-injected failure for ${entry.provider} — continuing fallback`);
        fallbackCount++;
        lastError = error;
        continue;
      }

      if (category === 'auth') {
        console.error(
          `[model-router] Authentication error with ${entry.provider} — this is NOT a fallback-worthy error. Throwing immediately.`
        );
        throw new Error(
          `Authentication failed with ${entry.provider}: ${error.message.slice(0, 500)}. ` +
          `Check that ${entry.provider.toUpperCase()}_API_KEY is set correctly.`
        );
      }

      if (category === 'invalid_request') {
        console.error(
          `[model-router] Invalid request error with ${entry.provider} — NOT fallback-worthy.`
        );
        throw new Error(
          `Invalid request to ${entry.provider}: ${error.message.slice(0, 500)}`
        );
      }

      if (!isFallbackWorthy(category)) {
        console.warn(
          `[model-router] Non-fallback-worthy error (${category}) from ${entry.provider}. Attempting fallback anyway.`
        );
      }

      fallbackCount++;
      lastError = error;
    }
  }

  throw lastError;
}

export function getModels(): string[] {
  const chain = getTaskModelChain('relevant_file_discovery');
  return chain.map((e) => `${e.provider}/${e.model}`);
}
