
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { loginUser, type FormState } from './actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Landmark, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const initialState: FormState = {
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          جاري تسجيل الدخول...
        </>
      ) : (
        'تسجيل الدخول'
      )}
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(loginUser, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Landmark className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline">تسجيل الدخول</CardTitle>
          <CardDescription>أدخل رقم الجوال وكلمة المرور للوصول إلى حسابك.</CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
             {state.errors?.server && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>خطأ في تسجيل الدخول</AlertTitle>
                    <AlertDescription>{state.errors.server}</AlertDescription>
                </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="mobile">رقم الجوال</Label>
              <Input
                id="mobile"
                name="mobile"
                type="tel"
                placeholder="05XXXXXXXX"
                required
                className="ltr"
              />
               {state.errors?.mobile && (
                <p className="text-sm font-medium text-destructive">{state.errors.mobile[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" name="password" type="password" required className="ltr" />
               {state.errors?.password && (
                <p className="text-sm font-medium text-destructive">{state.errors.password[0]}</p>
              )}
            </div>
            <SubmitButton />
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
