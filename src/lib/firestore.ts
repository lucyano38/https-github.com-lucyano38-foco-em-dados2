import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  Timestamp 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { AnalysisReport, Lead } from '../types';

// Initialize Firebase if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId || undefined);

const REPORTS_COLLECTION = 'analysis_reports';
const LEADS_COLLECTION = 'leads';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface SavedReport {
  id: string;
  report: AnalysisReport;
}

/**
 * Saves an AnalysisReport to Firebase Firestore (with fallback to localStorage).
 */
export async function saveReport(report: AnalysisReport): Promise<string> {
  const reportId = 'report_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

  const payload: AnalysisReport = {
    ...report,
    title: (report.title || 'Analysis Report').slice(0, 500),
    dataset_name: (report.dataset_name || 'Dataset').slice(0, 500),
    question: (report.question || '').slice(0, 5000),
    executive_summary: (report.executive_summary || '').slice(0, 5000),
    generated_at: (report.generated_at || new Date().toISOString()).slice(0, 128),
  };

  try {
    const docRef = doc(db, REPORTS_COLLECTION, reportId);
    await setDoc(docRef, {
      id: reportId,
      report: payload,
      updatedAt: Timestamp.now()
    });
    console.log(`[Firebase] Report ${reportId} successfully saved to Firestore.`);
    return reportId;
  } catch (err) {
    console.error('[Firebase] Error saving report to Firestore, falling back to localStorage:', err);
    try {
      const local = localStorage.getItem('saved_reports');
      const list = local ? JSON.parse(local) : [];
      list.push({ id: reportId, report: payload });
      localStorage.setItem('saved_reports', JSON.stringify(list));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
    return reportId;
  }
}

/**
 * Fetches all saved reports from Firebase Firestore (with fallback to localStorage).
 */
export async function getReports(): Promise<SavedReport[]> {
  try {
    const colRef = collection(db, REPORTS_COLLECTION);
    const snapshot = await getDocs(colRef);
    
    if (snapshot.empty) {
      const local = localStorage.getItem('saved_reports');
      if (local) {
        const list = JSON.parse(local);
        if (Array.isArray(list) && list.length > 0) {
          for (const item of list) {
            if (item.id && item.report) {
              await setDoc(doc(db, REPORTS_COLLECTION, item.id), {
                id: item.id,
                report: item.report,
                updatedAt: Timestamp.now()
              });
            }
          }
          return list.sort((a: SavedReport, b: SavedReport) => {
            const dateA = a.report.generated_at || '';
            const dateB = b.report.generated_at || '';
            return dateB.localeCompare(dateA);
          });
        }
      }
      return [];
    }

    const reports: SavedReport[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data && data.report) {
        reports.push({
          id: data.id || docSnap.id,
          report: data.report as AnalysisReport
        });
      }
    });

    return reports.sort((a, b) => {
      const dateA = a.report.generated_at || '';
      const dateB = b.report.generated_at || '';
      return dateB.localeCompare(dateA); // Descending
    });
  } catch (err) {
    console.error('[Firebase] Error fetching reports from Firestore, falling back to localStorage:', err);
    try {
      const local = localStorage.getItem('saved_reports');
      const list = local ? JSON.parse(local) : [];
      return list.sort((a: SavedReport, b: SavedReport) => {
        const dateA = a.report.generated_at || '';
        const dateB = b.report.generated_at || '';
        return dateB.localeCompare(dateA);
      });
    } catch (e) {
      return [];
    }
  }
}

/**
 * Deletes a saved report by ID from Firebase Firestore and localStorage.
 */
export async function deleteReport(reportId: string): Promise<void> {
  try {
    const docRef = doc(db, REPORTS_COLLECTION, reportId);
    await deleteDoc(docRef);
    console.log(`[Firebase] Report ${reportId} deleted from Firestore.`);
  } catch (err) {
    console.error('[Firebase] Error deleting report from Firestore:', err);
  }

  try {
    const local = localStorage.getItem('saved_reports');
    if (local) {
      const list = JSON.parse(local);
      const updated = list.filter((r: SavedReport) => r.id !== reportId);
      localStorage.setItem('saved_reports', JSON.stringify(updated));
    }
  } catch (e) {
    console.error('Error deleting from localStorage:', e);
  }
}

/**
 * Saves a lead to Firebase Firestore.
 */
export async function saveLead(lead: Lead): Promise<void> {
  try {
    const docRef = doc(db, LEADS_COLLECTION, lead.slug);
    await setDoc(docRef, { ...lead, updatedAt: Timestamp.now() });
    console.log(`[Firebase] Lead ${lead.slug} successfully saved to Firestore.`);
  } catch (err) {
    console.error('[Firebase] Error saving lead to Firestore:', err);
  }
}

/**
 * Fetches all leads from Firebase Firestore.
 */
export async function getLeads(): Promise<Lead[]> {
  try {
    const colRef = collection(db, LEADS_COLLECTION);
    const snapshot = await getDocs(colRef);
    const leads: Lead[] = [];
    snapshot.forEach((docSnap) => {
      leads.push(docSnap.data() as Lead);
    });
    return leads;
  } catch (err) {
    console.error('[Firebase] Error fetching leads from Firestore:', err);
    return [];
  }
}

/**
 * Deletes a lead by slug from Firebase Firestore.
 */
export async function deleteLead(slug: string): Promise<void> {
  try {
    const docRef = doc(db, LEADS_COLLECTION, slug);
    await deleteDoc(docRef);
    console.log(`[Firebase] Lead ${slug} deleted from Firestore.`);
  } catch (err) {
    console.error('[Firebase] Error deleting lead from Firestore:', err);
  }
}
