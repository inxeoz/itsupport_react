import {useCallback, useEffect, useState} from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {AlertCircle, Cookie, Key, Loader2, User} from "lucide-react";
import {useAuthCookie, useAuthCred, useAuthToken, useBASE_URL} from "@/common/GlobalStore.ts";
import {toast} from "sonner";

// Authentication methods enum
enum AuthMethod {
    CREDENTIALS = "credentials",
    TOKEN = "token",
    COOKIE = "cookie"
}

interface LoginDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface FormData {
    username: string;
    password: string;
    token: string;
    cookie: string;
    baseUrl: string;
}

export function LoginDialog({open, onOpenChange}: LoginDialogProps) {
    // Global state hooks
    const {AuthToken, setAuthToken} = useAuthToken();
    const {AuthCookie, setAuthCookie} = useAuthCookie();
    const {AuthCredUsr, AuthCredPwd, setAuthCred} = useAuthCred();
    const {base_url, setBASE_URL} = useBASE_URL();

    // Local state
    const [activeTab, setActiveTab] = useState<AuthMethod>(AuthMethod.CREDENTIALS);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize form data with existing values
    const [formData, setFormData] = useState<FormData>({
        username: AuthCredUsr || "",
        password: AuthCredPwd || "",
        token: AuthToken || "",
        cookie: AuthCookie || "",
        baseUrl: base_url || "",
    });

    // Update form data when global state changes
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            username: AuthCredUsr || "",
            password: AuthCredPwd || "",
            token: AuthToken || "",
            cookie: AuthCookie || "",
            baseUrl: base_url || "",
        }));
    }, [AuthCredUsr, AuthCredPwd, AuthToken, AuthCookie, base_url]);

    // Handle input changes
    const handleInputChange = useCallback((field: keyof FormData, value: string) => {
        setFormData(prev => ({...prev, [field]: value}));
        // Clear error when user starts typing
        if (error) setError(null);
    }, [error]);

    // Validation helpers
    const validateCredentials = (username: string, password: string): string | null => {
        if (!username.trim()) return "Username is required";
        if (!password.trim()) return "Password is required";
        if (username.length < 3) return "Username must be at least 3 characters";
        if (password.length < 4) return "Password must be at least 4 characters";
        return null;
    };

    const validateToken = (token: string): string | null => {
        if (!token.trim()) return "API token is required";
        if (!token.includes(":")) return "Token must be in format 'api_key:api_secret'";
        const [key, secret] = token.split(":");
        if (!key.trim() || !secret.trim()) return "Both API key and secret are required";
        return null;
    };

    const validateCookie = (cookie: string): string | null => {
        if (!cookie.trim()) return "Cookie is required";
        if (!cookie.includes("=")) return "Cookie must contain key=value pairs";
        return null;
    };

    const validateBaseUrl = (url: string): string | null => {
        if (!url.trim()) return "Base URL is required";
        try {
            const urlObj = new URL(url);
            if (!["http:", "https:"].includes(urlObj.protocol)) {
                return "URL must use HTTP or HTTPS protocol";
            }
        } catch {
            return "Please enter a valid URL";
        }
        return null;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // Validate base URL first
            const baseUrlError = validateBaseUrl(formData.baseUrl);
            if (baseUrlError) {
                setError(baseUrlError);
                return;
            }

            // Update base URL if changed
            if (formData.baseUrl.trim() !== base_url) {
                setBASE_URL(formData.baseUrl.trim());
            }

            // Handle authentication based on active tab
            switch (activeTab) {
                case AuthMethod.CREDENTIALS: {
                    const credError = validateCredentials(formData.username, formData.password);
                    if (credError) {
                        setError(credError);
                        return;
                    }
                    setAuthCred(formData.username.trim(), formData.password.trim());
                    console.log("comp", formData.username, AuthCredUsr);
                    toast.success("Credentials saved successfully");
                    break;
                }

                case AuthMethod.TOKEN: {
                    const tokenError = validateToken(formData.token);
                    if (tokenError) {
                        setError(tokenError);
                        return;
                    }
                    setAuthToken(formData.token.trim());
                    toast.success("API token saved successfully");
                    break;
                }

                case AuthMethod.COOKIE: {
                    const cookieError = validateCookie(formData.cookie);
                    if (cookieError) {
                        setError(cookieError);
                        return;
                    }
                    setAuthCookie(formData.cookie.trim());
                    toast.success("Cookie saved successfully");
                    break;
                }

                default:
                    throw new Error("Invalid authentication method");
            }

            // Close dialog on success
            handleClose();

            // Console log current auth state
            console.log("cred", AuthCredUsr, AuthCredPwd, "token", AuthToken, "cookie", AuthCookie);

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

    // Handle dialog close
    const handleClose = useCallback(() => {
        setError(null);
        setIsLoading(false);
        onOpenChange(false);
    }, [onOpenChange]);

    // Handle tab change
    const handleTabChange = useCallback((value: string) => {
        setActiveTab(value as AuthMethod);
        setError(null); // Clear errors when switching tabs
    }, []);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Key className="w-5 h-5"/>
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
                                <AlertCircle className="h-4 w-4"/>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Base URL Input */}
                        <div className="space-y-2">
                            <Label htmlFor="baseUrl">Base URL *</Label>
                            <Input
                                id="baseUrl"
                                type="url"
                                placeholder="https://your-frappe-site.com"
                                value={formData.baseUrl}
                                onChange={(e) => handleInputChange("baseUrl", e.target.value)}
                                disabled={isLoading}
                                required
                            />
                        </div>

                        {/* Authentication Method Tabs */}
                        <Tabs value={activeTab} onValueChange={handleTabChange}>
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value={AuthMethod.CREDENTIALS} className="flex items-center gap-2">
                                    <User className="w-4 h-4"/>
                                    Credentials
                                </TabsTrigger>
                                <TabsTrigger value={AuthMethod.TOKEN} className="flex items-center gap-2">
                                    <Key className="w-4 h-4"/>
                                    API Token
                                </TabsTrigger>
                                <TabsTrigger value={AuthMethod.COOKIE} className="flex items-center gap-2">
                                    <Cookie className="w-4 h-4"/>
                                    Cookie
                                </TabsTrigger>
                            </TabsList>

                            {/* Credentials Tab */}
                            <TabsContent value={AuthMethod.CREDENTIALS} className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username *</Label>
                                    <Input
                                        id="username"
                                        type="text"
                                        placeholder="Enter your username or email"
                                        value={formData.username}
                                        onChange={(e) => handleInputChange("username", e.target.value)}
                                        disabled={isLoading}
                                        autoComplete="username"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password *</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange("password", e.target.value)}
                                        disabled={isLoading}
                                        autoComplete="current-password"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Get Cookie Using Credentials*</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleClose}
                                        disabled={isLoading}
                                    >
                                        Fetch Cookie
                                    </Button>

                                    

                                </div>

                                <p className="text-sm text-muted-foreground">
                                    Login with your Frappe username and password. The system will authenticate
                                    and store session cookies automatically.
                                </p>
                            </TabsContent>

                            {/* API Token Tab */}
                            <TabsContent value={AuthMethod.TOKEN} className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="token">API Token *</Label>
                                    <Input
                                        id="token"
                                        type="text"
                                        placeholder="api_key:api_secret"
                                        value={formData.token}
                                        onChange={(e) => handleInputChange("token", e.target.value)}
                                        disabled={isLoading}
                                        autoComplete="off"
                                        required
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Use your API token in the format "api_key:api_secret". You can generate
                                    this from your Frappe user settings under API Access.
                                </p>
                            </TabsContent>

                            {/* Cookie Tab */}
                            <TabsContent value={AuthMethod.COOKIE} className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cookie">Custom Cookie *</Label>
                                    <Input
                                        id="cookie"
                                        type="text"
                                        placeholder="sid=session_value; full_name=User%20Name"
                                        value={formData.cookie}
                                        onChange={(e) => handleInputChange("cookie", e.target.value)}
                                        disabled={isLoading}
                                        autoComplete="off"
                                        required
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Paste your session cookies from an existing Frappe session. Use browser
                                    developer tools (F12 → Application → Cookies) to copy the cookie string.
                                </p>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Dialog Footer */}
                    <DialogFooter className="mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    <Key className="mr-2 h-4 w-4"/>
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
