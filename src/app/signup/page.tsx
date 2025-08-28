
'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Landmark, Loader2 } from "lucide-react";
import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { collection, doc, setDoc } from "firebase/firestore"; 

const signupSchema = z.object({
  name: z.string().min(2, { message: "الاسم مطلوب." }),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح." }),
  mobile: z.string().min(10, { message: "رقم الجوال مطلوب." }),
  password: z.string().min(8, { message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل." }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
    });

    const onSubmit: SubmitHandler<SignupFormValues> = async (data) => {
        setLoading(true);
        try {
            // Step 1: Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            const user = userCredential.user;

            // Step 2: Create user document in Firestore 'users' collection with the same UID
            const newUserDocRef = doc(db, "users", user.uid);
            
            const newUser = {
                id: user.uid,
                name: data.name,
                email: data.email,
                mobile: data.mobile,
                type: 'regular',
                role: ['Admin'], // Default role for new signups
                status: 'نشط',
                permissions: { accounts: ['*'] }, // Default full permissions
                avatarUrl: `https://picsum.photos/seed/${user.uid}/40/40`,
            };
            
            await setDoc(newUserDocRef, newUser);

            toast({
                title: "تم إنشاء الحساب بنجاح",
                description: "يمكنك الآن تسجيل الدخول.",
            });
            router.push("/login");

        } catch (error: any) {
            console.error("Signup failed:", error);
            let errorMessage = "فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "هذا البريد الإلكتروني مستخدم بالفعل.";
            }
            toast({
                title: "خطأ في إنشاء الحساب",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm">
        <CardHeader className="text-center">
            <Link href="/" className="flex justify-center items-center gap-2 mb-4">
              <Landmark className="h-8 w-8 text-primary" />
            </Link>
          <CardTitle className="text-2xl font-headline">إنشاء حساب جديد</CardTitle>
          <CardDescription>
            أدخل بياناتك لإنشاء حساب والبدء في استخدام التطبيق
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">الاسم الكامل</Label>
              <Input id="name" placeholder="مثال: خالد الأحمد" {...register("name")} />
              {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register("email")}
                className="ltr"
              />
              {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
            </div>
             <div className="grid gap-2">
              <Label htmlFor="mobile">رقم الجوال</Label>
              <Input id="mobile" placeholder="05xxxxxxxx" {...register("mobile")} className="ltr" />
              {errors.mobile && <p className="text-destructive text-xs">{errors.mobile.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" type="password" {...register("password")} className="ltr" />
              {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin"/> : "إنشاء حساب"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="underline">
              تسجيل الدخول
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
