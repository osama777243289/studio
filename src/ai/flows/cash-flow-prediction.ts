'use server';

/**
 * @fileOverview Predicts future cash flow based on historical data.
 *
 * - predictCashFlow - Predicts future cash flow based on historical data.
 * - PredictCashFlowInput - The input type for the predictCashFlow function.
 * - PredictCashFlowOutput - The return type for the predictCashFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictCashFlowInputSchema = z.object({
  historicalData: z
    .string()
    .describe(
      'Historical financial data, including income and expenses. Should be formatted as a string.
      Example: Date,Income,Expenses\n2023-01-01,5000,3000\n2023-02-01,6000,4000'
    ),
  predictionHorizon: z
    .string()
    .describe(
      'The time horizon for the cash flow prediction (e.g., "1 month", "3 months", "6 months", "1 year").'
    ),
});
export type PredictCashFlowInput = z.infer<typeof PredictCashFlowInputSchema>;

const PredictCashFlowOutputSchema = z.object({
  predictedCashFlow: z
    .string()
    .describe('The predicted cash flow for the specified time horizon.'),
  confidenceLevel: z
    .string()
    .describe('The confidence level of the prediction (e.g., "High", "Medium", "Low").'),
  rationale: z
    .string()
    .describe('The reasoning behind the prediction, including key factors considered.'),
});
export type PredictCashFlowOutput = z.infer<typeof PredictCashFlowOutputSchema>;

export async function predictCashFlow(input: PredictCashFlowInput): Promise<PredictCashFlowOutput> {
  return predictCashFlowFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictCashFlowPrompt',
  input: {schema: PredictCashFlowInputSchema},
  output: {schema: PredictCashFlowOutputSchema},
  prompt: `You are an expert financial analyst. Based on the historical financial data provided, predict the future cash flow for the specified time horizon.

Historical Data:
{{historicalData}}

Prediction Horizon: {{predictionHorizon}}

Consider trends, seasonality, and any other relevant factors to provide an accurate prediction.

Respond in a professional and informative tone, explaining the rationale behind your prediction and the confidence level.
`,
});

const predictCashFlowFlow = ai.defineFlow(
  {
    name: 'predictCashFlowFlow',
    inputSchema: PredictCashFlowInputSchema,
    outputSchema: PredictCashFlowOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
