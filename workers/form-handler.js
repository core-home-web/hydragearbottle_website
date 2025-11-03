/**
 * Hydragear Form Handler - Cloudflare Worker
 * 
 * This worker handles form submissions from the Hydragear website.
 * It sends data to both email (via FormSubmit) and Airtable database.
 * 
 * Environment Variables Required:
 * - EMAIL_RECIPIENT: Email address to receive form submissions (e.g., corehomeweb2@gmail.com)
 * - AIRTABLE_API_KEY: Airtable Personal Access Token
 * - AIRTABLE_BASE_ID: Airtable Base ID (e.g., appLh4lmU0rn22CNi)
 * 
 * Deployed at: https://hydragear-form-handler.cold-hat-c35d.workers.dev/
 * 
 * To Update:
 * 1. Edit this file
 * 2. Copy the entire code
 * 3. Go to Cloudflare Dashboard → Workers & Pages → hydragear-form-handler
 * 4. Click "Edit code"
 * 5. Paste and click "Save and Deploy"
 */

export default {
  async fetch(request, env) {
    // Handle CORS for form submissions
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      // Parse form data
      const formData = await request.formData();
      const data = Object.fromEntries(formData);
      
      console.log('Form data received:', data);

      // Send to FormSubmit (email)
      const emailResponse = await fetch(`https://formsubmit.co/${env.EMAIL_RECIPIENT}`, {
        method: 'POST',
        body: formData,
      });
      
      console.log('Email sent, status:', emailResponse.status);

      // Send to Airtable (optional - only if configured)
      if (env.AIRTABLE_API_KEY && env.AIRTABLE_BASE_ID) {
        console.log('Airtable configured, attempting to send...');
        
        const airtableData = {
          fields: {
            'Full Name': data.name || '',
            'Email Address': data.email || '',
            'Message': data.message || '',
            'Submission Date': new Date().toISOString().split('T')[0]
          }
        };
        
        console.log('Sending to Airtable:', JSON.stringify(airtableData, null, 2));

        const airtableResponse = await fetch(`https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/Contacts`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(airtableData)
        });
        
        const airtableResult = await airtableResponse.json();
        
        if (!airtableResponse.ok) {
          console.error('Airtable error:', airtableResponse.status, JSON.stringify(airtableResult));
        } else {
          console.log('Airtable success:', JSON.stringify(airtableResult));
        }
      } else {
        console.log('Airtable not configured (missing API key or Base ID)');
      }

      // Return success
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });

    } catch (error) {
      console.error('Worker error:', error.message, error.stack);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }
};

