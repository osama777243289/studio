
'use server'

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs, or } from 'firebase/firestore';
import { db, app } from '@/lib/firebase/client';
import { User } from '@/app/(main)/users/page';

const FormSchema = z.object({
  mobile: z.string().min(9, { message: 'رقم الجوال مطلوب.' }),
  password: z.string().min(8, { message: 'كلمة المرور مطلوبة ويجب أن تكون 8 أحرف على الأقل.' }),
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
    
    // Normalize mobile number to find the user
    let normalizedMobile = mobile.startsWith('+') ? mobile.substring(1) : mobile;
    normalizedMobile = normalizedMobile.startsWith('00') ? normalizedMobile.substring(2) : normalizedMobile;

    const possibleMobiles = new Set<string>();
    possibleMobiles.add(mobile); // The raw input
    possibleMobiles.add(normalizedMobile); // a normalized version
    
    // Logic for Saudi numbers
    if (normalizedMobile.startsWith('966')) {
      const withoutCountryCode = normalizedMobile.substring(3); // e.g., 5...
      possibleMobiles.add(withoutCountryCode);
      possibleMobiles.add(`0${withoutCountryCode}`); // e.g., 05...
    } else if (normalizedMobile.startsWith('05')) { // e.g., 05...
      possibleMobiles.add(`966${normalizedMobile.substring(1)}`); // e.g., 9665...
    } else if (normalizedMobile.startsWith('5')) { // e.g., 5...
        possibleMobiles.add(`966${normalizedMobile}`); // e.g., 9665...
        possibleMobiles.add(`0${normalizedMobile}`); // e.g., 05...
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
    const userData = userDoc.data() as User;

    if (!userData.email) {
        return { message: 'حساب المستخدم هذا غير مهيأ بشكل صحيح.' };
    }

    const auth = getAuth(app); // Explicitly pass the app instance
    const userCredential = await signInWithEmailAndPassword(auth, userData.email, password);
    const user = userCredential.user;
    const idToken = await user.getIdToken();

    cookies().set('session', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // One week
      path: '/',
    });
    
  } catch (error: any) {
    if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        return { message: 'رقم الجوال أو كلمة المرور غير صحيحة.' };
    }
    console.error('Login Error:', error);
    return { message: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.' };
  }
  
  redirect('/dashboard');
}

export async function logoutUser() {
    cookies().delete('session');
    redirect('/login');
}
