import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SoftComfortBrand } from '@/components/common/SoftComfortBrand';
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="pointer-events-none absolute inset-0 softcomfort-grid opacity-30" />
      <div className="pointer-events-none absolute -left-40 -top-48 h-[34rem] w-[34rem] rounded-full bg-primary/15 blur-[110px]" />
      <div className="pointer-events-none absolute -bottom-56 -right-32 h-[36rem] w-[36rem] rounded-full bg-brand-gold/10 blur-[120px]" />

      <div className="relative w-full max-w-md">
        <div className="mb-7 flex flex-col items-center text-center">
          <SoftComfortBrand
            className="justify-center"
            imageClassName="h-16 w-16 rounded-[20px]"
            showTagline={false}
          />
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.22em] text-brand-gold">
            Design · Comfort · Innovazione
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">
            Gestionale Soft Comfort
          </h1>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Controllo operativo di vendite, magazzino, ordini e contabilità.
          </p>
        </div>

        <Card className="border-white/10 bg-card/[0.82] shadow-[0_32px_90px_rgba(0,0,0,0.48)] backdrop-blur-xl">
          <div className="brand-divider h-px w-full" />
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg">Accesso riservato</CardTitle>
            <CardDescription>Inserisci le credenziali aziendali</CardDescription>
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
                <p role="alert" className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {serverError}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Accedi al gestionale
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-5 text-center text-[10px] uppercase tracking-[0.16em] text-muted-foreground/[0.65]">
          Soft Comfort · Palermo &amp; Bagheria
        </p>
      </div>
    </div>
  );
}
