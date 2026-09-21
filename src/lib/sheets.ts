
import { google } from 'googleapis';

export async function appendToSheet(spreadsheetId: string, range: string, values: any[][]) {
  // Use a simple token lookup from localStorage for now
  const accessToken = localStorage.getItem('foco_em_dados_google_token');
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
