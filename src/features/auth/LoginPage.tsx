import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, Loader2 } from 'lucide-react';
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
  const { login, loginDemo } = useAuth();
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
        setServerError(err.message || 'Server non raggiungibile.');
      } else {
        setServerError('Accesso non riuscito. Riprova.');
      }
    }
  };

  const enterDemo = () => {
    loginDemo();
    navigate('/', { replace: true });
  };

  return (
    <div className="softcomfort-shell relative flex min-h-screen items-center justify-center overflow-hidden p-4 text-[#f8f4ee]">
      <div className="pointer-events-none absolute -left-40 -top-48 h-[34rem] w-[34rem] rounded-full bg-primary/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-56 -right-32 h-[36rem] w-[36rem] rounded-full bg-[#d9a858]/10 blur-[125px]" />

      <div className="relative w-full max-w-md">
        <div className="mb-7 flex flex-col items-center text-center">
          <SoftComfortBrand
            className="justify-center text-[#f8f4ee]"
            imageClassName="h-16 w-16 rounded-[20px]"
            showTagline={false}
          />
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.22em] text-[#d9a858]">
            Design · Comfort · Innovazione
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#f8f4ee]">
            Gestionale Soft Comfort
          </h1>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#c9c0bb]">
            Controllo operativo di vendite, magazzino, ordini e contabilità.
          </p>
        </div>

        <Card className="border-white/10 bg-[#fffefd] shadow-[0_32px_90px_rgba(0,0,0,0.34)]">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-xl">Accesso riservato</CardTitle>
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
                <p role="alert" className="rounded-xl border border-destructive/20 bg-[#fff0f2] px-3 py-2.5 text-xs text-destructive">
                  {serverError}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Accedi al gestionale
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#e8e0d8]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                oppure
              </span>
              <div className="h-px flex-1 bg-[#e8e0d8]" />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-[#e1cda9] bg-[#fffaf0] text-[#6f4d19] hover:bg-[#fbf2df]"
              onClick={enterDemo}
            >
              <Eye className="h-4 w-4" />
              Entra in modalità demo
            </Button>
            <p className="mt-2.5 text-center text-[11px] leading-relaxed text-muted-foreground">
              Per vedere il nuovo gestionale senza collegamento al server aziendale.
              I dati mostrati sono dimostrativi.
            </p>
          </CardContent>
        </Card>

        <p className="mt-5 text-center text-[10px] uppercase tracking-[0.16em] text-[#978b84]">
          Soft Comfort · Palermo &amp; Bagheria
        </p>
      </div>
    </div>
  );
}
