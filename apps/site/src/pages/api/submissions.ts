---
import type { APIRoute } from 'astro';
import { db, submissions } from '../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { form_id, data, ip_address, user_agent } = body;

    if (!form_id || !data) {
      return new Response(
        JSON.stringify({ success: false, error: 'form_id and data are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const [submission] = await db.insert(submissions).values({
      formId: form_id,
      data,
      ipAddress: ip_address || null,
      userAgent: user_agent || null,
    }).returning();

    return new Response(
      JSON.stringify({ success: true, data: submission }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
