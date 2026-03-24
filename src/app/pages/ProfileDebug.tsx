import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export default function ProfileDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    debugSession();
  }, []);

  const debugSession = async () => {
    const info: any = {};
    
    try {
      // Environment info
      info.projectId = projectId;
      info.hasAnonKey = !!publicAnonKey;
      info.anonKeyPreview = publicAnonKey?.substring(0, 30) + '...';
      
      // 1. Check session
      console.log('🔍 Getting current session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      info.sessionError = sessionError?.message || null;
      info.hasSession = !!session;
      info.hasAccessToken = !!session?.access_token;
      info.tokenLength = session?.access_token?.length || 0;
      info.tokenPreview = session?.access_token?.substring(0, 50) + '...';
      info.userId = session?.user?.id || null;
      info.userEmail = session?.user?.email || null;
      info.userMetadata = session?.user?.user_metadata || {};

      // 2. Try getting user directly (frontend method)
      console.log('🔍 Getting user directly from frontend...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      info.directUserError = userError?.message || null;
      info.directUserSuccess = !!user;
      info.directUserId = user?.id || null;
      info.directUserEmail = user?.email || null;

      // 3. Try refreshing session
      console.log('🔄 Refreshing session...');
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
      
      info.refreshError = refreshError?.message || null;
      info.refreshSuccessful = !refreshError;
      info.refreshedTokenLength = refreshedSession?.access_token?.length || 0;
      info.refreshedTokenPreview = refreshedSession?.access_token?.substring(0, 50) + '...';
      
      // Use refreshed session if available
      const activeSession = refreshedSession || session;

      // 4. Try to call backend (for comparison)
      if (activeSession?.access_token) {
        try {
          const backendUrl = `https://${projectId}.supabase.co/functions/v1/make-server-b69488c3/user/profile`;
          info.backendUrl = backendUrl;
          
          console.log('📡 Calling backend with', refreshedSession ? 'REFRESHED' : 'ORIGINAL', 'token...');
          const response = await fetch(backendUrl, {
            headers: {
              'Authorization': `Bearer ${activeSession.access_token}`,
              'Content-Type': 'application/json'
            }
          });

          info.backendStatus = response.status;
          info.backendStatusText = response.statusText;
          info.backendOk = response.ok;
          info.usedRefreshedToken = !!refreshedSession;
          
          // Try to get response body
          const responseText = await response.text();
          info.backendRawResponse = responseText.substring(0, 500); // Limit size
          
          try {
            const data = JSON.parse(responseText);
            info.backendResponse = data;
          } catch (parseErr) {
            info.backendParseError = 'Could not parse JSON response';
          }
        } catch (fetchError: any) {
          info.backendError = fetchError.message;
          info.backendErrorStack = fetchError.stack;
        }
      } else {
        info.backendSkipped = 'No access token available';
      }

      setDebugInfo(info);
      setLoading(false);
    } catch (err: any) {
      info.generalError = err.message;
      info.generalErrorStack = err.stack;
      setDebugInfo(info);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading debug info...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Profile Debug Information</h1>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-4">
          <h2 className="text-xl font-semibold mb-3">Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="font-semibold w-48">Has Session:</span>
              <span className={debugInfo.hasSession ? 'text-green-600' : 'text-red-600'}>
                {debugInfo.hasSession ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold w-48">Has Access Token:</span>
              <span className={debugInfo.hasAccessToken ? 'text-green-600' : 'text-red-600'}>
                {debugInfo.hasAccessToken ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold w-48">Token Length:</span>
              <span>{debugInfo.tokenLength || 'N/A'}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold w-48">Direct User Method:</span>
              <span className={debugInfo.directUserSuccess ? 'text-green-600' : 'text-red-600'}>
                {debugInfo.directUserSuccess ? '✅ Success' : '❌ Failed'}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold w-48">Session Refresh:</span>
              <span className={debugInfo.refreshSuccessful ? 'text-green-600' : 'text-yellow-600'}>
                {debugInfo.refreshSuccessful ? '✅ Success' : '⚠️ Failed/Skipped'}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold w-48">Backend Status:</span>
              <span className={debugInfo.backendOk ? 'text-green-600' : 'text-red-600'}>
                {debugInfo.backendStatus || 'N/A'} {debugInfo.backendStatusText || ''}
              </span>
            </div>
            {debugInfo.backendResponse?.error && (
              <div className="flex gap-2">
                <span className="font-semibold w-48">Backend Error:</span>
                <span className="text-red-600">{debugInfo.backendResponse.error}</span>
              </div>
            )}
            {debugInfo.backendResponse?.details && (
              <div className="flex gap-2">
                <span className="font-semibold w-48">Error Details:</span>
                <span className="text-red-600">{debugInfo.backendResponse.details}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-6 mb-4 border border-teal-200">
          <h2 className="text-xl font-semibold mb-3 text-teal-900">✅ Solution Implemented</h2>
          <p className="text-teal-800 mb-2">
            Profile page now uses <strong>direct frontend Supabase client</strong> instead of backend API calls.
          </p>
          <p className="text-teal-700 text-sm">
            This avoids JWT validation issues and is more efficient for simple profile data.
          </p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-3">Full Debug Data</h2>
          <pre className="text-xs overflow-auto bg-slate-50 p-4 rounded-lg max-h-96">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        <button
          onClick={debugSession}
          className="mt-4 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700"
        >
          Refresh Debug Info
        </button>
      </div>
    </div>
  );
}