"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getUsers, updateUser, deleteUser, createUser } from "@/lib/storage";
import type { User, UserRole } from "@/lib/types";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Shield, PenLine, Eye } from "lucide-react";

export default function UsersPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // New user form
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("reader");

  // Edit user form
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<UserRole>("reader");

  useEffect(() => {
    if (currentUser?.role !== "admin") {
      router.push("/dashboard");
      return;
    }
    loadUsers();
  }, [currentUser, router]);

  const loadUsers = () => {
    setUsers(getUsers());
  };

  const handleAddUser = () => {
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      toast.error("Заповніть усі поля");
      return;
    }

    if (users.some((u) => u.email === newEmail)) {
      toast.error("Користувач з таким email вже існує");
      return;
    }

    createUser({
      name: newName.trim(),
      email: newEmail.trim(),
      password: newPassword,
      role: newRole,
    });

    toast.success("Користувача додано");
    setIsAddDialogOpen(false);
    setNewName("");
    setNewEmail("");
    setNewPassword("");
    setNewRole("reader");
    loadUsers();
  };

  const handleEditUser = () => {
    if (!editingUser || !editName.trim()) {
      toast.error("Введіть ім'я");
      return;
    }

    updateUser(editingUser.id, {
      name: editName.trim(),
      role: editRole,
    });

    toast.success("Дані оновлено");
    setEditingUser(null);
    loadUsers();
  };

  const handleDeleteUser = (id: string) => {
    if (id === currentUser?.id) {
      toast.error("Ви не можете видалити себе");
      return;
    }

    const success = deleteUser(id);
    if (success) {
      toast.success("Користувача видалено");
      loadUsers();
    } else {
      toast.error("Помилка при видаленні");
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditRole(user.role);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "author":
        return <PenLine className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="gap-1">
            <Shield className="h-3 w-3" /> Адміністратор
          </Badge>
        );
      case "author":
        return (
          <Badge variant="secondary" className="gap-1">
            <PenLine className="h-3 w-3" /> Автор
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <Eye className="h-3 w-3" /> Читач
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (currentUser?.role !== "admin") {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Користувачі</h1>
          <p className="text-muted-foreground">
            Управління користувачами системи
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Додати користувача
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новий користувач</DialogTitle>
              <DialogDescription>
                Створіть нового користувача системи
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="newName" className="text-sm font-medium">
                  Ім&apos;я
                </label>
                <Input
                  id="newName"
                  placeholder="Введіть ім'я"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="newEmail" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="newEmail"
                  type="email"
                  placeholder="user@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-medium">
                  Пароль
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Введіть пароль"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="newRole" className="text-sm font-medium">
                  Роль
                </label>
                <Select
                  value={newRole}
                  onValueChange={(v) => setNewRole(v as UserRole)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reader">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" /> Читач
                      </div>
                    </SelectItem>
                    <SelectItem value="author">
                      <div className="flex items-center gap-2">
                        <PenLine className="h-4 w-4" /> Автор
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" /> Адміністратор
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Скасувати
              </Button>
              <Button onClick={handleAddUser}>Додати</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список користувачів</CardTitle>
          <CardDescription>
            Всього: {users.length} | Адміністратори:{" "}
            {users.filter((u) => u.role === "admin").length} | Автори:{" "}
            {users.filter((u) => u.role === "author").length} | Читачі:{" "}
            {users.filter((u) => u.role === "reader").length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ім&apos;я</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Дата реєстрації</TableHead>
                <TableHead className="text-right">Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name}
                    {user.id === currentUser?.id && (
                      <Badge variant="outline" className="ml-2">
                        Ви
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Dialog
                        open={editingUser?.id === user.id}
                        onOpenChange={(open) => !open && setEditingUser(null)}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Редагувати користувача</DialogTitle>
                            <DialogDescription>
                              Змініть дані користувача
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label
                                htmlFor="editName"
                                className="text-sm font-medium"
                              >
                                Ім&apos;я
                              </label>
                              <Input
                                id="editName"
                                placeholder="Введіть ім'я"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="editRole"
                                className="text-sm font-medium"
                              >
                                Роль
                              </label>
                              <Select
                                value={editRole}
                                onValueChange={(v) =>
                                  setEditRole(v as UserRole)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="reader">
                                    <div className="flex items-center gap-2">
                                      <Eye className="h-4 w-4" /> Читач
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="author">
                                    <div className="flex items-center gap-2">
                                      <PenLine className="h-4 w-4" /> Автор
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="admin">
                                    <div className="flex items-center gap-2">
                                      <Shield className="h-4 w-4" />{" "}
                                      Адміністратор
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setEditingUser(null)}
                            >
                              Скасувати
                            </Button>
                            <Button onClick={handleEditUser}>Зберегти</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      {user.id !== currentUser?.id && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Видалити користувача?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Ця дія незворотна. Користувач {user.name} буде
                                видалений назавжди.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Скасувати</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-destructive text-white hover:bg-destructive/90"
                              >
                                Видалити
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
