
'use server'

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { collection, query, where, getDocs, or } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { User } from '@/app/(main)/users/page';

const FormSchema = z.object({
  mobile: z.string().min(9, { message: 'رقم الجوال مطلوب.' }),
  password: z.string().min(1, { message: 'كلمة المرور مطلوبة.' }),
});

export type FormState = {
    message: string;
    errors?: {
        mobile?: string[];
        password?: string[];
    };
};

export async function loginUser(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {

  const validatedFields = FormSchema.safeParse({
    mobile: formData.get('mobile'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      message: 'بيانات الإدخال غير صالحة.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { mobile, password } = validatedFields.data;

  try {
    const usersRef = collection(db, 'users');
    
    let normalizedMobile = mobile.startsWith('+') ? mobile.substring(1) : mobile;
    normalizedMobile = normalizedMobile.startsWith('00') ? normalizedMobile.substring(2) : normalizedMobile;

    const possibleMobiles = new Set<string>();
    possibleMobiles.add(mobile);
    possibleMobiles.add(normalizedMobile);
    
    if (normalizedMobile.startsWith('966')) {
      const withoutCountryCode = normalizedMobile.substring(3);
      possibleMobiles.add(withoutCountryCode);
      possibleMobiles.add(`0${withoutCountryCode}`);
    } else if (normalizedMobile.startsWith('05')) {
      possibleMobiles.add(`966${normalizedMobile.substring(1)}`);
    } else if (normalizedMobile.startsWith('5')) {
        possibleMobiles.add(`966${normalizedMobile}`);
        possibleMobiles.add(`0${normalizedMobile}`);
    }
    
    const whereClauses = Array.from(possibleMobiles).map(m => where('mobile', '==', m));

    if (whereClauses.length === 0) {
        return { message: 'رقم جوال غير صالح.' };
    }

    const q = query(usersRef, or(...whereClauses));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { message: 'رقم الجوال أو كلمة المرور غير صحيحة.' };
    }

    const userDoc = querySnapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() } as User;

    if (user.password !== password) {
       return { message: 'رقم الجوال أو كلمة المرور غير صحيحة.' };
    }

    const { password: userPassword, ...sessionData } = user;

    await cookies().set('session', JSON.stringify(sessionData), {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // One week
      path: '/',
    });
    
  } catch (error: any) {
    console.error('Login Error:', error);
    return { message: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.' };
  }
  
  redirect('/dashboard');
}

export async function logoutUser() {
    cookies().set('session', '', { expires: new Date(0) });
    redirect('/login');
}
