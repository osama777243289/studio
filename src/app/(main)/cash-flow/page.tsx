'use client';

import { useFormState, useFormStatus } from 'react-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { getCashFlowPrediction, type FormState } from './actions';
import { AlertCircle, Bot, Loader2, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const initialState: FormState = {
  message: '',
};

const sampleData = `التاريخ,الدخل,المصروفات
2023-01-01,5000,3000
2023-02-01,6000,4000
2023-03-01,5500,3500
2023-04-01,7000,4500
2023-05-01,6500,4200
2023-06-01,7200,4800
`;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          جاري التوقع...
        </>
      ) : (
        <>
         <Sparkles className="ml-2 h-4 w-4" />
          توقع التدفق النقدي
        </>
      )}
    </Button>
  );
}

export default function CashFlowPage() {
  const [state, formAction] = useFormState(getCashFlowPrediction, initialState);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">توقع التدفق النقدي</CardTitle>
          <CardDescription>
            استخدم الذكاء الاصطناعي لتوقع التدفقات النقدية المستقبلية بناءً على البيانات التاريخية.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="historicalData">البيانات التاريخية</Label>
              <Textarea
                id="historicalData"
                name="historicalData"
                placeholder="أدخل البيانات التاريخية (مثال: التاريخ,الدخل,المصروفات...)"
                rows={10}
                defaultValue={sampleData}
              />
               {state.errors?.historicalData && (
                <p className="text-sm font-medium text-destructive">{state.errors.historicalData}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="predictionHorizon">أفق التوقع</Label>
              <Select name="predictionHorizon" defaultValue="3 months">
                <SelectTrigger id="predictionHorizon">
                  <SelectValue placeholder="اختر الأفق" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 month">شهر واحد</SelectItem>
                  <SelectItem value="3 months">3 أشهر</SelectItem>
                  <SelectItem value="6 months">6 أشهر</SelectItem>
                  <SelectItem value="1 year">سنة واحدة</SelectItem>
                </SelectContent>
              </Select>
               {state.errors?.predictionHorizon && (
                <p className="text-sm font-medium text-destructive">{state.errors.predictionHorizon}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
      
      <div className="space-y-4">
         <Card className="flex-1 flex flex-col">
            <CardHeader className="flex flex-row items-center gap-2">
                <Bot className="h-6 w-6 text-primary"/>
                <CardTitle className="font-headline">تحليل الذكاء الاصطناعي</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
                {state.message === 'success' && state.data ? (
                    <div className="space-y-4 text-sm w-full">
                        <Alert>
                           <AlertTitle className="font-semibold">التدفق النقدي المتوقع</AlertTitle>
                           <AlertDescription>{state.data.predictedCashFlow}</AlertDescription>
                        </Alert>
                         <Alert>
                           <AlertTitle className="font-semibold">مستوى الثقة</AlertTitle>
                           <AlertDescription>{state.data.confidenceLevel}</AlertDescription>
                        </Alert>
                         <Alert>
                           <AlertTitle className="font-semibold">الأساس المنطقي</AlertTitle>
                           <AlertDescription>{state.data.rationale}</AlertDescription>
                        </Alert>
                    </div>
                ) : state.message && state.message !== 'success' ? (
                     <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>خطأ</AlertTitle>
                        <AlertDescription>{state.message}</AlertDescription>
                    </Alert>
                ) : (
                    <p className="text-muted-foreground">ستظهر نتائج التوقع هنا.</p>
                )}
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
