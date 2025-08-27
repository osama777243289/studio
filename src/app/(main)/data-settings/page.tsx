
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getAccounts } from '@/lib/firebase/firestore/accounts';
import { Download, Upload } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function DataSettingsPage() {
  const { toast } = useToast();
  const [importData, setImportData] = useState('');
  const [importFeedback, setImportFeedback] = useState('');

  const handleExport = async () => {
    try {
      const accounts = await getAccounts();
      const dataStr = JSON.stringify(accounts, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', 'chart_of_accounts.json');
      linkElement.click();
      
      toast({
        title: 'تم التصدير بنجاح',
        description: 'تم تنزيل ملف دليل الحسابات.',
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'فشل التصدير',
        description: 'حدث خطأ أثناء تصدير البيانات. يرجى المحاولة مرة أخرى.',
        variant: 'destructive',
      });
    }
  };

  const handleImport = async () => {
      // This is a placeholder for a real import implementation.
      // In a real scenario, this would parse the JSON and write to Firestore.
      if (!importData) {
          toast({ title: 'لا توجد بيانات', description: 'يرجى لصق بيانات JSON في الحقل.', variant: 'destructive'});
          return;
      }
      try {
        const parsedData = JSON.parse(importData);
        // Here you would typically validate the data and send it to a server action to update Firestore.
        console.log("Data to import:", parsedData);

        // For this demo, we'll just show a success message.
        setImportFeedback(`تم استيراد ${parsedData.length} من الحسابات الرئيسية بنجاح (وضع العرض التوضيحي).`);
        toast({ title: 'تم الاستيراد بنجاح', description: 'تمت معالجة بيانات دليل الحسابات.' });

      } catch (e) {
          setImportFeedback('');
          toast({ title: 'خطأ في الاستيراد', description: 'بيانات JSON غير صالحة. يرجى التحقق من المحتوى والمحاولة مرة أخرى.', variant: 'destructive'});
      }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">تصدير البيانات</CardTitle>
          <CardDescription>
            قم بتنزيل بياناتك الحالية كملف JSON للاحتفاظ بنسخة احتياطية أو للتحرير دون اتصال بالإنترنت.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExport} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            تصدير دليل الحسابات
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">استيراد البيانات</CardTitle>
          <CardDescription>
            الصق محتوى ملف JSON هنا لاستيراد دليل الحسابات. سيؤدي هذا إلى الكتابة فوق البيانات الحالية.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <Alert>
                <Info className="h-4 w-4"/>
                <AlertTitle>ميزة تجريبية</AlertTitle>
                <AlertDescription>
                   هذه الميزة مخصصة للعرض التوضيحي فقط ولن تقوم بالكتابة فوق بياناتك الفعلية في الوقت الحالي.
                </AlertDescription>
           </Alert>
          <Textarea
            placeholder="الصق محتوى JSON هنا..."
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            rows={10}
            className="ltr"
          />
           {importFeedback && <p className="text-sm text-green-600">{importFeedback}</p>}
          <Button onClick={handleImport} className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            استيراد البيانات
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
