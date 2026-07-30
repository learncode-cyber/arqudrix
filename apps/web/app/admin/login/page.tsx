import { LoginForm } from "./login-form";

export const metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-brand">AR Qudrix Admin</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in with your administrator account.</p>
        <LoginForm />
      </div>
    </div>
  );
}
