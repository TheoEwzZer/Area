import { User, clerkClient } from "@clerk/nextjs/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReactElement } from "react";

async function AdminUserManagement(): Promise<ReactElement> {
  let users: User[] = [];

  try {
    const userList: { data: User[] } = await clerkClient().users.getUserList();
    users = userList.data;
  } catch (error) {
    console.error("Failed to fetch users:", error);
  }

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
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user: User): ReactElement => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={user.imageUrl} alt={user.fullName || ""} />
                      <AvatarFallback>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div>{user.fullName || "N/A"}</div>
                      <div className="text-sm text-gray-500">{user.username || "No username"}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.primaryEmailAddress?.emailAddress || "N/A"}</TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleDateString() : "N/A"}</TableCell>
                <TableCell>
                  {user.banned && <Badge variant="destructive">Banned</Badge>}
                  {user.locked && <Badge>Locked</Badge>}
                  {!user.banned && !user.locked && <Badge>Active</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default AdminUserManagement;