
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const users = [
  {
    name: "يوسف خالد",
    email: "youssef.k@example.com",
    role: "مدير",
    status: "نشط",
    avatar: "/avatars/01.png",
  },
  {
    name: "فاطمة علي",
    email: "fatima.ali@example.com",
    role: "محاسب",
    status: "نشط",
    avatar: "/avatars/02.png",
  },
  {
    name: "أحمد منصور",
    email: "ahmed.m@example.com",
    role: "كاشير",
    status: "غير نشط",
    avatar: "/avatars/03.png",
  },
  {
    name: "سارة إبراهيم",
    email: "sara.i@example.com",
    role: "مدخل بيانات",
    status: "نشط",
    avatar: "/avatars/04.png",
  },
]

export default function UsersPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle className="font-headline">دليل المستخدمين</CardTitle>
                <CardDescription>إدارة المستخدمين والصلاحيات في النظام.</CardDescription>
            </div>
            <Button>
                <PlusCircle className="ml-2 h-4 w-4" />
                إضافة مستخدم جديد
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المستخدم</TableHead>
              <TableHead>الدور</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>
                <span className="sr-only">الإجراءات</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-9 w-9">
                       <AvatarImage data-ai-hint="person avatar" src={`https://picsum.photos/id/${20 + index}/40/40`} alt="Avatar" />
                      <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Badge variant={user.status === 'نشط' ? 'default' : 'secondary'}
                    className={user.status === 'نشط' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                      <DropdownMenuItem>تعديل</DropdownMenuItem>
                      <DropdownMenuItem>حذف</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
