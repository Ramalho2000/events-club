'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Loader2, UserPlus, Shield, UserCog } from 'lucide-react';
import type { StaffRole } from '@/types/user';

interface StaffMember {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  createdAt: Date | string;
}

interface AdminUserListProps {
  initialStaff: StaffMember[];
  translations: {
    addStaff: string;
    emailPlaceholder: string;
    user: string;
    email: string;
    role: string;
    actions: string;
    noStaff: string;
    cannotRemoveSelf: string;
    addFailed: string;
    removeFailed: string;
    roleAdmin: string;
    roleManager: string;
    changeRoleFailed: string;
  };
}

export default function AdminUserList({
  initialStaff,
  translations: t,
}: AdminUserListProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<StaffRole>('manager');
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: selectedRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t.addFailed);
      }
      setEmail('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.addFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    setRemoving(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t.removeFailed);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.removeFailed);
    } finally {
      setRemoving(null);
    }
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    setChangingRole(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t.changeRoleFailed);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.changeRoleFailed);
    } finally {
      setChangingRole(null);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Add staff form */}
      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
        <Input
          type="email"
          placeholder={t.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1"
        />
        <Select
          value={selectedRole}
          onValueChange={(v) => setSelectedRole(v as StaffRole)}
        >
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manager">{t.roleManager}</SelectItem>
            <SelectItem value="admin">{t.roleAdmin}</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="mr-2 h-4 w-4" />
          )}
          <span className="hidden sm:inline">{t.addStaff}</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </form>

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Staff list */}
      {initialStaff.length > 0 ? (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>{t.user}</TableHead>
                <TableHead className="hidden sm:table-cell">
                  {t.email}
                </TableHead>
                <TableHead>{t.role}</TableHead>
                <TableHead className="text-right">{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialStaff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    {member.image ? (
                      <Image
                        src={member.image}
                        alt={member.name || ''}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : member.role === 'admin' ? (
                      <Shield className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <UserCog className="h-5 w-5 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{member.name || '—'}</span>
                      <span className="text-xs text-muted-foreground sm:hidden">
                        {member.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {member.email}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={member.role}
                      onValueChange={(v) => handleRoleChange(member.id, v)}
                      disabled={changingRole === member.id}
                    >
                      <SelectTrigger className="w-full sm:w-[130px]">
                        {changingRole === member.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <SelectValue />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">
                          <Badge
                            variant="default"
                            className="pointer-events-none"
                          >
                            {t.roleAdmin}
                          </Badge>
                        </SelectItem>
                        <SelectItem value="manager">
                          <Badge
                            variant="secondary"
                            className="pointer-events-none"
                          >
                            {t.roleManager}
                          </Badge>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={removing === member.id}
                      onClick={() => handleRemove(member.id)}
                    >
                      {removing === member.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg text-muted-foreground">
          <Shield className="mx-auto h-8 w-8 mb-3" />
          <p>{t.noStaff}</p>
        </div>
      )}
    </div>
  );
}
