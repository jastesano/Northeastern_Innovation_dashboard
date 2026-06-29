import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import ReviewerDashboard from './ReviewerDashboard';
import AdminDashboard from './AdminDashboard';
import PublishManagement from '../components/PublishManagement';
import '../styles/Reviewer.css';

function ReviewerAdminPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('reviewer');

  useEffect(() => {
    const savedLogin = localStorage.getItem('innovation_dashboard_review_admin_login');

    if (savedLogin === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  async function handleLogin(event) {
    event.preventDefault();

    const enteredCode = accessCode.trim();

    if (!enteredCode) {
      setLoginError('Please enter the access code.');
      return;
    }

    setLoginLoading(true);
    setLoginError('');

    const { data, error } = await supabase.rpc('verify_reviewer_admin_access', {
      input_access_code: enteredCode,
    });

    if (error) {
      console.error('Access verification error:', error);
      setLoginError('Unable to verify access code. Please try again.');
      setLoginLoading(false);
      return;
    }

    if (data === true) {
      localStorage.setItem('innovation_dashboard_review_admin_login', 'true');

      window.dispatchEvent(new Event('reviewerAdminLoginChanged'));

      setIsLoggedIn(true);
      setAccessCode('');
      setLoginError('');
    } else {
      setLoginError('Invalid access code. Please try again.');
    }

    setLoginLoading(false);
  }

  function handleLogout() {
    localStorage.removeItem('innovation_dashboard_review_admin_login');

    window.dispatchEvent(new Event('reviewerAdminLoginChanged'));

    setIsLoggedIn(false);
    setActiveTab('reviewer');
    setAccessCode('');
    setLoginError('');
  }

  if (!isLoggedIn) {
    return (
      <div className="reviewer-page">
        <div className="reviewer-container">
          <section className="reviewer-card login-card">
            <h1 className="reviewer-title">Reviewer/Admin Access</h1>
            <p className="reviewer-subtitle">
              Please enter the shared access code to view the Reviewer and Admin tools.
            </p>

            <form onSubmit={handleLogin} className="login-form">
              <label className="login-label" htmlFor="access-code">
                Access Code
              </label>

              <input
                id="access-code"
                className="login-input"
                type="password"
                value={accessCode}
                onChange={(event) => setAccessCode(event.target.value)}
                placeholder="Enter access code"
                autoComplete="off"
              />

              {loginError && <div className="message-error">{loginError}</div>}

              <button type="submit" className="button-primary" disabled={loginLoading}>
                {loginLoading ? 'Checking...' : 'Login'}
              </button>
            </form>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="reviewer-page">
      <div className="reviewer-container">
        <section className="reviewer-card reviewer-admin-shell">
          <div className="reviewer-card-header">
            <div>
              <h1 className="reviewer-title">Reviewer/Admin Portal</h1>
              <p className="reviewer-subtitle">
                Use the tabs below to review submissions, monitor the workflow, or manage published projects.
              </p>
            </div>

            <button type="button" className="button-neutral" onClick={handleLogout}>
              Logout
            </button>
          </div>

          <div className="reviewer-admin-tabs">
            <button
              type="button"
              className={
                activeTab === 'reviewer'
                  ? 'reviewer-admin-tab reviewer-admin-tab-active'
                  : 'reviewer-admin-tab'
              }
              onClick={() => setActiveTab('reviewer')}
            >
              Reviewer
            </button>

            <button
              type="button"
              className={
                activeTab === 'admin'
                  ? 'reviewer-admin-tab reviewer-admin-tab-active'
                  : 'reviewer-admin-tab'
              }
              onClick={() => setActiveTab('admin')}
            >
              Admin
            </button>

            <button
              type="button"
              className={
                activeTab === 'publishManagement'
                  ? 'reviewer-admin-tab reviewer-admin-tab-active'
                  : 'reviewer-admin-tab'
              }
              onClick={() => setActiveTab('publishManagement')}
            >
              Publish Management
            </button>
          </div>
        </section>

        {activeTab === 'reviewer' && <ReviewerDashboard embedded />}

        {activeTab === 'admin' && <AdminDashboard embedded />}

        {activeTab === 'publishManagement' && <PublishManagement />}
      </div>
    </div>
  );
}

export default ReviewerAdminPortal;