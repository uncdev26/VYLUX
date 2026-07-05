// Custom fetch for supabase-js → PostgREST direct connection
// supabase-js sends to {URL}/rest/v1/{table}, PostgREST expects {URL}/{table}
// This strips the /rest/v1/ prefix before the request reaches PostgREST

export function createPostgrestFetch(baseFetch: typeof fetch = globalThis.fetch): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let url: string;
    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof URL) {
      url = input.toString();
    } else if (input instanceof Request) {
      url = input.url;
    } else {
      url = String(input);
    }

    // Strip /rest/v1/ prefix — PostgREST serves at root
    url = url.replace('/rest/v1/', '/');

    if (typeof input === 'string' || input instanceof URL) {
      return baseFetch(url, init);
    }
    // Reconstruct Request with new URL
    return baseFetch(new Request(url, input as RequestInit), init);
  };
}
