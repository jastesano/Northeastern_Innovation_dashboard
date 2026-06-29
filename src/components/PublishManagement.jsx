import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styles/Reviewer.css';

function PublishManagement() {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showTestRecords, setShowTestRecords] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoadingProjectId, setActionLoadingProjectId] = useState(null);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [page, setPage] = useState(1);

  const rowsPerPage = 10;

  async function fetchProjects() {
    setLoading(true);
    setErrorMessage('');

    const { data, error } = await supabase
      .from('projects')
      .select('project_id, project_title, college_department, campus, status, is_test, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      setErrorMessage(error.message);
      setProjects([]);
      setLoading(false);
      return;
    }

    setProjects(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, showTestRecords]);

  const filteredProjects = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return projects.filter((project) => {
      const status = project.status || 'published';

      const matchesSearch =
        !search ||
        String(project.project_id || '').toLowerCase().includes(search) ||
        String(project.project_title || '').toLowerCase().includes(search) ||
        String(project.college_department || '').toLowerCase().includes(search) ||
        String(project.campus || '').toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === 'all' || status === statusFilter;

      const matchesTestSetting =
        showTestRecords || project.is_test !== true;

      return matchesSearch && matchesStatus && matchesTestSetting;
    });
  }, [projects, searchTerm, statusFilter, showTestRecords]);

  const totalPages = Math.ceil(filteredProjects.length / rowsPerPage) || 1;

  const paginatedProjects = filteredProjects.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  async function handleStatusChange(project) {
    const currentStatus = project.status || 'published';
   const projectId = String(project.project_id || '')
  .replaceAll('"', '')
  .trim();

    const functionName =
      currentStatus === 'published'
        ? 'unpublish_project'
        : 'republish_project';

    const confirmMessage =
      currentStatus === 'published'
        ? `Are you sure you want to unpublish ${project.project_title}? This will hide it from the public dashboard.`
        : `Are you sure you want to republish ${project.project_title}? This will make it visible on the public dashboard.`;

    if (!window.confirm(confirmMessage)) return;

    setActionLoadingProjectId(projectId);
    setMessage('');
    setErrorMessage('');

    console.log('Project object:', project);
    console.log('Project ID being sent:', projectId);
    const { data, error } = await supabase.rpc(functionName, {
      p_project_id: projectId,
      p_reviewer_name: 'Admin/Reviewer',
      p_reviewer_email: 'admin-reviewer@northeastern.edu',
    });
    console.log('RPC response data:', data);

console.log('RPC response error:', error);

    if (error) {
      console.error('Publish status update error:', error);
      setErrorMessage(error.message);
      setActionLoadingProjectId(null);
      return;
    }

 if (data?.success === false) {
  setErrorMessage(data?.message || 'Project status update failed.');
} else {
  setMessage(data?.message || 'Project status updated successfully.');
}
    await fetchProjects();
    setActionLoadingProjectId(null);
  }

  function formatDate(dateValue) {
    if (!dateValue) return '—';

    return new Date(dateValue).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  if (loading) {
    return (
      <section className="reviewer-card">
        <h2 className="reviewer-title">Publish Management</h2>
        <p className="reviewer-subtitle">Loading published projects...</p>
      </section>
    );
  }

  return (
    <section className="reviewer-card">
      <div className="reviewer-card-header">
        <div>
          <h2 className="reviewer-title">Publish Management</h2>
          <p className="reviewer-subtitle">
            Manage whether projects are visible on the public Innovation Dashboard.
          </p>
        </div>

        <button type="button" className="button-neutral" onClick={fetchProjects}>
          Refresh
        </button>
      </div>

      {message && <div className="message-success">{message}</div>}
      {errorMessage && <div className="message-error">{errorMessage}</div>}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, 1fr) 180px 180px',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <input
          className="login-input"
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by Project ID, title, college, or campus"
        />

        <select
          className="login-input"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="unpublished">Unpublished</option>
          <option value="archived">Archived</option>
        </select>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
            fontSize: '14px',
          }}
        >
          <input
            type="checkbox"
            checked={showTestRecords}
            onChange={(event) => setShowTestRecords(event.target.checked)}
          />
          Include test records
        </label>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>Project ID</th>
              <th style={{ padding: '10px' }}>Project Title</th>
              <th style={{ padding: '10px' }}>College / Department</th>
              <th style={{ padding: '10px' }}>Campus</th>
              <th style={{ padding: '10px' }}>Date Added</th>
              <th style={{ padding: '10px' }}>Status</th>
              <th style={{ padding: '10px' }}>Test</th>
              <th style={{ padding: '10px' }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {paginatedProjects.length === 0 && (
              <tr>
                <td colSpan="8" style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>
                  No projects found.
                </td>
              </tr>
            )}

            {paginatedProjects.map((project) => {
              const status = project.status || 'published';
              const isLoading = actionLoadingProjectId === project.project_id;

              return (
                <tr key={project.project_id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px', fontWeight: 700 }}>{project.project_id}</td>
                  <td style={{ padding: '10px' }}>{project.project_title}</td>
                  <td style={{ padding: '10px' }}>{project.college_department || '—'}</td>
                  <td style={{ padding: '10px' }}>{project.campus || '—'}</td>
                  <td style={{ padding: '10px' }}>{formatDate(project.created_at)}</td>
                  <td style={{ padding: '10px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: 700,
                        background: status === 'published' ? '#dcfce7' : '#fef3c7',
                        color: status === 'published' ? '#166534' : '#92400e',
                      }}
                    >
                      {status === 'published'
                        ? 'Published'
                        : status === 'unpublished'
                          ? 'Unpublished'
                          : 'Archived'}
                    </span>
                  </td>
                  <td style={{ padding: '10px' }}>{project.is_test ? 'Yes' : 'No'}</td>
                  <td style={{ padding: '10px' }}>
                    {status !== 'archived' ? (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(project)}
                        disabled={isLoading}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: isLoading ? 'not-allowed' : 'pointer',
                          fontWeight: 700,
                          background: status === 'published' ? '#fee2e2' : '#dcfce7',
                          color: status === 'published' ? '#991b1b' : '#166534',
                          opacity: isLoading ? 0.6 : 1,
                        }}
                      >
                        {isLoading
                          ? 'Updating...'
                          : status === 'published'
                            ? 'Unpublish'
                            : 'Republish'}
                      </button>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '16px',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          Showing{' '}
          {filteredProjects.length === 0 ? 0 : (page - 1) * rowsPerPage + 1}
          -
          {Math.min(page * rowsPerPage, filteredProjects.length)} of{' '}
          {filteredProjects.length} projects
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            className="button-neutral"
            onClick={() => setPage((previousPage) => Math.max(previousPage - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </button>

          <span style={{ fontWeight: 600 }}>
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            className="button-neutral"
            onClick={() => setPage((previousPage) => Math.min(previousPage + 1, totalPages))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

export default PublishManagement;