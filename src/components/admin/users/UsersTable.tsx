import { useState } from "react";
import axios from "axios";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, User, Mail, Calendar, Shield } from "lucide-react";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import EditUserDialog from "./EditUserDialog";
import { Role } from "@/types";
import { useSession } from "next-auth/react";
import { USER_ROLES } from "@/lib/constants";
import { User as UserType } from "@/types";

interface UsersTableProps {
  users: UserType[];
  onUserDeleted: () => void;
  onUserUpdated?: () => void;
}

export default function UsersTable({
  users,
  onUserDeleted,
  onUserUpdated,
}: UsersTableProps) {
  const { data: session } = useSession();
  const user = session?.user;

  const t = useTranslations("common");
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    user: UserType | null;
  }>({
    open: false,
    user: null,
  });
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    user: UserType | null;
  }>({
    open: false,
    user: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteUser = async () => {
    if (!deleteDialog.user) return;

    try {
      setIsDeleting(true);
      await axios.delete(`/api/users/${deleteDialog.user.id}`);
      setDeleteDialog({ open: false, user: null });
      onUserDeleted();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      // You might want to show a toast notification here
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditUser = (user: UserType) => {
    setEditDialog({ open: true, user });
  };

  const handleDeleteClick = (user: UserType) => {
    setDeleteDialog({ open: true, user });
  };

  const formatDate = (date?: Date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-UK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleBadgeVariant = (role: Role) => {
    switch (role) {
      case Role.OWNER:
        return "destructive";
      case Role.MANAGER:
        return "secondary";
      case Role.ADMIN:
        return "default";
      default:
        return "outline";
    }
  };

  const canModifyUser = (targetUser: UserType): boolean => {
    if (!user?.role) return false;
    const currentUserLevel = USER_ROLES[user.role]?.access;
    const targetUserLevel = USER_ROLES[targetUser.role]?.access;
    return currentUserLevel > targetUserLevel;
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t("no users found")}</h3>
        <p className="text-muted-foreground">{t("no users match criteria")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-start">{t("name")}</TableHead>
              <TableHead className="text-start">{t("email")}</TableHead>
              <TableHead className="text-start">{t("role")}</TableHead>
              <TableHead className="text-start">{t("created")}</TableHead>
              <TableHead className="text-end">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <User className="shrink-0 h-4 w-4 text-muted-foreground" />
                    {user.name}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {user.email}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    <Shield className="h-3 w-3 me-1" />
                    {t(USER_ROLES[user.role].label) || user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDate(user.createdAt)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                      disabled={!canModifyUser(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(user)}
                      disabled={!canModifyUser(user)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, user: deleteDialog.user })
        }
        title={t("delete user")}
        description={`${t("delete user confirmation")} "${
          deleteDialog.user?.name
        }"?`}
        confirmText={t("delete")}
        cancelText={t("cancel")}
        onConfirm={handleDeleteUser}
        isLoading={isDeleting}
        variant="destructive"
      />

      {/* Edit User Dialog */}
      <EditUserDialog
        user={editDialog.user}
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog({ open, user: editDialog.user })}
        onUserUpdated={() => {
          setEditDialog({ open: false, user: null });
          onUserUpdated?.();
        }}
      />
    </>
  );
}
