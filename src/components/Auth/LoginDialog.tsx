import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, LogIn, Key, User, Cookie } from "lucide-react";
import { authService, AuthConfig, AuthMethod } from "@/services/authService";
import { BASE_URL } from "@/env";
import { toast } from "sonner";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [activeTab, setActiveTab] = useState<AuthMethod>("credentials");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    token: "",
    cookie: "",
    baseUrl: BASE_URL,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const config: AuthConfig = {
      method: activeTab,
      baseUrl: formData.baseUrl,
    };

    try {
      switch (activeTab) {
        case "credentials":
          if (!formData.username.trim() || !formData.password.trim()) {
            setError("Please enter both username and password");
            return;
          }
          config.username = formData.username.trim();
          config.password = formData.password;
          break;

        case "token":
          if (!formData.token.trim()) {
            setError("Please enter an API token");
            return;
          }
          config.token = formData.token.trim();
          break;

        case "cookie":
          if (!formData.cookie.trim()) {
            setError("Please enter a custom cookie");
            return;
          }
          config.customCookie = formData.cookie.trim();
          break;
      }

      setIsLoading(true);
      const result = await authService.authenticateWithConfig(config);
      
      if (result.success) {
        toast.success("Authentication successful!", {
          description: `Welcome back, ${result.user?.full_name || 'User'}!`,
        });
        
        // Reset form
        setFormData({
          username: "",
          password: "",
          token: "",
          cookie: "",
          baseUrl: BASE_URL,
        });
        setError(null);
        
        // Close dialog
        onOpenChange(false);
      } else {
        setError("Authentication failed. Please check your credentials.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Authentication failed";
      setError(errorMessage);
      toast.error("Authentication failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      username: "",
      password: "",
      token: "",
      cookie: "",
      baseUrl: BASE_URL,
    });
    setError(null);
    setIsLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Authenticate to Frappe
          </DialogTitle>
          <DialogDescription>
            Choose your authentication method to access the IT Support system
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="baseUrl">Base URL</Label>
              <Input
                id="baseUrl"
                type="url"
                placeholder="https://your-frappe-site.com"
                value={formData.baseUrl}
                onChange={(e) => handleInputChange("baseUrl", e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AuthMethod)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="credentials" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Credentials
                </TabsTrigger>
                <TabsTrigger value="token" className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  API Token
                </TabsTrigger>
                <TabsTrigger value="cookie" className="flex items-center gap-2">
                  <Cookie className="w-4 h-4" />
                  Cookie
                </TabsTrigger>
              </TabsList>

              <TabsContent value="credentials" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username or email"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Login with your Frappe username and password. The system will authenticate and store session cookies.
                </p>
              </TabsContent>

              <TabsContent value="token" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="token">API Token</Label>
                  <Input
                    id="token"
                    type="text"
                    placeholder="api_key:api_secret"
                    value={formData.token}
                    onChange={(e) => handleInputChange("token", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Use your API token in the format "api_key:api_secret". You can generate this from your Frappe user settings.
                </p>
              </TabsContent>

              <TabsContent value="cookie" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="cookie">Custom Cookie</Label>
                  <Input
                    id="cookie"
                    type="text"
                    placeholder="sid=session_value; full_name=User%20Name"
                    value={formData.cookie}
                    onChange={(e) => handleInputChange("cookie", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Paste your session cookies from an existing Frappe session. Use browser dev tools to copy cookies.
                </p>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" />
                  Authenticate
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}