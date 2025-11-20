import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, CheckCircle2 } from "lucide-react";
import { UserRole } from "@shared/schema";

export default function InviteUser() {
    const { toast } = useToast();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState(UserRole.USER);
    const [showSuccess, setShowSuccess] = useState(false);

    const createUserMutation = useMutation({
        mutationFn: async (data) => {
            return await apiRequest("POST", "/api/admin/users", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            setShowSuccess(true);
            toast({
                title: "User Created",
                description: "The user account has been created successfully.",
            });
            // Reset form after 2 seconds
            setTimeout(() => {
                setUsername("");
                setEmail("");
                setPassword("");
                setFullName("");
                setRole(UserRole.USER);
                setShowSuccess(false);
            }, 2000);
        },
        onError: (error) => {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to create user",
            });
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!username.trim() || !email.trim() || !password.trim()) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Username, email, and password are required",
            });
            return;
        }

        createUserMutation.mutate({
            username: username.trim(),
            email: email.trim(),
            password,
            fullName: fullName.trim() || undefined,
            role,
        });
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Invite User</h1>
                <p className="text-muted-foreground mt-2">
                    Create a new user account directly. The user will be able to login immediately with the credentials you provide.
                </p>
            </div>

            {showSuccess && (
                <Card className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
                    <CardContent className="flex items-center gap-3 pt-6">
                        <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <p className="text-green-800 dark:text-green-200 font-medium">
                            User account created successfully!
                        </p>
                    </CardContent>
                </Card>
            )}



            <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Create New User
            </CardTitle>

            Fill in the user details below to create a new account
        </CardDescription>
</CardHeader>

    <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <Label htmlFor="username">Username *</Label>
            <FormControl>

                <Input                 id="username"
                                       value={username}
                                       onChange={(e) => setUsername(e.target.value)}
                                       placeholder="johndoe"
                                       disabled={createUserMutation.isPending}
                                       data-testid="input-username"
                />
        </div>

        <div>
            <Label htmlFor="email">Email *</Label>
            <FormControl>

                <Input                 id="email"
                                       type="email"
                                       value={email}
                                       onChange={(e) => setEmail(e.target.value)}
                                       placeholder="john@example.com"
                                       disabled={createUserMutation.isPending}
                                       data-testid="input-email"
                />
        </div>

        <div>
            <Label htmlFor="fullName">Full Name</Label>
            <FormControl>

                <Input                 id="fullName"
                                       value={fullName}
                                       onChange={(e) => setFullName(e.target.value)}
                                       placeholder="John Doe"
                                       disabled={createUserMutation.isPending}
                                       data-testid="input-fullname"
                />
        </div>

        <div>
            <Label htmlFor="password">Initial Password *</Label>
            <FormControl>

                <Input                 id="password"
                                       type="password"
                                       value={password}
                                       onChange={(e) => setPassword(e.target.value)}
                                       placeholder="Enter a temporary password"
                                       disabled={createUserMutation.isPending}
                                       data-testid="input-password"
                />
                <p className="text-sm text-muted-foreground mt-1">
                    Minimum 6 characters. The user can change this after logging in.
                </p>
        </div>

        <div>
            <Label htmlFor="role">User Role *</Label>
            <Select value={role} onValueChange={setRole} disabled={createUserMutation.isPending}>
                <SelectTrigger data-testid="select-role">
                    <SelectValue />
                </SelectTrigger>

                <SelectItem value={UserRole.USER}>User</SelectItem>
                <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
            </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground mt-1">
            Users can create and view memories. Admins have full system access.
        </p>
    </div>

    <div className="pt-4">
        <Button
            type="submit"
            disabled={createUserMutation.isPending}
            className="w-full"
            data-testid="button-create-user"
        >
            {createUserMutation.isPending ? "Creating User..." : "Create User Account"}
        </Button>
    </div>
</form>
</CardContent>
</Card>
</div>
);
}
