'use server';

import { predictCashFlow as predictCashFlowAI, type PredictCashFlowInput, type PredictCashFlowOutput } from '@/ai/flows/cash-flow-prediction';
import { z } from 'zod';

const formSchema = z.object({
  historicalData: z.string().min(20, { message: 'يرجى تقديم بيانات تاريخية أكثر تفصيلاً.' }),
  predictionHorizon: z.string().min(1, { message: 'أفق التوقع مطلوب.' }),
});

export type FormState = {
    message: string;
    errors?: {
        historicalData?: string[];
        predictionHorizon?: string[];
    };
    data?: PredictCashFlowOutput
}

export async function getCashFlowPrediction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = formSchema.safeParse({
    historicalData: formData.get('historicalData'),
    predictionHorizon: formData.get('predictionHorizon'),
  });

  if (!validatedFields.success) {
    return {
      message: 'بيانات النموذج غير صالحة.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await predictCashFlowAI(validatedFields.data as PredictCashFlowInput);
    return { message: 'success', data: result };
  } catch (error) {
    console.error(error);
    return { message: 'فشل التوقع. يرجى المحاولة مرة أخرى لاحقاً.' };
  }
}
