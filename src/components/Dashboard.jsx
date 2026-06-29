import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { mapSupabaseProjectsToDashboardData } from '../utils/mapSupabaseProject';

import Header from './Header';
import Introduction from './Introduction';
import MetricsGrid from './MetricsGrid';
import InsightsGrid from './InsightsGrid';
import InsightsHub from './InsightsHub';
import Controls from './Controls';
import ProjectTable from './ProjectTable';

import { getCollegeGroupsForProject } from '../utils/collegeGrouping';
import { normalizeCampus } from '../utils/campusNormalization';

import '../styles/Dashboard.css';

const DEFAULT_FILTERS = {
  search: '',
  campus: 'all',
  college: 'all',
  stage: 'all',
  dataStatus: 'all',
  theme: null,
  qualitativeTheme: null
};

const toText = (value) => {
  if (value === null || value === undefined) return '';
  return String(value);
};

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

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({ projects: [] });
  const [filteredData, setFilteredData] = useState({ projects: [] });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeFilters, setActiveFilters] = useState(DEFAULT_FILTERS);

  const fetchSupabaseProjects = async () => {
    setLoading(true);
    setErrorMessage('');

    const query = supabase
      .from('projects')
      .select('*')
      .eq('is_test', false)
      .or('status.eq.published,status.is.null')
      .order('project_id', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching Supabase projects:', error);
      setErrorMessage(error.message);
      setDashboardData({ projects: [] });
      setFilteredData({ projects: [] });
      setLoading(false);
      return;
    }

    const mappedData = mapSupabaseProjectsToDashboardData(data || []);

    setDashboardData(mappedData);
    setFilteredData(mappedData);
    setLoading(false);
  };

  useEffect(() => {
    fetchSupabaseProjects();
  }, []);

  const getProjectStage = (project) => {
    if (project.maturity_stage) return project.maturity_stage;
    if (project.maturityStage) return project.maturityStage;

    const duration = project.duration;

    if (duration === 'Less than 6 months' || duration === '6 months - 1 year') {
      return 'Emerging';
    }

    if (duration === '1-2 years' || duration === '2-3 years') {
      return 'Growing';
    }

    return 'Mature';
  };

  const getThemeKeywords = () => {
    return {
      'AI & Technology': ['ai', 'artificial intelligence', 'technology', 'digital'],
      Healthcare: ['health', 'healthcare', 'medical', 'wellness'],
      Research: ['research', 'study', 'scholarly', 'laboratory'],
      'Cross-Campus Initiatives': ['cross-campus', 'global campus', 'multiple campuses'],
      'External Partnerships': ['partner', 'industry', 'external', 'community'],
      'Career Development': ['career', 'workforce', 'professional', 'employment'],
      'Student Services': ['student services', 'advising', 'mentorship', 'support'],
      'Campus Operations': ['operations', 'facilities', 'space', 'infrastructure'],
      'Academic Programs': ['academic', 'curriculum', 'program', 'course']
    };
  };

  const getQualitativeKeywords = () => {
    return {
      challenges: {
        'Resource Constraints': ['funding', 'budget', 'staffing', 'capacity', 'resource'],
        'Scaling & Growth': ['scale', 'scaling', 'growth', 'expand', 'sustainability'],
        'Stakeholder Engagement': ['stakeholder', 'buy-in', 'adoption', 'engagement'],
        'Technical Complexity': ['technical', 'technology', 'system', 'platform', 'integration'],
        'Coordination Challenges': ['coordination', 'communication', 'alignment', 'collaboration']
      },
      impact: {
        'Student Success': ['student success', 'learning outcomes', 'retention', 'engagement'],
        'Operational Efficiency': ['efficiency', 'automation', 'process', 'productivity'],
        'Community Building': ['community', 'network', 'partnership', 'collaboration'],
        'Research Advancement': ['research', 'publication', 'knowledge', 'findings']
      }
    };
  };

  const getStrategicFocusAreas = (project) => {
    return [
      ...normalizeArray(project.strategic_focus_areas),
      ...normalizeArray(project.strategicFocusAreas),
      ...normalizeArray(project.raw_supabase_project?.strategic_focus_areas),
      ...normalizeArray(project.raw_supabase_project?.strategicFocusAreas)
    ];
  };

  const getCommonChallenges = (project) => {
    return [
      ...normalizeArray(project.common_challenges),
      ...normalizeArray(project.commonChallenges),
      ...normalizeArray(project.raw_supabase_project?.common_challenges),
      ...normalizeArray(project.raw_supabase_project?.commonChallenges)
    ];
  };

  const getImpactThemes = (project) => {
    return [
      ...normalizeArray(project.impact_themes),
      ...normalizeArray(project.impactThemes),
      ...normalizeArray(project.raw_supabase_project?.impact_themes),
      ...normalizeArray(project.raw_supabase_project?.impactThemes)
    ];
  };

  const isThemeProjectExcluded = () => false;

  const isThemeProjectIncluded = (theme, project) => {
    return getStrategicFocusAreas(project).includes(theme);
  };

  const themeHasIncludeList = () => false;

  const isSameFilterClickedAgain = (prev, filterType, value) => {
    if (filterType === 'stage') return prev.stage === value;
    if (filterType === 'dataStatus') return prev.dataStatus === value;
    if (filterType === 'campus') return prev.campus === value;
    if (filterType === 'college') return prev.college === value;
    if (filterType === 'theme') return prev.theme === value;

    if (filterType === 'qualitativeTheme') {
      return (
        prev.qualitativeTheme &&
        value &&
        prev.qualitativeTheme.type === value.type &&
        prev.qualitativeTheme.theme === value.theme
      );
    }

    return false;
  };

  const updateFilter = (filterType, value) => {
    setActiveFilters((prev) => {
      if (isSameFilterClickedAgain(prev, filterType, value)) {
        return DEFAULT_FILTERS;
      }

      if (filterType === 'search') {
        return {
          ...DEFAULT_FILTERS,
          search: value
        };
      }

      if (
        (filterType === 'campus' && value === 'all') ||
        (filterType === 'college' && value === 'all') ||
        (filterType === 'stage' && value === 'all') ||
        (filterType === 'dataStatus' && value === 'all')
      ) {
        return DEFAULT_FILTERS;
      }

      return {
        ...DEFAULT_FILTERS,
        [filterType]: value
      };
    });
  };

  const handleQualitativeThemeFilter = (type, theme) => {
    if (!type || !theme) {
      updateFilter('qualitativeTheme', null);
      return;
    }

    updateFilter('qualitativeTheme', { type, theme });
  };

  const clearAllFilters = () => {
    setActiveFilters(DEFAULT_FILTERS);
  };

  const applyFilters = () => {
    const {
      search,
      campus,
      college,
      stage,
      dataStatus,
      theme,
      qualitativeTheme
    } = activeFilters;

    const filtered = dashboardData.projects.filter((project) => {
      const projectTitle = toText(project.title).toLowerCase();
      const projectCollege = toText(project.college).toLowerCase();
      const projectCampus = toText(project.campus).toLowerCase();
      const searchText = toText(search).toLowerCase();

      const matchesSearch =
        !searchText ||
        projectTitle.includes(searchText) ||
        projectCollege.includes(searchText) ||
        projectCampus.includes(searchText);

      const normalizedProjectCampus = normalizeCampus(project.campus);
      const normalizedSelectedCampus = normalizeCampus(campus);

      const projectCampusLower = toText(normalizedProjectCampus).toLowerCase();
      const selectedCampusLower = toText(normalizedSelectedCampus).toLowerCase();
      const selectedCampusBase = selectedCampusLower.split(',')[0].trim();

      const matchesCampus =
        campus === 'all' ||
        normalizedProjectCampus === normalizedSelectedCampus ||
        projectCampusLower.includes(selectedCampusLower) ||
        (selectedCampusBase && projectCampusLower.includes(selectedCampusBase));

      const matchesCollege =
        college === 'all' ||
        getCollegeGroupsForProject(project).includes(college);

      let matchesStage = stage === 'all';

      if (stage !== 'all') {
        const projectStage = getProjectStage(project);
        matchesStage = projectStage === stage;
      }

      let matchesDataStatus = dataStatus === 'all';

      if (dataStatus === 'Data Ready' && toText(project.dataStatus).includes('Yes')) {
        matchesDataStatus = true;
      }

      if (
        dataStatus === 'Collection Planned' &&
        toText(project.dataStatus).toLowerCase().includes('planned')
      ) {
        matchesDataStatus = true;
      }

      if (
        dataStatus === 'No Data' &&
        !toText(project.dataStatus).includes('Yes') &&
        !toText(project.dataStatus).toLowerCase().includes('planned')
      ) {
        matchesDataStatus = true;
      }

      const matchesTheme =
        !theme || getStrategicFocusAreas(project).includes(theme);

      let matchesQualitativeTheme = true;

      if (qualitativeTheme?.type === 'challenges') {
        matchesQualitativeTheme = getCommonChallenges(project).includes(
          qualitativeTheme.theme
        );
      }

      if (qualitativeTheme?.type === 'impact') {
        matchesQualitativeTheme = getImpactThemes(project).includes(
          qualitativeTheme.theme
        );
      }

      return (
        matchesSearch &&
        matchesCampus &&
        matchesCollege &&
        matchesStage &&
        matchesDataStatus &&
        matchesTheme &&
        matchesQualitativeTheme
      );
    });

    setFilteredData({ projects: filtered });
  };

  useEffect(() => {
    applyFilters();
  }, [activeFilters, dashboardData]);

  if (loading) {
    return (
      <div className="dashboard">
        <Header />

        <main className="dashboard-main">
          <div style={{ padding: '32px', textAlign: 'center' }}>
            Loading official projects from Supabase...
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
          onCampusFilter={(selectedCampus) => updateFilter('campus', selectedCampus)}
        />

        <InsightsGrid
          data={filteredData}
          originalData={dashboardData}
          onThemeFilter={(selectedTheme) => updateFilter('theme', selectedTheme)}
          onStageFilter={(selectedStage) => updateFilter('stage', selectedStage)}
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
          onQualitativeThemeFilter={handleQualitativeThemeFilter}
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
        <div className="footer-brand">
          Northeastern University Innovation Intelligence Platform
        </div>
        <div>
          Empowering innovation through data-driven insights across the global campus network
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;