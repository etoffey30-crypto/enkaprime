/*
  # Seed June 2026 Training Programmes
  Migration 005: Populate training catalog with exactly the 17 programs listed in the flyer.
*/

-- ─── CLEAR EXISTING OLD PROGRAMMES TO ENSURE NO STALE DATA ───
DELETE FROM programmes;

-- ─── INSERT THE 17 JUNE 2026 TRAINING PROGRAMMES ───
INSERT INTO programmes (code, title, days, category, is_active, is_featured, description)
VALUES
  -- 1. Leadership & Management Training
  (
    'LMT 100', 
    'Strategic Leadership and Supervisory Excellence', 
    3, 
    'Leadership', 
    true, 
    false, 
    'Develop essential skills for modern corporate leadership, project execution, and supervisory accountability.'
  ),
  (
    'LMT 102', 
    'Practical Leadership, Accountability, and Decision-Making for Managers', 
    3, 
    'Leadership', 
    true, 
    false, 
    'Equip managers with hands-on decision-making models, high accountability frameworks, and team alignment methods.'
  ),

  -- 2. Customer Service Training (Internal & External)
  (
    'CST 200', 
    'Customer Service Excellence and Client Relationship Management', 
    2, 
    'Customer Service', 
    true, 
    false, 
    'Establish frontline service standards, effective client communication channels, and long-term retention tools.'
  ),
  (
    'CTS 201', 
    'Professional Frontline Service Delivery and Complaint Handling', 
    2, 
    'Customer Service', 
    true, 
    false, 
    'Master professional customer engagement, de-escalating difficult situations, and resolving complaints with confidence.'
  ),
  (
    'CTS 202', 
    'Building a Customer-Centric Culture for Organizational Growth', 
    2, 
    'Customer Service', 
    true, 
    false, 
    'Align internal culture with frontline delivery standards to generate sustained loyalty and brand growth.'
  ),

  -- 3. Health, Safety & Environment (HSE)
  (
    'HSE 300', 
    'Workplace Health, Safety, and Risk Prevention Essentials', 
    2, 
    'HSE', 
    true, 
    false, 
    'Comprehensive safety procedures, preventative risk mitigation, and compliance frameworks for all operational sites.'
  ),
  (
    'HSE 303', 
    'Defensive Driving and Road Safety Management', 
    2, 
    'HSE', 
    true, 
    false, 
    'Equip fleet operations with safety measures, preventative driving strategies, and accident mitigation systems.'
  ),
  (
    'HSE 304', 
    'Fleet Driver Safety, Risk Reduction, and Accident Prevention', 
    2, 
    'HSE', 
    true, 
    false, 
    'Tailored training focusing on high-risk vehicle navigation, hazard recognition, and standard operating fleet safety.'
  ),
  (
    'HSE 305', 
    'Professional Defensive Driving Techniques for Corporate Drivers', 
    2, 
    'HSE', 
    true, 
    false, 
    'Advanced preventative driving controls, vehicle care, and corporate road ethics for executive drivers.'
  ),

  -- 4. Accounting & Finance Training
  (
    'AFT 400', 
    'Practical Financial Management and Budgetary Control', 
    3, 
    'Finance', 
    true, 
    false, 
    'Strengthen internal controls, accounting ledger reviews, financial forecasting, and cost control systems.'
  ),
  (
    'AFT 402', 
    'Effective Financial Reporting, Internal Controls, and Compliance', 
    3, 
    'Finance', 
    true, 
    false, 
    'Build reliable financial reporting processes, governance audits, and regulatory reporting procedures.'
  ),

  -- 5. Data & Digital Skills Training
  (
    'DDT 500', 
    'Data Management, Analysis, and Reporting Using Excel', 
    3, 
    'Digital', 
    true, 
    false, 
    'Advanced Excel tools, database structuring, formula logic, and professional analytics for daily data operations.'
  ),
  (
    'DDT 501', 
    'Practical Data Analytics for Business Decision-Making', 
    3, 
    'Digital', 
    true, 
    false, 
    'Harness statistical analytics, business dashboards, and predictive tools to support data-driven decision making.'
  ),

  -- 6. General Professional Development Training
  (
    'GEN 600', 
    'Effective Communication, Report Writing, and Presentation Skills', 
    3, 
    'General', 
    true, 
    false, 
    'Structure professional business reports, deliver high-impact executive slide decks, and improve office communications.'
  ),
  (
    'GEN 601', 
    'Time Management, Productivity, and Workplace Efficiency', 
    3, 
    'General', 
    true, 
    false, 
    'Overcome procrastination, implement prioritisation grids, and manage daily corporate workflows efficiently.'
  ),
  (
    'GEN 602', 
    'Teamwork, Collaboration, and Conflict Resolution', 
    3, 
    'General', 
    true, 
    false, 
    'Foster healthy corporate collaborations, resolve differences constructively, and build positive department morale.'
  ),

  -- 7. Featured/Special Programme (Data & Digital category, is_featured = true)
  (
    'DDT 502', 
    'Advanced Excel and Power BI for Business Intelligence Reporting', 
    4, 
    'Digital', 
    true, 
    true, 
    'An intensive hands-on training designed to equip participants with practical skills in Advanced Microsoft Excel and Power BI for data analysis, dashboard creation, reporting automation, and business intelligence decision-making. The program focuses on transforming raw organizational data into actionable insights through real-world exercises and reporting scenarios.'
  );
