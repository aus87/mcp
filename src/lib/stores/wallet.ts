// src/lib/stores/wallet.ts
import { writable } from 'svelte/store';

export const account = writable<string | null>(null);
export const rdt = writable<any>(null);