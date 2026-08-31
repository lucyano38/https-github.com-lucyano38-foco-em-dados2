import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Lead } from '../types';

const LEADS_COLLECTION = 'crm_leads';

/**
 * Fetch all CRM leads from Firestore. If none exist yet, fallback to server API / localStorage.
 */
export async function fetchCrmLeadsFromFirestore(): Promise<Lead[]> {
  try {
    const colRef = collection(db, LEADS_COLLECTION);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      console.log('[Firebase] No leads found in Firestore, fetching from server API...');
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Seed Firestore with initial leads
          for (const lead of data) {
            if (lead.slug) {
              await setDoc(doc(db, LEADS_COLLECTION, lead.slug), {
                ...lead,
                updatedAt: Timestamp.now()
              });
            }
          }
          return data;
        }
      }
      return [];
    }

    const leads: Lead[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      // Remove Firestore internal Timestamp if needed, keep properties
      const { updatedAt, ...leadData } = data;
      leads.push(leadData as Lead);
    });

    return leads;
  } catch (err) {
    console.error('[Firebase] Error fetching leads from Firestore, falling back to API:', err);
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {}
    return [];
  }
}

/**
 * Save or update a CRM lead in Firestore and sync with server API.
 */
export async function saveCrmLeadToFirestore(lead: Lead): Promise<Lead> {
  const slug = lead.slug || `lead-${Date.now()}`;
  const payload = {
    ...lead,
    slug,
    atualizado: new Date().toISOString()
  };

  try {
    // 1. Save to Firestore
    const docRef = doc(db, LEADS_COLLECTION, slug);
    await setDoc(docRef, {
      ...payload,
      updatedAt: Timestamp.now()
    }, { merge: true });

    // 2. Sync to Server API for local file persistence as well
    await fetch(`/api/leads/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log(`[Firebase] Lead ${slug} successfully saved to Firestore & Server.`);
    return payload;
  } catch (err) {
    console.error('[Firebase] Error saving lead to Firestore:', err);
    // Fallback to server API only
    const res = await fetch(`/api/leads/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
    return payload;
  }
}

/**
 * Delete a CRM lead from Firestore and server API.
 */
export async function deleteCrmLeadFromFirestore(slug: string): Promise<void> {
  try {
    const docRef = doc(db, LEADS_COLLECTION, slug);
    await deleteDoc(docRef);

    await fetch(`/api/leads/${slug}`, {
      method: 'DELETE',
    });
    console.log(`[Firebase] Lead ${slug} deleted from Firestore & Server.`);
  } catch (err) {
    console.error('[Firebase] Error deleting lead from Firestore:', err);
    await fetch(`/api/leads/${slug}`, {
      method: 'DELETE',
    });
  }
}
