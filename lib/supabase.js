import { createClient } from '@supabase/supabase-js'

let _client = null

function getClient() {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  }
  return _client
}

// Lazy proxy — Supabase client is only instantiated on first method call,
// so pages can be imported at build time without env vars present.
export const supabase = new Proxy(
  {},
  { get(_, prop) { return getClient()[prop] } }
)
