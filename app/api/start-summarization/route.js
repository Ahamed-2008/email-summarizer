// app/api/start-summarization/route.js
import { NextResponse } from 'next/server';

/**
 * @param {import('next/server').NextRequest} request
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { accessToken } = body;

    console.log('Starting email summarization process...');

    // Step 1: Trigger Google Apps Script to fetch emails (optional)
    const emailsFetched = await triggerGoogleAppsScript(accessToken);
    console.log('Emails fetched:', emailsFetched);

    // Step 2: Wait a moment for webhook to process (noop if step 1 skipped)
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 3: Run summarization process
    const summaryResults = await runSummarization();
    console.log('Summarization completed:', summaryResults);

    // Step 4: Get the summarized emails from Airtable
    const summarizedEmails = await getSummarizedEmails();

    return NextResponse.json({
      success: true,
      message: 'Email summarization completed successfully',
      data: {
        emailsProcessed: emailsFetched.count || 0,
        summariesGenerated: summaryResults.count || 0,
        emails: summarizedEmails
      }
    });

  } catch (error) {
    console.error('Error in summarization process:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

// Function to trigger Google Apps Script
async function triggerGoogleAppsScript(accessToken) {
  const ENABLE_APPS_SCRIPT = (process.env.ENABLE_APPS_SCRIPT || 'false').toLowerCase() === 'true';
  const GOOGLE_APPS_SCRIPT_WEBAPP_URL = process.env.GOOGLE_APPS_SCRIPT_WEBAPP_URL || 'https://script.google.com/macros/s/AKfycby16vEOXsSC6RQBuYUv5B6dS74TE5htszyd2aODWpha/dev';

  // If disabled or not configured, skip this step gracefully
  if (!ENABLE_APPS_SCRIPT || !GOOGLE_APPS_SCRIPT_WEBAPP_URL) {
    return { success: true, count: 0, skipped: true };
  }

  // Call the web app URL directly (GET request)
  const response = await fetch(GOOGLE_APPS_SCRIPT_WEBAPP_URL, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '(could not read error body)');
    // Non-fatal: report and skip
    return { success: false, count: 0, skipped: true, error: `Google Apps Script Web App failed: ${response.status} - ${errorText}` };
  }

  let result;
  // Read response text once, then try to parse JSON to avoid double-reading the body
  const text = await response.text().catch(() => '');
  try {
    result = text ? JSON.parse(text) : null;
  } catch (e) {
    result = { message: 'No JSON response', raw: text };
  }

  return {
    success: true,
    data: result
  };
}

// Function to run the summarization process
async function runSummarization() {
  const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:5000';
  const base = WEBHOOK_URL.replace(/\/$/, '');

  // Try POST first
  let postRes;
  try {
    postRes = await fetch(`${base}/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    throw new Error(`Could not reach summarization service at ${base}. Is the Flask server running? (${err.message})`);
  }

  const postType = postRes.headers.get('content-type') || '';
  if (!postRes.ok && (postRes.status === 404 || postType.includes('text/html'))) {
    // Retry with GET (in case server expects GET or route registered only for GET)
    let getRes;
    try {
      getRes = await fetch(`${base}/summarize`, { method: 'GET', cache: 'no-store' });
    } catch (err) {
      throw new Error(`Could not reach summarization service (GET) at ${base}. Is the Flask server running? (${err.message})`);
    }
    const getType = getRes.headers.get('content-type') || '';
    if (!getRes.ok || getType.includes('text/html')) {
      const body = await getRes.text().catch(() => '');
      throw new Error(`Summarization endpoint not reachable at ${base}/summarize. Status: ${getRes.status}. Body: ${body}`);
    }
    return await getRes.json();
  }

  if (!postRes.ok) {
    const errorText = await postRes.text().catch(() => `(could not read error body)`);
    throw new Error(`Summarization service failed: ${postRes.status} ${errorText}`);
  }

  return await postRes.json();
}

// Function to get summarized emails from Airtable
async function getSummarizedEmails() {
  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;
  const TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'AutomationData';
  
  // If Airtable creds are missing, return an empty list gracefully
  if (!AIRTABLE_API_KEY || !BASE_ID) {
    return [];
  }

  const encodedTable = encodeURIComponent(TABLE_NAME);
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodedTable}?maxRecords=20`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
    }
  });

  if (!response.ok) {
    let errorDetails = '';
    try {
      errorDetails = await response.text();
    } catch (e) {
      errorDetails = '(could not read error body)';
    }
    console.error('Airtable fetch failed:', response.status, errorDetails);
    throw new Error(`Airtable fetch failed: ${response.status} ${errorDetails}`);
  }

  const data = await response.json();
  
  const emails = data.records.map(record => ({
    id: record.id,
    subject: record.fields.Subject || 'No Subject',
    from: record.fields.From || 'Unknown Sender',
    source: record.fields.Source || 'Email',
    snippet: record.fields['Snippet/Text'] || '',
    summary: record.fields.Summary || 'Processing...',
    created: record.createdTime
  }));

  return emails;
}