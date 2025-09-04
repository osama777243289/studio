
'use client';

import { useActionState, useFormStatus } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginUser, type FormState } from './actions';
import { AlertCircle, Loader2, LogIn } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const initialState: FormState = {
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          جاري التحقق...
        </>
      ) : (
        <>
         <LogIn className="mr-2 h-4 w-4" />
          تسجيل الدخول
        </>
      )}
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(loginUser, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">تسجيل الدخول</CardTitle>
          <CardDescription>
            أدخل رقم جوالك وكلمة المرور للوصول إلى حسابك.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
            <CardContent className="space-y-4">
            {state.message && state.message !== 'success' && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>خطأ في الدخول</AlertTitle>
                    <AlertDescription>{state.message}</AlertDescription>
                </Alert>
            )}
            <div className="space-y-2">
                <Label htmlFor="mobile">رقم الجوال</Label>
                <Input
                id="mobile"
                name="mobile"
                type="tel"
                placeholder="05xxxxxxxxx"
                required
                className="ltr"
                />
                 {state.errors?.mobile && (
                    <p className="text-sm font-medium text-destructive">{state.errors.mobile}</p>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input id="password" name="password" type="password" required className="ltr" />
                 {state.errors?.password && (
                    <p className="text-sm font-medium text-destructive">{state.errors.password}</p>
                )}
            </div>
             <SubmitButton />
            </CardContent>
        </form>
      </Card>
    </div>
  );
}
