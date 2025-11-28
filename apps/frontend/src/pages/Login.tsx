import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { useRBACStore } from '@/stores/rbac-store';
import { authService } from '@/services/auth-service';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

export const Login = () => {
  const navigate = useNavigate();
  const { setUser, setToken, setIsLoading, setError } = useAuthStore();
  const { setCurrentUser } = useRBACStore();

  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [localError, setLocalError] = useState<string>('');
  const [isLoading, setIsLoadingLocal] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setIsLoadingLocal(true);
    setIsLoading(true);

    try {
      if (!clientId || !clientSecret) {
        throw new Error('Please enter both client ID and secret');
      }

      // Issue token
      const tokenResponse = await authService.issueToken({
        clientId,
        clientSecret,
        grantType: 'client_credentials',
      });

      // Store tokens
      authService.storeTokens(tokenResponse.accessToken, tokenResponse.refreshToken);

      // Store token in auth store
      setToken({
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken,
        expiresIn: tokenResponse.expiresIn,
        tokenType: tokenResponse.tokenType,
      });

      // Try to fetch current user profile
      try {
        const userProfile = await authService.getCurrentUser();
        setUser({
          id: userProfile.id,
          email: userProfile.email,
          name: userProfile.name,
          role: userProfile.role,
          organizationId: userProfile.organizationId,
        });
        setCurrentUser({
          id: userProfile.id,
          email: userProfile.email,
          name: userProfile.name,
          role: userProfile.role,
        });
      } catch (profileError) {
        // If user profile fetch fails, create a basic user object from clientId
        const basicUser = {
          id: clientId,
          email: `${clientId}@dataspace.local`,
          name: clientId,
          role: 'participant' as const,
        };
        setUser(basicUser);
        setCurrentUser(basicUser);
      }

      // Redirect to dashboard
      navigate('/', { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed. Please try again.';
      setLocalError(message);
      setError(message);
      authService.clearTokens();
    } finally {
      setIsLoadingLocal(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-indigo-600 text-white rounded-lg p-3 mb-4">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Dataspace</h1>
          <p className="text-gray-600 mt-2">Data Sharing Platform</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-600 mb-6">
              Enter your OAuth2 credentials to access the platform
            </p>

            {localError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                <div className="flex">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{localError}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Client ID Input */}
              <div>
                <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-2">
                  Client ID
                </label>
                <input
                  id="clientId"
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="Enter your client ID"
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
                />
              </div>

              {/* Client Secret Input */}
              <div>
                <label htmlFor="clientSecret" className="block text-sm font-medium text-gray-700 mb-2">
                  Client Secret
                </label>
                <input
                  id="clientSecret"
                  type="password"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder="Enter your client secret"
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !clientId || !clientSecret}
                className="w-full mt-6"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </div>
        </Card>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Demo Credentials:</span>
            <br />
            Use your OAuth2 client credentials provided during registration.
            If you don't have credentials, contact your administrator.
          </p>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Need help?{' '}
            <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
