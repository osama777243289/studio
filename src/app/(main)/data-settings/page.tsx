
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Download, Upload } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

// This is the sample data from the Chart of Accounts page.
const sampleAccounts = [
    {
        id: '1', code: '1', name: 'الأصول', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'Balance Sheet', classifications: [],
        children: [
            {
                id: '101', code: '11', name: 'الأصول المتداولة', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'Balance Sheet', classifications: [],
                children: [
                    { id: '10101', code: '1101', name: 'النقدية', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'Balance Sheet', classifications: ['Cashbox', 'Bank'], children: [] },
                    { id: '10102', code: '1102', name: 'العملاء', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'Balance Sheet', classifications: ['Clients'], children: [] },
                ]
            },
            {
                id: '102', code: '12', name: 'الأصول الثابتة', type: 'Debit', group: 'Assets', status: 'Active', closingType: 'Balance Sheet', classifications: ['Fixed Assets'], children: []
            }
        ]
    },
    {
        id: '2', code: '2', name: 'الخصوم', type: 'Credit', group: 'Liabilities', status: 'Active', closingType: 'Balance Sheet', classifications: [],
        children: [
            { id: '201', code: '21', name: 'الموردون', type: 'Credit', group: 'Liabilities', status: 'Active', closingType: 'Balance Sheet', classifications: ['Suppliers'], children: [] }
        ]
    },
    {
        id: '4', code: '4', name: 'الإيرادات', type: 'Credit', group: 'Revenues', status: 'Active', closingType: 'Income Statement', classifications: ['Revenues'],
        children: [
             { id: '401', code: '401', name: 'إيرادات المبيعات', type: 'Credit', group: 'Revenues', status: 'Active', closingType: 'Income Statement', classifications: ['Revenues'], children: [] }
        ]
    },
    {
        id: '5', code: '5', name: 'المصروفات', type: 'Debit', group: 'Expenses', status: 'Active', closingType: 'Income Statement', classifications: ['Expenses'],
        children: [
            { id: '501', code: '501', name: 'مصروفات الرواتب', type: 'Debit', group: 'Expenses', status: 'Active', closingType: 'Income Statement', classifications: ['Expenses', 'Employee'], children: [] }
        ]
    }
];

export default function DataSettingsPage() {
  const { toast } = useToast();
  const [dataToImport, setDataToImport] = useState('');

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(sampleAccounts, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'chart_of_accounts.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: 'Export Successful',
        description: 'Your Chart of Accounts data has been downloaded.',
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'Could not export your data. Please check the console for errors.',
        variant: 'destructive',
      });
    }
  };

  const handleImport = () => {
    if (!dataToImport) {
      toast({
        title: 'No Data to Import',
        description: 'Please paste your data into the text area before importing.',
        variant: 'destructive',
      });
      return;
    }
    try {
      // In a real app, you would parse this and save it.
      // Here, we just validate it's a valid JSON.
      JSON.parse(dataToImport);
      toast({
        title: 'Import Successful',
        description: 'Your data has been imported. (This is a demo and data is not actually saved).',
      });
    } catch (error) {
      console.error('Import failed:', error);
      toast({
        title: 'Import Failed',
        description: 'The data you pasted is not valid JSON. Please check the format and try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Settings</CardTitle>
          <CardDescription>Export your current data or import data from a file.</CardDescription>
        </CardHeader>
        <CardContent>
           <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Demo Mode Feature</AlertTitle>
              <AlertDescription>
                This page is a workaround due to the Firebase connection issues. You can export the current sample data, edit it, and paste it back to import. The "imported" data will not persist if you refresh the page.
              </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
            <CardDescription>Download your current Chart of Accounts as a JSON file.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExport} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Export Chart of Accounts
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import Data</CardTitle>
            <CardDescription>Paste the content of your JSON file here to import it.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your JSON data here..."
              className="h-48"
              value={dataToImport}
              onChange={(e) => setDataToImport(e.target.value)}
            />
            <Button onClick={handleImport} className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Import Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
