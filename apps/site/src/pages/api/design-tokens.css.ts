---
import type { APIRoute } from 'astro';
import { generateCSS } from '../../lib/design';

export const GET: APIRoute = async () => {
  try {
    const css = await generateCSS();

    return new Response(css, {
      status: 200,
      headers: {
        'Content-Type': 'text/css',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (err: any) {
    return new Response(`/* Error: ${err.message} */`, {
      status: 500,
      headers: { 'Content-Type': 'text/css' },
    });
  }
};
