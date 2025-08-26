'use server';

import { predictCashFlow as predictCashFlowAI, type PredictCashFlowInput, type PredictCashFlowOutput } from '@/ai/flows/cash-flow-prediction';
import { z } from 'zod';

const formSchema = z.object({
  historicalData: z.string().min(20, { message: 'Please provide more detailed historical data.' }),
  predictionHorizon: z.string().min(1, { message: 'Prediction horizon is required.' }),
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
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await predictCashFlowAI(validatedFields.data as PredictCashFlowInput);
    return { message: 'success', data: result };
  } catch (error) {
    console.error(error);
    return { message: 'Prediction failed. Please try again later.' };
  }
}
