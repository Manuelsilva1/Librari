
import { getDictionary } from '@/lib/dictionaries';
import type { Dictionary } from '@/types'; // Updated import
import { LoginFormClient } from './components/login-form-client';
import { PublicLayout } from '@/components/layout/public-layout'; // Import PublicLayout

interface LoginPageProps {
  params: any;
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { lang } = params;
  const dictionary = await getDictionary(lang);
  // Fallback for loginPage texts in case they are not in the dictionary yet
  const loginTexts = dictionary.loginPage || {
    title: "Admin Login",
    description: "Access the Admin Panel.",
    usernameLabel: "Username",
    usernamePlaceholder: "Enter username",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter password",
    loginButton: "Login",
    loggingIn: "Logging in..."
  };

  return (
    <PublicLayout lang={lang} dictionary={dictionary}>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-8 px-4">
        <LoginFormClient lang={lang} texts={loginTexts} />
      </div>
    </PublicLayout>
  );
}

