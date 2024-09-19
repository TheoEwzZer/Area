"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User } from "@clerk/nextjs/server";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";
import { ReactElement, useEffect, useState } from "react";

function AdminUserManagement(): ReactElement {
  const [users, setUsers] = useState<User[]>([]);
  const router: AppRouterInstance = useRouter();

  useEffect((): void => {
    const fetchUsers: () => Promise<void> = async (): Promise<void> => {
      try {
        const response = await fetch("/api/users");
        const data: User[] = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    fetchUsers();
  }, [router]);

  const handleRoleChange: (
    userId: string,
    newRole: string
  ) => Promise<void> = async (
    userId: string,
    newRole: string
  ): Promise<void> => {
    try {
      await fetch(`/api/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });
    } catch (error) {
      console.error("Failed to change role:", error);
    }
  };

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(
              (user: User): ReactElement => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage
                          src={user.imageUrl}
                          alt={user.fullName || ""}
                        />
                        <AvatarFallback>
                          {user.firstName?.charAt(0)}
                          {user.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div>
                          {user.firstName || user.lastName
                            ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                            : "N/A"}
                        </div>

                        <div className="text-sm text-gray-500">
                          {user.username || "No username"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.emailAddresses?.length > 0
                      ? user.emailAddresses[0].emailAddress
                      : "N/A"}
                  </TableCell>

                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {user.lastActiveAt
                      ? new Date(user.lastActiveAt).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {user.banned && <Badge variant="destructive">Banned</Badge>}
                    {user.locked && <Badge>Locked</Badge>}
                    {!user.banned && !user.locked && <Badge>Active</Badge>}
                  </TableCell>
                  <TableCell>
                    <Select
                      defaultValue={
                        (user.publicMetadata.role as string) || "user"
                      }
                      onValueChange={(value: string): Promise<void> =>
                        handleRoleChange(user.id, value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default AdminUserManagement;
