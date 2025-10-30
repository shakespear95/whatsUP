@echo off
echo ========================================
echo Deploying search-events to Supabase
echo ========================================
echo.

echo Step 1: Checking Supabase CLI...
npx supabase --version
if errorlevel 1 (
    echo ERROR: Supabase CLI not found
    pause
    exit /b 1
)

echo.
echo Step 2: Deploying search-events function...
npx supabase functions deploy search-events --project-ref ozezwaqtumofuybazkvo

if errorlevel 1 (
    echo.
    echo ========================================
    echo DEPLOYMENT FAILED!
    echo ========================================
    echo.
    echo You may need to login first:
    echo   npx supabase login
    echo.
    echo Or set your access token:
    echo   set SUPABASE_ACCESS_TOKEN=your_token_here
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo DEPLOYMENT SUCCESSFUL!
echo ========================================
echo.
echo The search-events function has been deployed.
echo Wait 30 seconds, then refresh your app.
echo.
pause
