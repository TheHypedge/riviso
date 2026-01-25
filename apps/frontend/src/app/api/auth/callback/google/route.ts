import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

/**
 * Google OAuth 2.0 Callback Handler
 * 
 * This endpoint receives the authorization code from Google after user consent.
 * It exchanges the code for tokens via the backend API and redirects to the appropriate page.
 * 
 * Flow:
 * 1. Google redirects here with ?code=xxx&state=xxx
 * 2. We exchange code for tokens via backend (state contains userId)
 * 3. Backend stores tokens and returns connection status
 * 4. Redirect user to success/error page
 * 
 * Note: This is a public endpoint (no auth required) as Google redirects here.
 * The userId is extracted from the state parameter for security.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
  const settingsUrl = `${frontendUrl}/dashboard/settings`;

  // Handle OAuth errors from Google
  if (error) {
    console.error('[OAuth Callback] Google OAuth error:', error);
    const errorMessage = error === 'access_denied' 
      ? 'access_denied' 
      : encodeURIComponent(error);
    return NextResponse.redirect(
      new URL(`${settingsUrl}?oauth_error=${errorMessage}`, request.url)
    );
  }

  // Validate required parameters
  if (!code || !state) {
    console.error('[OAuth Callback] Missing OAuth parameters:', { code: !!code, state: !!state });
    return NextResponse.redirect(
      new URL(`${settingsUrl}?oauth_error=missing_code_or_state`, request.url)
    );
  }

  try {
    console.log('[OAuth Callback] Processing OAuth callback', { 
      code: code.substring(0, 20) + '...', 
      state: state.substring(0, 20) + '...' 
    });

    // Get access token from cookies (if available) for authenticated backend call
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value || 
      (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);

    // Exchange authorization code for tokens via backend
    // State contains userId, so backend can process without requiring JWT
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await axios.post(
      `${API_URL}/v1/integrations/gsc/callback`,
      { code, state },
      { headers }
    );

    console.log('[OAuth Callback] Successfully connected GSC');

    // Success - redirect to settings with success message
    return NextResponse.redirect(
      new URL(`${settingsUrl}?oauth_success=1`, request.url)
    );
  } catch (err: any) {
    console.error('[OAuth Callback] OAuth callback error:', err);
    
    const errorData = err?.response?.data;
    const errorMessage = errorData?.error?.message 
      || errorData?.message 
      || err?.message 
      || 'oauth_failed';
    
    console.error('[OAuth Callback] Error details:', {
      status: err?.response?.status,
      message: errorMessage,
      data: errorData,
    });
    
    return NextResponse.redirect(
      new URL(`${settingsUrl}?oauth_error=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}
