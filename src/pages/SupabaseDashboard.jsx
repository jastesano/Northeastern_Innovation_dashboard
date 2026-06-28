import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { mapSupabaseProjectsToDashboardData } from '../utils/mapSupabaseProject';
import Header from '../components/Header';
import Introduction from '../components/Introduction';
import MetricsGrid from '../components/MetricsGrid';
import InsightsGrid from '../components/InsightsGrid';
import InsightsHub from '../components/InsightsHub';
import Controls from '../components/Controls';
import ProjectTable from '../components/ProjectTable';
import { getCollegeGroupsForProject } from '../utils/collegeGrouping';
import { normalizeCampus } from '../utils/campusNormalization';
import '../styles/Dashboard.css';

const SupabaseDashboard = () => {
  const [allDashboardData, setAllDashboardData] = useState({ projects: [] });
  const [dashboardData, setDashboardData] = useState({ projects: [] });
  const [filteredData, setFilteredData] = useState({ projects: [] });
  const [showTestRecords, setShowTestRecords] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    search: '',
    campus: 'all',
    college: 'all',
    stage: 'all',
    dataStatus: 'all',
    theme: null,
    qualitativeTheme: null
  });



  const fetchSupabaseProjects = async () => {
    setLoading(true);
    setErrorMessage('');

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching Supabase projects:', error);
      setErrorMessage(error.message);
      setAllDashboardData({ projects: [] });
    } else {
      const mappedData = mapSupabaseProjectsToDashboardData(data || []);
      setAllDashboardData(mappedData);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchSupabaseProjects();
  }, []);

  useEffect(() => {
    const visibleProjects = showTestRecords
      ? allDashboardData.projects
      : allDashboardData.projects.filter((project) => !project.is_test);

    setDashboardData({ projects: visibleProjects });
  }, [allDashboardData, showTestRecords]);

  const themeExcludedTitles = {
    'Academic Programs': new Set([
      'Husky Bridge Job-Shadow Program',
      'SIG (Student Interest Group) Leader Training Module',
      'cPort Credit Union Language Translation Tool',
      'Pre-Arrival Career Development Program',
      'BaseCamp Studio Program',
      'Use of Airtable and Airtable AI for Operational Effiency at Scale',
      'Co-curricular Experiential Project (Pilot)'
    ].map(title => title.toLowerCase())),
    'Student Services': new Set([
      'Experience Expo',
      'COS Deans Research Scholars',
      'Campfire Chats',
      'Utilising Artificial Intelligence as a Learning Tool to Explore the Development of Undergraduate Students’ Mathematical Resilience',
      'MaineSeq'
    ].map(title => title.toLowerCase())),
    'Healthcare': new Set([
      'BioPILOT/BioCoLAB'
    ].map(title => title.toLowerCase())),
    'AI & Technology': new Set([
      'IDEXX Database Working Lab',
      'Drone Flying Program'
    ].map(title => title.toLowerCase())),
    'Career Development': new Set([
      'Redevelopment and Expansion of EESC3000 – Values, Ethics, and Professionalism in the Sciences',
      'Support for Federal Employees, Federal Contractors, and Military/Veterans in Transition',
      'Use of Airtable and Airtable AI for Operational Effiency at Scale'
    ].map(title => title.toLowerCase())),
    'Research': new Set([
      'Accelerated Bachelor of Science in Nursing (ABSN) Program, Simulation Rooms, & Skills Lab',
      'Real-Time Co-op Competency Assessment and College-to-Career Research',
      'BioPILOT/BioCoLAB',
      'Working Lab',
      'BioDesign for Rural Maine'
    ].map(title => title.toLowerCase()))
  };

  const themeIncludedTitles = {
    'Academic Programs': new Set([
      'COS Deans Research Scholars',
      'Utilising Artificial Intelligence as a Learning Tool to Explore the Development of Undergraduate Students’ Mathematical Resilience',
      'BioPILOT/BioCoLAB',
      'MaineSeq',
      'Working Lab',
      'Pioneering Academia-Industry Collaborations at the Intersection of Artificial Intelligence & Philosophy',
      'BioDesign for Rural Maine',
      'Graduate Leadership Institute-Seattle Campus',
      'PAWsome Connections Mixer Networking Event',
      'Case Study Simulation Program'
    ].map(title => title.toLowerCase())),
    'External Partnerships': new Set([
      'The Neurodiversity Initiative',
      'Physical AI Research (PAIR) Center',
      'Miami Innovation Academy',
      'Entrepreneurship TREK',
      'NextLevel X Northeastern',
      'MS Sustainability Engineering Leadership double-degree with University College-London',
      'Case Study Simulation Program',
      'Apprenticeships',
      'The Innovation Nexus',
      'Accelerated Bachelor of Science in Nursing (ABSN) Program, Simulation Rooms, & Skills Lab',
      'Speech-Language Center',
      'CAMD F1RST',
      'Experience Expo',
      'Campus as a Living Laboratory: Community-Led Urban Greening through the California Climate Action Corps',
      'Building a Regional Credentialing Ecosystem for Lifelong Learning and Workforce Pathways',
      'Investigating the International Big Picture Learning Credential (IBPLC) for U.S. Admissions and Workforce Pathways',
      'Impact Project',
      'Embedded Partners Program',
      'AI Coach',
      'Value Creation',
      'Real-Time Co-op Competency Assessment and College-to-Career Research',
      'Innovation Lab Grants',
      'Student Leadership Development (Student Interest Groups & Graduate Leadership Institute) - Toronto Campus',
      'Public Transportation and Traffic Analysis in Toronto - Northeastern University in Toronto and the City of Toronto',
      'Partner Hub: Connecting Industry and Academia',
      'Bouvé Health Fair',
      'CUNEF Universidad Co-Enrollment Residency Partnership',
      'Intraprenuership for Nonprofits',
      'Behavior-Changing Workplace Learning',
      'Capstone Immersion',
      'cPort Credit Union Language Translation Tool',
      'BioPILOT/BioCoLAB',
      'Campfire Chats',
      'Healthcare Gap Year Program',
      'EDHEC Partnership',
      'MaineSeq',
      'Valorization of Dirigo Sea Farm Waste',
      'Working Lab',
      'Arlington County Leader’s Challenge Program',
      'Embedded Partner Ecosystem - Vancouver Campus.',
      'Building An Entrepreneurship Eco-System To Serve London & The Global Network',
      'SafeTALK and Support the Pack',
      'Pioneering Academia-Industry Collaborations at the Intersection of Artificial Intelligence & Philosophy',
      'Belonging in Practice: Driving Innovation in UK Higher Education through New Institutional Practices for Holistic Inclusion',
      'Leveraging Award-Winning Apprenticeship Degrees to Embed Authentic, Industry-Validated Experiential Learning Across the Institution',
      'Mixed Reality Ultrasound Training',
      'IDEXX Database Working Lab',
      'BioDesign for Rural Maine',
      'NU/Knox Clinic Multi-Disciplinary/Generational Collaboration',
      'Co-curricular Experiential Project (Pilot)',
      'Northeastern Toronto Entrepreneurship (Enactus)'
    ].map(title => title.toLowerCase())),
    'Campus Operations': new Set([
      'The Neurodiversity Initiative',
      'Graduate Leadership Institute-Seattle Campus',
      'The Evolving Skills Landscape in the Age of AI',
      'SIG (Student Interest Group) Leader Training Module',
      'Align Online',
      'PAWsome Connections Mixer Networking Event',
      'Seattle Campus Innovative Spaces',
      'Integration of UG curriculum to PlusOne',
      'Experience Expo',
      'Building a Regional Credentialing Ecosystem for Lifelong Learning and Workforce Pathways',
      'Embedded Partners Program',
      'AI Coach',
      'Value Creation',
      'Media Studios Organization (MSO): A Centralized Creative Technology Ecosystem',
      'Partner Hub: Connecting Industry and Academia',
      'Bouve Undergraduate Researcher Badge',
      'BIOL 2309: Biology Project Laboratory and integration into MakerSpace',
      'Northeastern University Global Innovation Challenge',
      'Intraprenuership for Nonprofits',
      'Behavior-Changing Workplace Learning',
      'AI Readiness Survey',
      'Valorization of Dirigo Sea Farm Waste',
      'Pre-Arrival Career Development Program',
      'BaseCamp Studio Program',
      'InStage AI Reflection Tool for Co-op',
      'Use of Airtable and Airtable AI for Operational Effiency at Scale',
      'Embedded Partner Ecosystem - Vancouver Campus.',
      'Building An Entrepreneurship Eco-System To Serve London & The Global Network',
      'Graduate Student Advising Model: Graduate Faculty Advisor/Program Director Training / Faculty Advisor Use of Navigate',
      'Belonging in Practice: Driving Innovation in UK Higher Education through New Institutional Practices for Holistic Inclusion',
      'MSDS/MSCS Co-rooming',
      'Leveraging Award-Winning Apprenticeship Degrees to Embed Authentic, Industry-Validated Experiential Learning Across the Institution'
    ].map(title => title.toLowerCase())),
    'Cross-Campus Initiatives': new Set([
      'The Neurodiversity Initiative',
      'Writing Creatively in the Age of AI',
      'The Evolving Skills Landscape in the Age of AI',
      'Undergraduate Research Badging Program',
      'Impact Project',
      'Proposed Global Urban Studies Major/Minor',
      'Research Justice at the Intersections',
      'Media Studios Organization (MSO): A Centralized Creative Technology Ecosystem',
      'Sustainability Initiatives',
      'CUNEF Universidad Co-Enrollment Residency Partnership',
      'Northeastern University Global Innovation Challenge',
      'Healthcare Gap Year Program',
      'Arlington County Leader’s Challenge Program',
      'Pre-Arrival Career Development Program',
      'InStage AI Reflection Tool for Co-op',
      'Use of Airtable and Airtable AI for Operational Effiency at Scale',
      'Building An Entrepreneurship Eco-System To Serve London & The Global Network'
    ].map(title => title.toLowerCase()))
  };

  const isThemeProjectExcluded = (theme, project) => {
    const excludeSet = themeExcludedTitles[theme];
    if (!excludeSet) return false;
    return excludeSet.has(project.title.toLowerCase());
  };

  const isThemeProjectIncluded = (theme, project) => {
    const includeSet = themeIncludedTitles[theme];
    if (!includeSet) return false;
    return includeSet.has(project.title.toLowerCase());
  };
  const themeHasIncludeList = (theme) => Boolean(themeIncludedTitles[theme]);

  // Normalize a stored value (Postgres array string or JS array) into a string array
  const normalizeArray = (value) => {
    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean);
    }

    if (!value) return [];

    if (typeof value === 'string') {
      return value
        .replace(/^\{/, '')
        .replace(/\}$/, '')
        .split(',')
        .map((item) => item.replace(/^"|"$/g, '').trim())
        .filter(Boolean);
    }

    return [];
  };

  // Read a project's strategic focus areas from the stored Supabase column
  const getStrategicFocusAreas = (project) => {
    return [
      ...normalizeArray(project.strategic_focus_areas),
      ...normalizeArray(project.strategicFocusAreas),
      ...normalizeArray(project.raw_supabase_project?.strategic_focus_areas),
      ...normalizeArray(project.raw_supabase_project?.strategicFocusAreas)
    ];
  };

  // Read a project's common challenges from the stored Supabase column
  const getCommonChallenges = (project) => {
    return [
      ...normalizeArray(project.common_challenges),
      ...normalizeArray(project.commonChallenges),
      ...normalizeArray(project.raw_supabase_project?.common_challenges),
      ...normalizeArray(project.raw_supabase_project?.commonChallenges)
    ];
  };

  // Read a project's impact themes from the stored Supabase column
  const getImpactThemes = (project) => {
    return [
      ...normalizeArray(project.impact_themes),
      ...normalizeArray(project.impactThemes),
      ...normalizeArray(project.raw_supabase_project?.impact_themes),
      ...normalizeArray(project.raw_supabase_project?.impactThemes)
    ];
  };

  // Filter projects based on active filters
  const applyFilters = () => {
    const { search, campus, college, stage, dataStatus, theme, qualitativeTheme } = activeFilters;
    
    const filtered = dashboardData.projects.filter(project => {
      // Search filter
      const matchesSearch = !search || 
        project.title.toLowerCase().includes(search.toLowerCase()) ||
        project.college.toLowerCase().includes(search.toLowerCase()) ||
        project.campus.toLowerCase().includes(search.toLowerCase());

      // Campus filter
      const normalizedProjectCampus = normalizeCampus(project.campus);
      const normalizedSelectedCampus = normalizeCampus(campus);
      const projectCampusLower = normalizedProjectCampus.toLowerCase();
      const selectedCampusLower = normalizedSelectedCampus.toLowerCase();
      const selectedCampusBase = selectedCampusLower.split(',')[0].trim();

      const matchesCampus =
        campus === 'all' ||
        normalizedProjectCampus === normalizedSelectedCampus ||
        projectCampusLower.includes(selectedCampusLower) ||
        (selectedCampusBase && projectCampusLower.includes(selectedCampusBase));

      // College filter
      const matchesCollege = college === 'all' || getCollegeGroupsForProject(project).includes(college);

      // Stage filter (maturity)
      let matchesStage = stage === 'all';
      if (stage !== 'all') {
        const projectStage = getProjectStage(project);
        matchesStage = projectStage === stage;
      }

      // Data status filter
      let matchesDataStatus = dataStatus === 'all';
      if (dataStatus === 'Data Ready' && project.dataStatus.includes('Yes')) matchesDataStatus = true;
      if (dataStatus === 'Collection Planned' && project.dataStatus.includes('planned')) matchesDataStatus = true;
      if (dataStatus === 'No Data' && !project.dataStatus.includes('Yes') && !project.dataStatus.includes('planned')) matchesDataStatus = true;

      // Theme filter (Strategic Focus Areas) - match the stored Supabase column,
      // consistent with how the Strategic Focus Areas card counts projects.
      const matchesTheme = !theme || getStrategicFocusAreas(project).includes(theme);

      // Qualitative theme filter (Challenges/Impact themes) - match the stored
      // Supabase columns, consistent with how the Common Challenges and Impact
      // Themes cards count projects.
      let matchesQualitativeTheme = !qualitativeTheme;
      if (qualitativeTheme?.type === 'challenges') {
        matchesQualitativeTheme = getCommonChallenges(project).includes(qualitativeTheme.theme);
      } else if (qualitativeTheme?.type === 'impact') {
        matchesQualitativeTheme = getImpactThemes(project).includes(qualitativeTheme.theme);
      }

      return matchesSearch && matchesCampus && matchesCollege && matchesStage && matchesDataStatus && matchesTheme && matchesQualitativeTheme;
    });

    setFilteredData({ projects: filtered });
  };

  // Get project stage based on duration
  const getProjectStage = (project) => {
    const duration = project.duration;
    
    if (duration === 'Less than 6 months' || duration === '6 months - 1 year') {
      return 'Emerging';
    } else if (duration === '1-2 years' || duration === '2-3 years') {
      return 'Growing';
    } else {
      return 'Mature';
    }
  };

  // ============================================
  // STRATEGIC FOCUS AREAS - 9 CATEGORIES
  // ============================================
  const getThemeKeywords = () => ({
    'AI & Technology': [
      'AI ', ' AI', 'Artificial Intelligence', 'Agent Arena', 'AR/VR', 'VR use',
      'Sandbox', 'Database', 'Dashboard', 'Drone', 'Virtual', 'Augmented',
      'Airtable', 'Mixed Reality', 'Hackathon', 'Digital', 'InStage',
      'AI Coach', 'AI Readiness', 'AI Solutions', 'PAIR', 'Technology Ecosystem'
    ],
    
    'Healthcare': [
      'Health', 'Healthcare', 'Medical', 'Nursing', 'Clinical', 'Wellness',
      'ABSN', 'Ultrasound', 'Speech-Language', 'Bouvé', 'Bouve', 'Clinic',
      'Patient', 'Therapy', 'Biomedical'
    ],
    
    'Research': [
      'Research', 'Laboratory', ' Lab', 'Working Lab', 'Discovery',
      'Investigation', 'Methodology', 'Experiment', 'Inquiry', 'Scholarly',
      'Scientific', 'Empirical', 'BioPILOT', 'BioCoLAB', 'MaineSeq', 
      'BioDesign', 'Valorization', 'Sea Farm', 'Drone Flying Program'
    ],
    
    'Cross-Campus Initiatives': [
      'Global', 'International', 'London', 'Toronto', 'Vancouver', 'Miami',
      'Oakland', 'Seattle', 'Arlington', 'UK Higher Education', 'CUNEF',
      'EDHEC', 'UCL', 'University College-London', 'Multi-Campus', 'Network',
      'Regional', 'Campus Network', 'Maine'
    ],
    
    'External Partnerships': [
      'Partner', 'Collaboration', 'Industry', 'Embedded', 'Hub', 'Ecosystem',
      'Alliance', 'Corporate', 'Employer', 'Community', 'Nonprofit',
      'Government', 'Entrepreneurship', 'Innovation Nexus', 'TREK', 'NextLevel',
      'Value Creation', 'Impact Project', 'Intrapreneurship', 'Academia-Industry',
      'Knox', 'cPort', 'IDEXX', 'Focus Groups', 'Connects to Innovation',
      'Working Lab'
    ],
    
    'Career Development': [
      'Career', 'Job', 'Professional', 'Workforce', 'Employment', 'Job-Shadow',
      'Pre-Arrival', 'Co-op', 'Competency', 'College-to-Career', 'Transition',
      'Federal Employees', 'Veterans', 'Military', 'Apprenticeship',
      'Experience Expo', 'Campfire Chats', 'PAWsome Connections',
      'BaseCamp Studio', 'Co-curricular', 'Experiential Project',
      'Miami Innovation Academy', 'Entrepreneurship TREK', 'TREK',
      'Graduate Leadership Institute', 'Introduction to Professional Communication',
      'Global Learner', 'Real-Time Co-op Competency Assessment'
    ],
    
    'Student Services': [
      'Student', 'Mentorship', 'Mentor', 'Advising', 'Advisor', 'Support',
      'Orientation', 'Mixer', 'Connections', 'Peer', 'Counseling',
      'Scholars', 'F1RST', 'Neurodiversity', 'SafeTALK', 'Belonging',
      'Leadership Development', 'Leadership Institute', 'Experience Expo', 
      'Campfire Chats', 'CAMD10', 'SIG', 'Student Interest Group',
      'Federal Employees', 'Military/Veterans', 'Veterans in Transition'
    ],
    
    'Campus Operations': [
      'Spaces', 'Facilities', 'Housing', 'Residence', 'Res Hall', 'Recreation',
      'Sports', 'Infrastructure', 'Building', 'Sustainability', 'Green',
      'Living Laboratory', 'Urban Greening', 'Skills Lab', 'MakerSpace',
      'Studio', 'BaseCamp', 'Personal Training', 'Transportation'
    ],
    
    'Academic Programs': [
      'Curriculum', 'Course', 'Degree', 'Major', 'Minor', 'Admissions',
      'MSCS', 'MSDS', 'Align', 'PlusOne', 'Co-Enrollment', 'Experiential',
      'Pedagogy', 'Certificate', 'Capstone', 'Module', 'Credential', 
      'Non-Degree', 'Framework', 'Credit', 'BIOL', 'EESC', 'STICs', 
      'Writing Creatively', 'Simulation', 'Professional Communication', 
      'Workplace Learning', 'Badging', 'Lifelong Learning', 'Science Program', 
      'Immersion', 'Center', 'ABSN', 'Nursing'
    ]
  });

  // Qualitative themes keywords (for Common Challenges and Impact Themes)
  const getQualitativeKeywords = () => ({
    challenges: {
      'Resource Constraints': ['funding', 'budget', 'resources', 'staff', 'time', 'capacity', 'limited'],
      'Scaling & Growth': ['scale', 'scaling', 'expand', 'growth', 'replicate', 'sustainability'],
      'Stakeholder Engagement': ['engagement', 'buy-in', 'adoption', 'stakeholder', 'participation', 'awareness'],
      'Technical Complexity': ['technical', 'technology', 'integration', 'system', 'platform', 'data'],
      'Coordination Challenges': ['coordination', 'collaboration', 'communication', 'alignment', 'silos']
    },
    impact: {
      'Student Success': ['student', 'learning', 'outcomes', 'success', 'retention', 'engagement'],
      'Operational Efficiency': ['efficiency', 'process', 'streamline', 'automation', 'productivity'],
      'Community Building': ['community', 'network', 'connection', 'collaboration', 'partnership'],
      'Research Advancement': ['research', 'discovery', 'knowledge', 'publication', 'findings']
    }
  });

  // Update filter
  const updateFilter = (filterType, value) => {
    const newFilters = { ...activeFilters };
    
    if (filterType === 'theme') {
      // Toggle theme filter - if same theme clicked, clear it
      newFilters[filterType] = activeFilters.theme === value ? null : value;
    } else if (filterType === 'stage') {
      // Toggle stage filter
      newFilters[filterType] = activeFilters.stage === value ? 'all' : value;
    } else if (filterType === 'qualitativeTheme') {
      // Handle qualitative theme clearing when value is null
      if (value === null) {
        newFilters[filterType] = null;
      } else {
        // Toggle qualitative theme filters
        const currentFilter = newFilters[filterType];
        if (currentFilter && currentFilter.type === value.type && currentFilter.theme === value.theme) {
          newFilters[filterType] = null;
        } else {
          newFilters[filterType] = value;
        }
      }
    } else {
      newFilters[filterType] = filterType === 'campus' ? normalizeCampus(value) : value;
    }
    
    setActiveFilters(newFilters);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters({
      search: '',
      campus: 'all',
      college: 'all',
      stage: 'all',
      dataStatus: 'all',
      theme: null,
      qualitativeTheme: null
    });
  };

  // Apply filters whenever activeFilters change
  useEffect(() => {
    applyFilters();
  }, [activeFilters, dashboardData]);

  if (loading) {
    return (
      <div className="dashboard">
        <Header />
        <main className="dashboard-main">
          <div style={{ padding: '32px', textAlign: 'center' }}>
            Loading projects from Supabase...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Header />
      
      <main className="dashboard-main">
        <Introduction />

        <section
          style={{
            margin: '0 0 24px 0',
            padding: '16px 20px',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            background: '#fff7ed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}
        >
          <div>
            <strong>Supabase Test Mode</strong>
            <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
              This temporary control is only for the Supabase dashboard preview. Test records are hidden by default.
            </div>
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <input
              type="checkbox"
              checked={showTestRecords}
              onChange={(event) => setShowTestRecords(event.target.checked)}
            />
            Include test records
          </label>
        </section>

        {errorMessage && (
          <div
            style={{
              margin: '0 0 24px 0',
              padding: '12px 16px',
              borderRadius: '10px',
              background: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #fecaca'
            }}
          >
            {errorMessage}
          </div>
        )}
        
        <MetricsGrid 
          data={filteredData}
          originalData={dashboardData}
          onDataStatusFilter={(status) => updateFilter('dataStatus', status)}
          onCampusFilter={(campus) => updateFilter('campus', campus)}
        />

        <InsightsGrid 
          data={filteredData}
          originalData={dashboardData}
          onThemeFilter={(theme) => updateFilter('theme', theme)}
          onStageFilter={(stage) => updateFilter('stage', stage)}
          activeTheme={activeFilters.theme}
          activeStage={activeFilters.stage}
          getProjectStage={getProjectStage}
          getThemeKeywords={getThemeKeywords}
          isThemeProjectExcluded={isThemeProjectExcluded}
          isThemeProjectIncluded={isThemeProjectIncluded}
          themeHasIncludeList={themeHasIncludeList}
        />

        <InsightsHub 
          data={filteredData}
          originalData={dashboardData}
          onQualitativeThemeFilter={(type, theme) => updateFilter('qualitativeTheme', type && theme ? { type, theme } : null)}
          activeQualitativeTheme={activeFilters.qualitativeTheme}
          getQualitativeKeywords={getQualitativeKeywords}
        />

        <Controls 
          data={dashboardData}
          onFilterChange={updateFilter}
          onClearFilters={clearAllFilters}
          activeFilters={activeFilters}
          resultCount={filteredData.projects.length}
        />

        <ProjectTable 
          data={filteredData}
          getProjectStage={getProjectStage}
        />
      </main>

      <footer className="footer">
        <div className="footer-brand">Northeastern University Innovation Intelligence Platform</div>
        <div>Empowering innovation through data-driven insights across the global campus network</div>
      </footer>
    </div>
  );
};

export default SupabaseDashboard;
