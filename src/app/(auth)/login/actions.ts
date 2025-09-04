'use server';

import { z } from 'zod';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/client'; 
import { collection, query, where, getDocs, or } from 'firebase/firestore';
import { redirect } from 'next/navigation';

const formSchema = z.object({
  mobile: z.string().min(9, { message: 'رقم الجوال يجب أن يكون 9 أرقام على الأقل.' }),
  password: z.string().min(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.' }),
});

export type FormState = {
  message: string;
  errors?: {
    mobile?: string[];
    password?: string[];
    server?: string;
  };
};

export async function loginUser(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = formSchema.safeParse({
    mobile: formData.get('mobile'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      message: 'بيانات غير صالحة.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { mobile, password } = validatedFields.data;

  try {
    // Normalize mobile number to handle different formats (+, 00, or none)
    const normalizedMobile = mobile.replace(/^\+|^00/, '');
    const possibleMobileFormats = [
        normalizedMobile,
        `+${normalizedMobile}`,
        `00${normalizedMobile}`
    ];
    
    // Step 1: Find user by mobile number to get their email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('mobile', 'in', possibleMobileFormats));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { message: 'فشل تسجيل الدخول.', errors: { server: 'رقم الجوال أو كلمة المرور غير صحيحة.' } };
    }

    const userData = querySnapshot.docs[0].data();
    const email = userData.email;

    if (!email) {
      return { message: 'فشل تسجيل الدخول.', errors: { server: 'حساب المستخدم هذا غير مهيأ بشكل صحيح. يرجى الاتصال بالدعم.' } };
    }

    // Step 2: Sign in with email and password using Firebase Auth
    await signInWithEmailAndPassword(auth, email, password);

  } catch (error: any) {
    console.error('Firebase Auth Error:', error.code, error.message);
    // Generic error message for security reasons
    return { message: 'فشل تسجيل الدخول.', errors: { server: 'رقم الجوال أو كلمة المرور غير صحيحة.' } };
  }

  // On successful login, redirect to the dashboard
  redirect('/dashboard');
}

export async function logoutUser() {
    await auth.signOut();
    redirect('/login');
}
