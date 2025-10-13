// Authentication Debugging Utilities
import { supabase } from '../lib/supabase';

export async function testDatabaseConnection() {
  console.log('🔍 Testing Supabase Connection...');

  try {
    // Test 1: Check if we can connect to Supabase
    const { data: healthCheck, error: healthError } = await supabase
      .from('events')
      .select('count')
      .limit(1);

    if (healthError) {
      console.error('❌ Database connection failed:', healthError);
      return false;
    }

    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

export async function checkAuthState() {
  console.log('🔍 Checking Authentication State...');

  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('❌ Session error:', sessionError);
      return null;
    }

    if (!session) {
      console.log('ℹ️ No active session');
      return null;
    }

    console.log('✅ Active session found:');
    console.log('  - User ID:', session.user.id);
    console.log('  - Email:', session.user.email);
    console.log('  - Provider:', session.user.app_metadata.provider);
    console.log('  - Last Sign In:', session.user.last_sign_in_at);

    return session.user;
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return null;
  }
}

export async function checkUserInDatabase() {
  console.log('🔍 Checking if user exists in auth.users table...');

  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('❌ Error fetching user:', error);
      return false;
    }

    if (!user) {
      console.log('ℹ️ No user logged in');
      return false;
    }

    console.log('✅ User found in database:');
    console.log('  - User ID:', user.id);
    console.log('  - Email:', user.email);
    console.log('  - Created At:', user.created_at);
    console.log('  - Providers:', user.identities?.map(i => i.provider).join(', '));

    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

export async function checkUserPreferences() {
  console.log('🔍 Checking user preferences table...');

  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*');

    if (error) {
      console.error('❌ Error querying preferences:', error);
      return null;
    }

    console.log('✅ User preferences query successful');
    console.log('  - Records found:', data?.length || 0);

    return data;
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return null;
  }
}

export async function checkUserSavedEvents() {
  console.log('🔍 Checking user saved events table...');

  try {
    const { data, error } = await supabase
      .from('user_saved_events')
      .select('*');

    if (error) {
      console.error('❌ Error querying saved events:', error);
      return null;
    }

    console.log('✅ User saved events query successful');
    console.log('  - Records found:', data?.length || 0);

    return data;
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return null;
  }
}

export async function runFullDiagnostics() {
  console.log('\n🚀 Running Full Authentication Diagnostics...\n');

  const results = {
    dbConnection: await testDatabaseConnection(),
    authState: await checkAuthState(),
    userInDb: await checkUserInDatabase(),
    preferences: await checkUserPreferences(),
    savedEvents: await checkUserSavedEvents(),
  };

  console.log('\n📊 Diagnostic Results:');
  console.log('  - Database Connected:', results.dbConnection ? '✅' : '❌');
  console.log('  - User Authenticated:', results.authState ? '✅' : '❌');
  console.log('  - User in Database:', results.userInDb ? '✅' : '❌');
  console.log('  - Preferences Table Accessible:', results.preferences !== null ? '✅' : '❌');
  console.log('  - Saved Events Table Accessible:', results.savedEvents !== null ? '✅' : '❌');

  return results;
}

// Add to window object for easy console access
if (typeof window !== 'undefined') {
  (window as any).authDebug = {
    testConnection: testDatabaseConnection,
    checkAuth: checkAuthState,
    checkUserInDb: checkUserInDatabase,
    checkPreferences: checkUserPreferences,
    checkSavedEvents: checkUserSavedEvents,
    runDiagnostics: runFullDiagnostics,
  };

  console.log('🛠️ Auth debugging tools loaded! Use window.authDebug in console:');
  console.log('  - window.authDebug.testConnection()');
  console.log('  - window.authDebug.checkAuth()');
  console.log('  - window.authDebug.checkUserInDb()');
  console.log('  - window.authDebug.runDiagnostics()');
}
