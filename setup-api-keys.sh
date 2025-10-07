#!/bin/bash

# =====================================================
# Setup Script - Configure API Keys in Supabase
# =====================================================

echo "🔑 Setting up API keys in Supabase Edge Functions..."
echo ""

# TODO: Replace with your actual API keys from .env.local
OPENAI_KEY="your-openai-api-key-here"
SERP_KEY="your-serpapi-key-here"
PERPLEXITY_KEY="your-perplexity-key-here"
GEMINI_KEY="your-gemini-key-here"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found!"
    echo "Install it with: npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Check if project is linked
if [ ! -f ".supabase/config.toml" ]; then
    echo "⚠️  Project not linked to Supabase yet"
    echo "Run: supabase link --project-ref your-project-ref"
    echo ""
    read -p "Enter your Supabase project ref (from dashboard URL): " PROJECT_REF

    if [ -n "$PROJECT_REF" ]; then
        echo "Linking to project: $PROJECT_REF"
        supabase link --project-ref $PROJECT_REF
    else
        echo "❌ No project ref provided. Exiting."
        exit 1
    fi
fi

echo ""
echo "🚀 Setting API secrets..."
echo ""

# Set each secret
echo "1/4 Setting OpenAI API key..."
supabase secrets set OPENAI_API_KEY="$OPENAI_KEY"

echo "2/4 Setting SerpAPI key..."
supabase secrets set SERP_API_KEY="$SERP_KEY"

echo "3/4 Setting Perplexity API key..."
supabase secrets set PERPLEXITY_API_KEY="$PERPLEXITY_KEY"

echo "4/4 Setting Google AI (Gemini) key..."
supabase secrets set GOOGLE_AI_API_KEY="$GEMINI_KEY"

echo ""
echo "✅ All API keys configured!"
echo ""

# Verify secrets
echo "📋 Verifying secrets..."
supabase secrets list

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Deploy Edge Functions: supabase functions deploy"
echo "2. Test search: Your app will now use REAL event data!"
echo ""
