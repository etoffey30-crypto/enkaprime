/*
  # Services Advisory Columns & Default Seed Data
  Migration 004: Add rich consulting fields and arrays for Services.
  
  Run this in the Supabase SQL Editor to support the Services Manager CMS tab.
*/

-- ─── 1. EXTEND SERVICES TABLE WITH CONSULTING FIELDS ───
ALTER TABLE services ADD COLUMN IF NOT EXISTS tagline text NOT NULL DEFAULT '';
ALTER TABLE services ADD COLUMN IF NOT EXISTS components text[] NOT NULL DEFAULT '{}';
ALTER TABLE services ADD COLUMN IF NOT EXISTS pain_points text[] NOT NULL DEFAULT '{}';
ALTER TABLE services ADD COLUMN IF NOT EXISTS solutions text[] NOT NULL DEFAULT '{}';
ALTER TABLE services ADD COLUMN IF NOT EXISTS benefits text[] NOT NULL DEFAULT '{}';

-- ─── 2. SEED DIRECT DEFAULT DATA FOR THE 4 PILLARS ───
INSERT INTO services (code, title, description, tagline, image_url, sort_order, is_active, components, pain_points, solutions, benefits)
VALUES
  (
    'records',
    'Records Digitalisation & Document Management Systems',
    'Transform paper-based records into structured, searchable digital systems that improve efficiency, accessibility and audit readiness.',
    'Turning paper trails into structured, searchable digital intelligence.',
    'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg',
    1,
    true,
    ARRAY[
      'Records audit and classification framework',
      'Digital scanning and metadata tagging of physical records',
      'Document Management System (DMS) design and implementation',
      'Workflow automation for document routing and approvals',
      'Access control and permission-based document security',
      'Retention schedule development and archiving policies',
      'Staff training on DMS usage and document protocols'
    ],
    ARRAY[
      'Thousands of physical files with no systematic organisation',
      'Wasted hours searching for contracts, reports, or financial records',
      'Lost or misplaced documents creating compliance and audit risks',
      'No version control — staff working from outdated documents',
      'Remote teams unable to access records quickly or securely',
      'No retention policy — accumulation of irrelevant or obsolete files'
    ],
    ARRAY[
      'Conduct a full records audit to classify, prioritise and categorise all documents',
      'Design a structured folder taxonomy aligned with your organisational functions',
      'Implement a cloud-based or on-premise DMS tailored to your infrastructure',
      'Configure automated workflows for approvals, reviews and retention triggers',
      'Establish role-based access to protect sensitive information',
      'Develop a records management policy and train staff on adoption'
    ],
    ARRAY[
      'Instant document retrieval — reducing search time by up to 80%',
      'Full audit trail with version history and access logs',
      'Improved compliance readiness for regulatory inspections',
      'Secure remote access for distributed teams',
      'Reduced storage costs by eliminating duplicate and redundant records',
      'Greater organisational confidence and operational continuity'
    ]
  ),
  (
    'asset',
    'Asset Tagging & Asset Register Development',
    'Establish end-to-end asset visibility with barcode or QR-based tagging, structured registers, and lifecycle tracking systems.',
    'Full visibility over every asset — from acquisition to disposal.',
    'https://images.pexels.com/photos/6169668/pexels-photo-6169668.jpeg',
    2,
    true,
    ARRAY[
      'Physical asset verification and condition assessment',
      'Barcode or QR code tagging of all identified assets',
      'Asset register design and population in structured format',
      'Asset categorisation by class, location, cost centre and status',
      'Integration with financial systems and depreciation schedules',
      'Disposals, write-offs, and asset movement tracking protocols',
      'Staff training on asset management procedures'
    ],
    ARRAY[
      'No centralised register of what the organisation owns or where it is',
      'Inability to reconcile physical assets with financial statements',
      'Assets reported lost, stolen or "missing" with no tracking trail',
      'Overstated or understated asset values due to lack of data',
      'Annual audits delayed or failed because of incomplete asset records',
      'No lifecycle tracking — assets replaced unnecessarily or used past useful life'
    ],
    ARRAY[
      'Deploy a physical verification team to locate and document all assets',
      'Apply durable barcode or QR labels to every identified item',
      'Build a structured asset register capturing all required metadata',
      'Align asset data with your finance team''s chart of accounts',
      'Implement movement and disposal protocols to keep records current',
      'Provide a digital dashboard for real-time asset status monitoring'
    ],
    ARRAY[
      'A clean, complete and accurate asset register ready for audits',
      'Dramatic reduction in asset losses and unaccountable disposals',
      'Better financial reporting with correct depreciation calculations',
      'Faster, cleaner audit processes — both internal and external',
      'Informed procurement decisions based on real asset lifecycle data',
      'Improved accountability across departments and locations'
    ]
  ),
  (
    'iso',
    'ISO Implementation & Compliance Support',
    'Navigate complex compliance frameworks with expert guidance — from gap analysis through certification and sustained conformance.',
    'Structured frameworks that build trust, reduce risk, and prove quality.',
    'https://images.pexels.com/photos/5716001/pexels-photo-5716001.jpeg',
    3,
    true,
    ARRAY[
      'ISO gap analysis against relevant standard (ISO 9001, 14001, 45001, 27001)',
      'Implementation roadmap and project management support',
      'Documented quality management system (QMS) development',
      'Process mapping, standard operating procedures (SOPs)',
      'Internal audit programme design and execution',
      'Corrective and preventive action (CAPA) systems',
      'Pre-certification audit support and certification readiness review'
    ],
    ARRAY[
      'Unclear processes — staff operating from informal habits rather than defined procedures',
      'Repeated errors and rework with no root cause analysis system',
      'Clients or funders demanding ISO certification as a contract requirement',
      'Failed or inconclusive audits due to incomplete documentation',
      'Regulatory non-conformances with no structured corrective system',
      'Leadership unsure of how to begin or sustain a compliance framework'
    ],
    ARRAY[
      'Conduct a gap analysis to establish your baseline and identify what''s missing',
      'Develop a realistic, phased implementation plan from gap to certification',
      'Build all required documentation — quality manual, SOPs, forms, registers',
      'Train your internal team to run and maintain the management system',
      'Conduct internal audits to validate conformance before certification',
      'Provide ongoing support through the certification body audit process'
    ],
    ARRAY[
      'Internationally recognised certification that builds client and investor confidence',
      'Consistent, repeatable processes that reduce errors and rework',
      'A structured framework for continuous improvement',
      'Demonstrated compliance with legal, regulatory and contractual requirements',
      'Competitive advantage in procurement and tendering processes',
      'Reduced operational risk and improved organisational resilience'
    ]
  ),
  (
    'training',
    'Training & Capacity Building',
    'Bespoke in-house corporate training programmes across leadership, HSE, finance, customer service and digital skills.',
    'Skills that translate directly into workplace results.',
    'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
    4,
    true,
    '{}'::text[],
    '{}'::text[],
    '{}'::text[],
    '{}'::text[]
  )
ON CONFLICT (code) DO UPDATE
SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  tagline = EXCLUDED.tagline,
  image_url = EXCLUDED.image_url,
  components = EXCLUDED.components,
  pain_points = EXCLUDED.pain_points,
  solutions = EXCLUDED.solutions,
  benefits = EXCLUDED.benefits;
