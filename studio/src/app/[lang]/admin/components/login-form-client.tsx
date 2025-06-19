
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CorreoLibroLogo } from '@/components/icons/logo';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-provider';
import { loginUser } from '@/services/api'; // Import the new loginUser function
import type { ApiResponseError } from '@/types'; // Import ApiResponseError

interface LoginFormClientProps {
  lang: string;
  texts: {
    title: string;
    description: string;
    usernameLabel: string; // Will be treated as email
    usernamePlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    loginButton: string;
    loggingIn: string;
    errorMessage?: string; // Optional error message from dictionary
  };
}

export function LoginFormClient({ lang, texts }: LoginFormClientProps) {
  const router = useRouter();
  const { login } = useAuth(); // Get login function
  const [email, setEmail] = useState(''); // Changed from username to email
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = await loginUser({ email, password }); // Use the new API service
      // The loginUser function now returns { token, usuario }
      // The service handles response.ok and parsing JSON internally
      // It will throw an error if not successful, which is caught below

      login(data.token, data.usuario); // data.usuario should be the user object from API
      router.push(`/${lang}/admin/panel`);

    } catch (err: unknown) { // Catch as unknown for safer type checking
      let messageToDisplay = texts.errorMessage || "Login failed";
      let diagnosticMessage = "An unknown error occurred during login.";

      if (typeof err === 'object' && err !== null) {
        if ('message' in err && typeof (err as { message: unknown }).message === 'string' && (err as { message: string }).message) {
          // Standard Error object or ApiResponseError-like object with a message
          messageToDisplay = (err as { message: string }).message;
          diagnosticMessage = `Login failed: ${messageToDisplay}`;
        } else {
          // Object without a standard message property, try to stringify
          try {
            diagnosticMessage = `Login failed with non-standard error object: ${JSON.stringify(err)}`;
          } catch (stringifyError) {
            diagnosticMessage = "Login failed with unstringifiable non-standard error object.";
          }
        }
        // For more detailed logging in the actual browser console (not necessarily the overlay)
        console.debug("Original error object during login:", err);
      } else if (typeof err === 'string' && err) {
        // Error is a simple string
        messageToDisplay = err;
        diagnosticMessage = `Login failed: ${err}`;
        console.debug("Original error string during login:", err);
      }
      
      setError(messageToDisplay);
      // This console.error is what the Next.js overlay will likely pick up and display.
      // Using a clear string message here avoids the "{}" issue in the overlay.
      console.error(diagnosticMessage); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl rounded-lg">
      <CardHeader className="text-center space-y-2">
        <CorreoLibroLogo className="w-16 h-16 mx-auto text-primary" />
        <CardTitle className="font-headline text-3xl">{texts.title}</CardTitle>
        <CardDescription>{texts.description}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-100 p-2 rounded">
              {error}
            </div>
          )}
          <div className="space-y-2">
            {/* Assuming usernameLabel is actually for email */}
            <Label htmlFor="email">{texts.usernameLabel}</Label> 
            <Input
              id="email" // Changed from username to email
              placeholder={texts.usernamePlaceholder} // Assuming placeholder is suitable for email
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-base"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{texts.passwordLabel}</Label>
            <Input
              id="password"
              type="password"
              placeholder={texts.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="text-base"
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full font-headline text-lg" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {isLoading ? texts.loggingIn : texts.loginButton}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
