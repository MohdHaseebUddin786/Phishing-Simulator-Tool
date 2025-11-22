import { createClient } from '@supabase/supabase-js';
import { DetectionType, ThreatLevel } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface DetectionRecord {
  content: string;
  detectionType: DetectionType;
  threatLevel: ThreatLevel;
  confidence: number;
  redFlags: string[];
  analysis: {
    spoofedSender?: boolean;
    suspiciousLinks?: string[];
    urgentLanguage?: boolean;
    socialEngineering?: boolean;
    misspelledDomains?: string[];
    attachmentRisk?: boolean;
  };
}

export const saveDetectionToDatabase = async (record: DetectionRecord) => {
  try {
    const { data, error } = await supabase
      .from('detections')
      .insert([
        {
          content: record.content,
          detection_type: record.detectionType,
          threat_level: record.threatLevel,
          confidence: record.confidence,
          red_flags: record.redFlags,
          analysis: record.analysis,
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('Error saving to database:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Database error:', error);
    return null;
  }
};

export const getDetectionHistory = async (limit: number = 50) => {
  try {
    const { data, error } = await supabase
      .from('detections')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Database error:', error);
    return [];
  }
};

export const getDetectionStats = async () => {
  try {
    const { data, error } = await supabase
      .from('detections')
      .select('threat_level, detection_type');

    if (error) {
      console.error('Error fetching stats:', error);
      return null;
    }

    const stats = {
      total: data?.length || 0,
      safe: data?.filter((d) => d.threat_level === 'safe').length || 0,
      suspicious: data?.filter((d) => d.threat_level === 'suspicious').length || 0,
      malicious: data?.filter((d) => d.threat_level === 'malicious').length || 0,
      byType: {
        url: data?.filter((d) => d.detection_type === 'url').length || 0,
        email: data?.filter((d) => d.detection_type === 'email').length || 0,
        sms: data?.filter((d) => d.detection_type === 'sms').length || 0,
        file: data?.filter((d) => d.detection_type === 'file').length || 0,
      },
    };

    return stats;
  } catch (error) {
    console.error('Database error:', error);
    return null;
  }
};
