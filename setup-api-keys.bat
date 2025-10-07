@echo off
REM =====================================================
REM Setup Script - Configure API Keys in Supabase (Windows)
REM =====================================================

echo.
echo 🔑 Setting up API keys in Supabase Edge Functions...
echo.

REM TODO: Replace with your actual API keys from .env.local
set OPENAI_KEY=your-openai-api-key-here
set SERP_KEY=your-serpapi-key-here
set PERPLEXITY_KEY=your-perplexity-key-here
set GEMINI_KEY=your-gemini-key-here

REM Check if Supabase CLI is installed
where supabase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Supabase CLI not found!
    echo Install it with: npm install -g supabase
    pause
    exit /b 1
)

echo ✅ Supabase CLI found
echo.

REM Check if project is linked
if not exist ".supabase\config.toml" (
    echo ⚠️  Project not linked to Supabase yet
    echo Run: supabase link --project-ref your-project-ref
    echo.
    set /p PROJECT_REF="Enter your Supabase project ref (from dashboard URL): "

    if defined PROJECT_REF (
        echo Linking to project: %PROJECT_REF%
        supabase link --project-ref %PROJECT_REF%
    ) else (
        echo ❌ No project ref provided. Exiting.
        pause
        exit /b 1
    )
)

echo.
echo 🚀 Setting API secrets...
echo.

REM Set each secret
echo 1/4 Setting OpenAI API key...
supabase secrets set OPENAI_API_KEY="%OPENAI_KEY%"

echo 2/4 Setting SerpAPI key...
supabase secrets set SERP_API_KEY="%SERP_KEY%"

echo 3/4 Setting Perplexity API key...
supabase secrets set PERPLEXITY_API_KEY="%PERPLEXITY_KEY%"

echo 4/4 Setting Google AI (Gemini) key...
supabase secrets set GOOGLE_AI_API_KEY="%GEMINI_KEY%"

echo.
echo ✅ All API keys configured!
echo.

REM Verify secrets
echo 📋 Verifying secrets...
supabase secrets list

echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Deploy Edge Functions: supabase functions deploy
echo 2. Test search: Your app will now use REAL event data!
echo.
pause
