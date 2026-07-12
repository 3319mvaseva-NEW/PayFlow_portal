import { supabase } from './supabase.js';

const authState = {
  ready: false,
  session: null,
  user: null,
};

const listeners = new Set();

function emitAuthState() {
  for (const listener of listeners) {
    listener({ ...authState });
  }
}

function setAuthState(nextState) {
  authState.ready = nextState.ready;
  authState.session = nextState.session;
  authState.user = nextState.user;
  emitAuthState();
}

function requireSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase client is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.');
  }

  return supabase;
}

export function getAuthState() {
  return { ...authState };
}

export function subscribeToAuthState(listener) {
  listeners.add(listener);
  listener({ ...authState });

  return () => listeners.delete(listener);
}

export async function initializeAuthState() {
  const client = requireSupabaseClient();
  const {
    data: { session },
  } = await client.auth.getSession();

  setAuthState({
    ready: true,
    session,
    user: session?.user ?? null,
  });

  client.auth.onAuthStateChange((_event, nextSession) => {
    setAuthState({
      ready: true,
      session: nextSession,
      user: nextSession?.user ?? null,
    });
  });
}

export async function signInWithEmailAndPassword(email, password) {
  const client = requireSupabaseClient();
  return client.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmailAndPassword(email, password) {
  const client = requireSupabaseClient();

  return client.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/login`,
    },
  });
}

export async function signOutUser() {
  const client = requireSupabaseClient();
  return client.auth.signOut();
}
