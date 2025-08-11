import SEO from "@/components/SEO";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
<<<<<<< HEAD
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Eye, Ban, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAdminUsers, useUpdateUserStatus } from "@/services/adminService";
import { UserManagementParams } from "@/lib/types";

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
=======
import {
  Dialog,
  DialogContent,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Eye, Ban, CheckCircle, Users, Building } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  useAdminUsers,
  useUpdateUserStatus,
  useDeleteUser,
} from "@/services/adminService";
import { UserManagementParams, UserRole } from "@/lib/types";

const UserManagement = () => {
>>>>>>> 3da4522 (UI integrations)
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "all">("all");
  const [filterStatus, setFilterStatus] = useState<
    "active" | "suspended" | "all"
  >("all");
  const [selectedUser, setSelectedUser] = useState(null);

<<<<<<< HEAD
  // API parameters
  const userParams: UserManagementParams = {
    search: searchQuery || undefined,
    role: filterRole !== "all" ? filterRole : undefined,
    status: filterStatus !== "all" ? filterStatus : undefined,
    limit: 20,
    offset: (currentPage - 1) * 20,
  };

  // React Query hooks
  const { data: usersData, isLoading, error, refetch } = useAdminUsers(userParams);
  const updateUserStatusMutation = useUpdateUserStatus();

  // Extract users array from API response
  const users = usersData?.items || [];
  const totalUsers = usersData?.pagination?.total || 0;
  const totalPages = Math.ceil(totalUsers / 20);

  // Filter users for frontend display (API handles most filtering)
  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    return user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           user.email?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleBanUser = async (userId: number, reason?: string) => {
    try {
      await updateUserStatusMutation.mutateAsync({
        userId,
        data: {
          action: 'suspend',
          reason: reason || 'Banned by admin'
        }
      });
      
      toast({
        title: "User banned successfully",
        description: "The user has been banned from the platform.",
      });
      
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to ban user. Please try again.",
=======
  // Build API params
  const apiParams: UserManagementParams = {
    search: searchQuery || undefined,
    role: filterRole !== "all" ? filterRole : undefined,
    status: filterStatus !== "all" ? filterStatus : undefined,
    limit: 50,
    offset: 0,
  };

  const { data: usersData, isLoading, error } = useAdminUsers(apiParams);

  const updateUserStatus = useUpdateUserStatus();
  const deleteUser = useDeleteUser();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading users",
        description: "Failed to load user data.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const users = usersData?.items || [];
  const totalUsers = usersData?.pagination.total || 0;

  const handleSuspendUser = async (userId: number) => {
    try {
      await updateUserStatus.mutateAsync({
        userId,
        data: { action: "suspend", reason: "Suspended by admin" },
      });
      toast({
        title: "User suspended successfully",
        description: "The user has been suspended from the platform.",
      });
    } catch (error) {
      toast({
        title: "Failed to suspend user",
        description: "An error occurred while suspending the user.",
>>>>>>> 3da4522 (UI integrations)
        variant: "destructive",
      });
    }
  };

<<<<<<< HEAD
  const handleUnbanUser = async (userId: number) => {
    try {
      await updateUserStatusMutation.mutateAsync({
        userId,
        data: {
          action: 'activate'
        }
      });
      
      toast({
        title: "User unbanned successfully",
        description: "The user has been restored to active status.",
      });
      
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unban user. Please try again.",
=======
  const handleActivateUser = async (userId: number) => {
    try {
      await updateUserStatus.mutateAsync({
        userId,
        data: { action: "activate" },
      });
      toast({
        title: "User activated successfully",
        description: "The user has been restored to active status.",
      });
    } catch (error) {
      toast({
        title: "Failed to activate user",
        description: "An error occurred while activating the user.",
>>>>>>> 3da4522 (UI integrations)
        variant: "destructive",
      });
    }
  };

<<<<<<< HEAD
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "user": return "secondary";
      case "facility_owner": return "default";
      case "admin": return "destructive";
      default: return "outline";
    }
  };

  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? "default" : "destructive";
  };

  if (isLoading) {
    return (
      <div className="container py-10">
        <SEO title="User Management – QuickCourt" description="Search, filter, and manage users and facility owners." />
        <PageHeader title="User Management" />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-10">
        <SEO title="User Management – QuickCourt" description="Search, filter, and manage users and facility owners." />
        <PageHeader title="User Management" />
        <div className="text-center py-10">
          <p className="text-red-600">Error loading users. Please try again.</p>
          <Button onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }
=======
  const handleDeleteUser = async (userId: number) => {
    try {
      await deleteUser.mutateAsync(userId);
      toast({
        title: "User deleted successfully",
        description: "The user has been permanently deleted.",
      });
    } catch (error) {
      toast({
        title: "Failed to delete user",
        description: "An error occurred while deleting the user.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? "default" : "destructive";
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "user":
        return "secondary";
      case "facility_owner":
        return "default";
      case "admin":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleRoleChange = (value: string) => {
    setFilterRole(value as UserRole | "all");
  };

  const handleStatusChange = (value: string) => {
    setFilterStatus(value as "active" | "suspended" | "all");
  };
>>>>>>> 3da4522 (UI integrations)

  return (
    <div className="container py-10">
      <SEO
        title="User Management – QuickCourt"
        description="Search, filter, and manage users and facility owners."
      />
      <PageHeader title="User Management" />

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        {/* Filters Sidebar */}
        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name or email"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={filterRole} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="user">👤 Users</SelectItem>
<<<<<<< HEAD
                    <SelectItem value="facility_owner">🏢 Facility Owners</SelectItem>
=======
                    <SelectItem value="facility_owner">
                      🏢 Facility Owners
                    </SelectItem>
>>>>>>> 3da4522 (UI integrations)
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filterStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">✅ Active</SelectItem>
                    <SelectItem value="suspended">🚫 Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
<<<<<<< HEAD
              <div className="flex justify-between">
                <span>Total Users:</span>
                <span className="font-medium">{users.filter(u => u.role === 'user').length}</span>
              </div>
              <div className="flex justify-between">
                <span>Facility Owners:</span>
                <span className="font-medium">{users.filter(u => u.role === 'facility_owner').length}</span>
              </div>
              <div className="flex justify-between">
                <span>Active:</span>
                <span className="font-medium text-green-600">{users.filter(u => u.isActive).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Inactive:</span>
                <span className="font-medium text-red-600">{users.filter(u => !u.isActive).length}</span>
              </div>
=======
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span>Total Users:</span>
                    <span className="font-medium">
                      {users.filter((u) => u.role === "user").length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Facility Owners:</span>
                    <span className="font-medium">
                      {users.filter((u) => u.role === "facility_owner").length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active:</span>
                    <span className="font-medium text-green-600">
                      {users.filter((u) => u.isActive).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inactive:</span>
                    <span className="font-medium text-red-600">
                      {users.filter((u) => !u.isActive).length}
                    </span>
                  </div>
                </>
              )}
>>>>>>> 3da4522 (UI integrations)
            </CardContent>
          </Card>
        </aside>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({totalUsers})</CardTitle>
          </CardHeader>
          <CardContent>
<<<<<<< HEAD
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{user.name}</h3>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role === 'user' ? '👤' : user.role === 'facility_owner' ? '🏢' : '⚡'} 
                          {user.role === 'facility_owner' ? 'Facility Owner' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(user.isActive)}>
                          {user.isActive ? '✅ Active' : '🚫 Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span>📅 Created: {new Date(user.createdAt).toLocaleDateString()}</span>
                        {user.phone && <span>📞 {user.phone}</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>User Details - {user.name}</DialogTitle>
                        </DialogHeader>
                        {selectedUser && selectedUser.id === user.id && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium mb-2">Basic Information</h4>
                                <div className="space-y-2 text-sm">
                                  <div><span className="font-medium">Name:</span> {user.name}</div>
                                  <div><span className="font-medium">Email:</span> {user.email}</div>
                                  <div><span className="font-medium">Phone:</span> {user.phone || 'Not provided'}</div>
                                  <div><span className="font-medium">Role:</span> {user.role}</div>
                                  <div><span className="font-medium">Status:</span> {user.isActive ? 'Active' : 'Inactive'}</div>
                                  <div><span className="font-medium">Created:</span> {new Date(user.createdAt).toLocaleDateString()}</div>
                                  {user.updatedAt && (
                                    <div><span className="font-medium">Last Updated:</span> {new Date(user.updatedAt).toLocaleDateString()}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    {user.isActive ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Ban className="w-4 h-4 mr-1" />
                            Suspend
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Suspend User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to suspend {user.name}? This will prevent them from accessing the platform.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleBanUser(user.id)}>
                              Suspend User
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="default" size="sm">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Activate
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Activate User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to activate {user.name}? This will restore their access to the platform.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleUnbanUser(user.id)}>
                              Activate User
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredUsers.length === 0 && !isLoading && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">👥</div>
                  <p>No users found matching your criteria.</p>
                </div>
              )}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalUsers)} of {totalUsers} users
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
=======
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-60" />
                        <Skeleton className="h-3 w-80" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{user.name}</h3>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role === "user" ? "👤" : "🏢"}{" "}
                            {user.role === "facility_owner"
                              ? "Facility Owner"
                              : user.role.charAt(0).toUpperCase() +
                                user.role.slice(1)}
                          </Badge>
                          <Badge variant={getStatusBadgeVariant(user.isActive)}>
                            {user.isActive ? "✅ Active" : "🚫 Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span>
                            📅 Joined:{" "}
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                          <span>📞 {user.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              User Details - {user.name}
                            </DialogTitle>
                          </DialogHeader>
                          {selectedUser && selectedUser.id === user.id && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">
                                    Basic Information
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <div>
                                      <span className="font-medium">Name:</span>{" "}
                                      {user.name}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Email:
                                      </span>{" "}
                                      {user.email}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Phone:
                                      </span>{" "}
                                      {user.phone}
                                    </div>
                                    <div>
                                      <span className="font-medium">Role:</span>{" "}
                                      {user.role}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Status:
                                      </span>{" "}
                                      {user.isActive ? "Active" : "Inactive"}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Join Date:
                                      </span>{" "}
                                      {new Date(
                                        user.createdAt
                                      ).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">
                                    Account Details
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <div>
                                      <span className="font-medium">
                                        User ID:
                                      </span>{" "}
                                      {user.id}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Last Updated:
                                      </span>{" "}
                                      {user.updatedAt
                                        ? new Date(
                                            user.updatedAt
                                          ).toLocaleDateString()
                                        : "N/A"}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {user.isActive ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Ban className="w-4 h-4 mr-1" />
                              Suspend
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Suspend User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to suspend {user.name}?
                                This will prevent them from accessing the
                                platform.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleSuspendUser(user.id)}
                              >
                                Suspend User
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="default" size="sm">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Activate
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Activate User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to activate {user.name}?
                                This will restore their access to the platform.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleActivateUser(user.id)}
                              >
                                Activate User
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                ))}

                {users.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-4">👥</div>
                    <p>No users found matching your criteria.</p>
                  </div>
                )}
>>>>>>> 3da4522 (UI integrations)
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagement;