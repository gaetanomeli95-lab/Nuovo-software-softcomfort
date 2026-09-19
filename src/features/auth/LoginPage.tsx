import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from './AuthContext';
import { ApiError } from '@/services/api/http';

const loginSchema = z.object({
  username: z.string().min(1, 'Inserisci il nome utente'),
  password: z.string().min(1, 'Inserisci la password'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const onSubmit = async (values: LoginForm) => {
    setServerError(null);
    try {
      await login(values.username, values.password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setServerError('Credenziali non valide.');
      } else if (err instanceof ApiError && err.status === 0) {
        setServerError('Server non raggiungibile.');
      } else {
        setServerError('Accesso non riuscito. Riprova.');
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Store className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Gestionale</h1>
          <p className="text-sm text-muted-foreground">Vendite, magazzino e contabilità</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Accedi</CardTitle>
            <CardDescription>Inserisci le tue credenziali</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="username">Nome utente</Label>
                <Input
                  id="username"
                  autoComplete="username"
                  autoFocus
                  {...register('username')}
                  aria-invalid={Boolean(errors.username)}
                />
                {errors.username && (
                  <p className="text-xs text-destructive">{errors.username.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register('password')}
                  aria-invalid={Boolean(errors.password)}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              {serverError && (
                <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {serverError}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Accedi
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
