"use client"
import { Button } from '@/components/ui/button-2';
import { Input } from '@/components/ui/input-2';
import useAuthAdmin from '@/hooks/useAuthAdmin';
import { KeyIcon, KeyRoundIcon, LockKeyhole, LockKeyholeOpen, Settings, X, Trash2, Plus, Users2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import PasswordResetForm from '../components/PasswordResetForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const SettingsPage = () => {
    const [user, setUser] = React.useState<any>(null);
    const { token, user: _profile } = useAuthAdmin();
    const [isLoading, setIsLoading] = useState(false);

    // QR modal state
    const [showQR, setShowQR] = useState(false);
    const [qrImage, setQrImage] = useState<string | null>(null);
    const [secret, setSecret] = useState<string | null>(null);

    // Admins management state
    const [adminsList, setAdminsList] = useState<any[]>([]);
    const [loadingAdmins, setLoadingAdmins] = useState(false);
    const [showAddAdmin, setShowAddAdmin] = useState(false);
    const [newAdminEmail, setNewAdminEmail] = useState("");
    const [newAdminPassword, setNewAdminPassword] = useState("");
    const [submittingAdmin, setSubmittingAdmin] = useState(false);

    const adminId =
        user?.adminId ??
        user?._id ??
        user?.user?._id ??
        user?.user?.adminId ??
        undefined;

    const is2FAEnabled =
        user?.user?.isTwoFactorEnabled ??
        user?.isTwoFactorEnabled ??
        user?.twoFactorEnabled ??
        false;

    const fetchAdmins = async () => {
        if (!token) return;
        setLoadingAdmins(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAdminsList(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingAdmins(false);
        }
    };

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAdminEmail || !newAdminPassword || !token) return;
        if (newAdminPassword.length < 12) {
            toast.error("Password must be at least 12 characters");
            return;
        }
        setSubmittingAdmin(true);
        toast.loading("Adding administrator...", { id: "add-admin" });
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/signup`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: newAdminEmail, password: newAdminPassword }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.message || "Failed to add administrator");
            }
            toast.success("Administrator added successfully!", { id: "add-admin" });
            setNewAdminEmail("");
            setNewAdminPassword("");
            setShowAddAdmin(false);
            fetchAdmins();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to add admin", { id: "add-admin" });
        } finally {
            setSubmittingAdmin(false);
        }
    };

    const handleDeleteAdmin = async (targetId: string) => {
        if (!token) return;
        if (confirm("Are you sure you want to delete this administrator?")) {
            toast.loading("Deleting administrator...", { id: "delete-admin" });
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users/${targetId}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err?.message || "Failed to delete administrator");
                }
                toast.success("Administrator deleted!", { id: "delete-admin" });
                fetchAdmins();
            } catch (error: any) {
                console.error(error);
                toast.error(error.message || "Failed to delete admin", { id: "delete-admin" });
            }
        }
    };

    useEffect(() => {
        if (token) {
            fetchAdmins();
        }
    }, [token]);

    const enable2FA = async () => {
        setIsLoading(true);
        toast.loading("Enabling 2FA...", { id: "2fa" });

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/2fa/enable`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ adminId: user?.adminId }),
                }
            );

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.message || "Failed to enable 2FA");
            }

            // Expecting { qrCode, secret } from backend
            const data = await res.json();
            setQrImage(data?.qrCode ?? null);
            setSecret(data?.secret ?? null);
            setShowQR(true);

            toast.success("2FA enabled. Scan the QR with your authenticator app.", {
                id: "2fa",
            });

            // refresh profile (in case your backend flips the flag immediately)
            await fetchUser();
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong while enabling 2FA", { id: "2fa" });
        } finally {
            setIsLoading(false);
        }
    }

    const disable2FA = async () => {
        setIsLoading(true);
        toast.loading("Disabling 2FA...", { id: "2fa" });

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/2fa/disable`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ adminId: user?.adminId }),
                }
            );

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.message || "Failed to disable 2FA");
            }

            toast.success("Two-factor authentication disabled!", { id: "2fa" });
            setShowQR(false);
            setQrImage(null);
            setSecret(null);
            await fetchUser();
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong while disabling 2FA", { id: "2fa" });
        } finally {
            setIsLoading(false);
        }
    }

    const fetchUser = async () => {
        fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/admin/profile", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => setUser(data))
            .catch(console.error);
    }

    useEffect(() => {
        if (!token) return
        fetchUser()
    }, [token])

    const copySecret = async () => {
        if (!secret) return;
        try {
            await navigator.clipboard.writeText(secret);
            toast.success("Secret copied to clipboard");
        } catch {
            toast.error("Could not copy secret");
        }
    };
    return (
        <React.Fragment>
            <div aria-describedby="settings-page">
                <div className="mb-5">
                    <h3 className="text-2xl font-semibold flex items-center gap-1">
                        <Settings />
                        Settings
                    </h3>
                </div>

                <div aria-describedby="table-wrapper" className="overflow-auto grid lg:grid-cols-3 gap-4">
                    <div className="col-span-1 w-full min-h-52 space-y-4 pb-8 bg-[#f1f1f1]/50 dark:bg-secondary/30 rounded-2xl p-4">
                        <h2 className="text-base font-semibold flex items-center gap-1">
                            <KeyIcon size={18} /> Two Factor Authentication</h2>

                        <div className="relative pt-4 flex gap-2 items-center justify-center h-52">

                            <div className='static z-10'>
                                {user && user?.user?.isTwoFactorEnabled ?
                                    <Button size={'sm'}
                                        onClick={disable2FA}
                                        disabled={isLoading}
                                    >
                                        <LockKeyholeOpen />
                                        {isLoading ? "Disabling..." : "Disable 2FA"}
                                    </Button> :
                                    <Button size={'sm'} onClick={enable2FA} disabled={isLoading}>
                                        <LockKeyhole />
                                        {isLoading ? "Enabling..." : "Enable 2FA"}
                                    </Button>
                                }
                            </div>

                            <KeyIcon size={170} className='opacity-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0' />
                        </div>

                        {/* QR Modal */}
                        {showQR && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                                <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 p-5 shadow-xl">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-lg font-semibold">Scan this QR in your Authenticator</h4>
                                        <button
                                            onClick={() => setShowQR(false)}
                                            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10"
                                            aria-label="Close"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>

                                    <div className="mt-4 flex flex-col items-center gap-3">
                                        {qrImage ? (
                                            <img
                                                src={qrImage}
                                                alt="2FA QR"
                                                className="w-56 h-56 rounded-xl border"
                                            />
                                        ) : (
                                            <div className="w-56 h-56 grid place-items-center border rounded-xl">
                                                <span className="text-sm opacity-70">No QR available</span>
                                            </div>
                                        )}

                                        {secret && (
                                            <div className="w-full">
                                                <p className="text-sm opacity-80 mb-1">
                                                    Or enter this code manually:
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <code className="text-xs break-all px-2 py-1 rounded bg-black/5 dark:bg-white/10">
                                                        {secret}
                                                    </code>
                                                    <Button size="sm" onClick={copySecret}>
                                                        Copy
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        <p className="text-xs opacity-70 mt-2 text-center">
                                            After scanning, your app will start showing 6-digit codes. Use one
                                            on your next login (or now, if your backend requires a first-time verification).
                                        </p>

                                        <div className="mt-4 flex justify-end gap-2 w-full">
                                            <Button variant="ghost" onClick={() => setShowQR(false)}>
                                                Done
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="col-span-2 w-full space-y-6 pb-8 bg-[#f1f1f1]/50 dark:bg-secondary/30 rounded-2xl p-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <KeyRoundIcon size={18} />
                            Reset Password
                        </h3>

                        <PasswordResetForm />
                    </div>
                </div>

                {/* Manage Administrators Card */}
                <div className="mt-8 bg-white dark:bg-secondary/30 border rounded-2xl p-6 space-y-6">
                    <div className="flex justify-between items-center border-b pb-4">
                        <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2 text-black">
                                <Users2 size={20} className="text-orange-500" />
                                Manage Administrators
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">
                                Add additional administrative accounts or delete inactive accounts.
                            </p>
                        </div>
                        <Button size="sm" onClick={() => setShowAddAdmin(true)} className="h-9 gap-2">
                            <Plus size={16} /> Add Administrator
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-neutral-500">
                            <thead className="text-xs text-neutral-700 uppercase bg-neutral-50">
                                <tr>
                                    <th className="px-6 py-3">Email Address</th>
                                    <th className="px-6 py-3">2FA Enabled</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {adminsList.map((admin: any) => {
                                    const isSelf = admin._id === adminId;
                                    return (
                                        <tr key={admin._id} className="bg-white border-b hover:bg-neutral-50">
                                            <td className="px-6 py-4 font-semibold text-neutral-900 flex items-center gap-2">
                                                {admin.email}
                                                {isSelf && (
                                                    <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 text-[10px] font-bold">
                                                        You
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${admin.isTwoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-800'}`}>
                                                    {admin.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {!isSelf && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteAdmin(admin._id)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add Admin Dialog */}
                <Dialog open={showAddAdmin} onOpenChange={setShowAddAdmin}>
                    <DialogContent className="max-w-md bg-white text-black p-6 rounded-2xl">
                        <DialogHeader>
                            <DialogTitle>Add Additional Administrator</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddAdmin} className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-700">Email Address</label>
                                <Input
                                    type="email"
                                    required
                                    placeholder="admin@arabicjuniors.com"
                                    value={newAdminEmail}
                                    onChange={(e) => setNewAdminEmail(e.target.value)}
                                    className="w-full text-sm h-10 py-2 px-3 border rounded-lg focus-within:border-pink-400 text-black"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-700">Password</label>
                                <Input
                                    type="password"
                                    required
                                    placeholder="At least 12 characters"
                                    value={newAdminPassword}
                                    onChange={(e) => setNewAdminPassword(e.target.value)}
                                    className="w-full text-sm h-10 py-2 px-3 border rounded-lg focus-within:border-pink-400 text-black"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => {
                                        setShowAddAdmin(false);
                                        setNewAdminEmail("");
                                        setNewAdminPassword("");
                                    }}
                                    className="text-black border"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submittingAdmin}
                                    className="bg-gradient-to-r from-[#FF60A8] to-[#FB6238] text-white font-semibold"
                                >
                                    Add Admin
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </React.Fragment>
    )
}

export default SettingsPage