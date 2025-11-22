/*
  # PhishGuard AI Detection History Schema

  ## Overview
  This migration creates the infrastructure for storing phishing detection results,
  enabling historical tracking and analytics for the PhishGuard AI platform.

  ## New Tables

  ### `detections`
  Main table for storing all phishing detection analysis results.

  **Columns:**
  - `id` (uuid, primary key) - Unique identifier for each detection record
  - `content` (text) - The content that was analyzed (URL, email text, SMS text, or file name)
  - `detection_type` (text) - Type of content analyzed: 'url', 'email', 'sms', or 'file'
  - `threat_level` (text) - Detection result: 'safe', 'suspicious', or 'malicious'
  - `confidence` (integer) - Confidence score of the detection (0-100)
  - `red_flags` (jsonb) - Array of identified red flags and suspicious indicators
  - `analysis` (jsonb) - Detailed analysis object containing:
    - spoofedSender: boolean indicating sender spoofing
    - suspiciousLinks: array of suspicious URLs found
    - urgentLanguage: boolean for pressure tactics detection
    - socialEngineering: boolean for manipulation attempts
    - misspelledDomains: array of typosquatted domains
    - attachmentRisk: boolean for dangerous attachments
  - `created_at` (timestamptz) - Timestamp when the detection was performed

  ## Security

  ### Row Level Security (RLS)
  - RLS is enabled on the `detections` table
  - Public read access is granted for viewing detection history
  - Public insert access is granted for saving new detections
  - This allows the application to function without authentication while maintaining data integrity

  ## Indexes
  - Primary key index on `id` for fast lookups
  - Index on `created_at` for efficient time-based queries
  - Index on `threat_level` for filtering by threat severity
  - Index on `detection_type` for filtering by content type

  ## Notes
  - All detection records are stored for analytics and improvement of the ML model
  - The `content` field stores sensitive data and should be handled carefully in production
  - JSON fields allow flexible storage of complex analysis results
  - Timestamps use timezone-aware format for accurate global tracking
*/

CREATE TABLE IF NOT EXISTS detections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  detection_type text NOT NULL CHECK (detection_type IN ('url', 'email', 'sms', 'file')),
  threat_level text NOT NULL CHECK (threat_level IN ('safe', 'suspicious', 'malicious')),
  confidence integer NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  red_flags jsonb DEFAULT '[]'::jsonb,
  analysis jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_detections_created_at ON detections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_detections_threat_level ON detections(threat_level);
CREATE INDEX IF NOT EXISTS idx_detections_detection_type ON detections(detection_type);

ALTER TABLE detections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to detections"
  ON detections
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert access to detections"
  ON detections
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
