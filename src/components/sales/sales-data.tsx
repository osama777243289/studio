import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Trash2 } from 'lucide-react';

export function SalesData() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            <CardTitle>عرض بيانات المبيعات</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center">
          لا توجد بيانات مبيعات متاحة للتاريخ والفترة المحددة. يرجى إدخال بيانات المبيعات أعلاه أو اختيار تاريخ آخر.
        </p>
      </CardContent>
      <CardFooter className='justify-center'>
        <Button variant="destructive">
            <Trash2 className="ml-2 h-4 w-4" />
            حذف تقارير يوم 9 و 10 (تجريبي)
        </Button>
      </CardFooter>
    </Card>
  );
}
