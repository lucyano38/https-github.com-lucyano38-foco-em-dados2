
import { google } from 'googleapis';
import { getAccessToken } from './auth';

export async function appendToSheet(spreadsheetId: string, range: string, values: any[][]) {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error('Not authenticated');

  const sheets = google.sheets({ version: 'v4' });
  
  // Use authorization header directly for now as per instructions
  // Alternatively, use google.auth.OAuth2
  
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=RAW`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: values,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to append to sheet');
  }

  return response.json();
}
