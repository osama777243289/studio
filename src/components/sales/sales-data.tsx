import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, Upload } from 'lucide-react';

export function SalesData() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className='flex items-center gap-2'>
                 <Copy className="h-5 w-5" />
                 <CardTitle>عرض بيانات المبيعات</CardTitle>
            </div>
            <Button variant="secondary">
                رفع للمطابقة
                <Upload className="mr-2 h-4 w-4" />
            </Button>
        </div>
         <CardDescription>
           عرض تفصيلي لبيانات المبيعات المدخلة قبل رفعها للمطابقة.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center">
          لا توجد بيانات مبيعات متاحة للتاريخ والفترة المحددة. يرجى إدخال بيانات المبيعات أعلاه أو اختيار سجل آخر.
        </p>
      </CardContent>
    </Card>
  );
}
