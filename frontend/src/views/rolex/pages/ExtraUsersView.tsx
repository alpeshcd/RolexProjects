import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    Card,
    Button,
    Input,
    Select,
    Tag,
    Modal,
    Space,
    Breadcrumb,
    Typography,
} from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { apiCreateUser, apiGetStaff, apiUpdateStaffStatus } from '@/services/AuthService'
import type { StaffUser } from '@/services/AuthService'

const { Title, Text } = Typography

type OperatorRole = 'Sub-Admin' | 'Settlement Manager' | 'Customer Support' | 'Audit Operator'

interface ExtraUser {
    id: number
    username: string
    name: string
    role: string
    assigned_portals: string[]
    status: 'Active' | 'Suspended'
    created_at: string
}

const ROLE_LABELS: Record<string, string> = {
    admin: 'Admin',
    supermaster: 'Super Master',
    operator: 'Operator',
}

const toExtraUser = (u: StaffUser): ExtraUser => ({
    id: u.id,
    username: u.username,
    name: u.full_name || u.username,
    role: ROLE_LABELS[u.role] || u.role,
    assigned_portals: [u.site || 'All Portals'],
    status: u.is_active ? 'Active' : 'Suspended',
    created_at: u.created_at ? new Date(u.created_at + 'Z').toLocaleString() : '-',
})

const errorText = (err: unknown, fallback: string): string => {
    const e = err as { response?: { data?: { detail?: string } }; message?: string }
    return e?.response?.data?.detail || e?.message || fallback
}

const ExtraUsersView = () => {
    const [users, setUsers] = useState<ExtraUser[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [togglingId, setTogglingId] = useState<number | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    const loadUsers = async () => {
        setLoading(true)
        try {
            const staff = await apiGetStaff()
            setUsers(staff.map(toExtraUser))
        } catch (err) {
            toast.push(
                <Notification title="Could not load operators" type="danger">
                    {errorText(err, 'Please try again.')}
                </Notification>
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadUsers()
    }, [])

    // Form fields
    const [newUsername, setNewUsername] = useState('')
    const [newName, setNewName] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [newRole, setNewRole] = useState<OperatorRole>('Settlement Manager')
    const [newPortals, setNewPortals] = useState('All Portals')

    const query = searchTerm.trim().toLowerCase()
    const filteredUsers = users.filter(
        (u) =>
            u.username.toLowerCase().includes(query) ||
            u.name.toLowerCase().includes(query) ||
            u.role.toLowerCase().includes(query)
    )

    const handleToggleStatus = async (user: ExtraUser) => {
        const activate = user.status !== 'Active'
        setTogglingId(user.id)
        try {
            const updated = await apiUpdateStaffStatus(user.id, activate)
            setUsers((prev) => prev.map((u) => (u.id === user.id ? toExtraUser(updated) : u)))
            toast.push(
                <Notification title="Status Changed" type="info">
                    User {user.username} marked as {activate ? 'Active' : 'Suspended'}.
                </Notification>
            )
        } catch (err) {
            toast.push(
                <Notification title="Status Change Failed" type="danger">
                    {errorText(err, 'Could not update status.')}
                </Notification>
            )
        } finally {
            setTogglingId(null)
        }
    }

    const handleCreateUser = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!newUsername.trim() || !newName.trim() || !newPassword) {
            toast.push(
                <Notification title="Missing Fields" type="warning">
                    Please provide username, full name and password.
                </Notification>
            )
            return
        }
        if (newPassword.length < 6) {
            toast.push(
                <Notification title="Weak Password" type="warning">
                    Password must be at least 6 characters.
                </Notification>
            )
            return
        }

        setIsCreating(true)
        try {
            const created = await apiCreateUser({
                username: newUsername.trim(),
                password: newPassword,
                full_name: newName.trim(),
                role: newRole,
                site: newPortals,
            })
            setUsers((prev) => [toExtraUser(created as unknown as StaffUser), ...prev])
            toast.push(
                <Notification title="User Created" type="success">
                    Extra administrative user {created.username} added. They can now sign in.
                </Notification>
            )
            setIsAddModalOpen(false)
            setNewUsername('')
            setNewName('')
            setNewPassword('')
        } catch (err) {
            toast.push(
                <Notification title="Create Failed" type="danger">
                    {errorText(err, 'Could not create user.')}
                </Notification>
            )
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <div className="space-y-4 w-full">
            {/* Top Sober Ant Design Header */}
            <div className="panel px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <Breadcrumb
                        items={[
                            { title: <Link to="/home">Home</Link> },
                            { title: 'Administration' },
                            { title: 'Extra Users' },
                        ]}
                        className="text-xs mb-1"
                    />
                    <div className="flex items-center gap-2">
                        <Title level={4} style={{ margin: 0, fontSize: '18px' }}>
                            Extra Users & Sub-Administrators
                        </Title>
                        <Tag color="cyan">Staff</Tag>
                    </div>
                    <Text type="secondary" className="text-xs">
                        Assign delegated operators, settlement managers, and restricted portal administrators.
                    </Text>
                </div>

                <Space wrap>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        Add Operator
                    </Button>
                </Space>
            </div>

            {/* Search Filter Card */}
            <Card size="small" className="border border-line">
                <div className="max-w-md">
                    <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                        Search Operator
                    </label>
                    <Input
                        placeholder="Search by username, name, or role..."
                        prefix={<SearchOutlined className="text-ink-3" />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        allowClear
                    />
                </div>
            </Card>

            {/* Users Table Card */}
            <Card size="small" bodyStyle={{ padding: 0 }} className="border border-line overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-surface-2 text-[11px] font-bold text-ink-2 uppercase tracking-wider border-b border-line">
                            <tr>
                                <th className="py-2.5 px-3">NO</th>
                                <th className="py-2.5 px-3">USERNAME</th>
                                <th className="py-2.5 px-3">FULL NAME</th>
                                <th className="py-2.5 px-3">DELEGATED ROLE</th>
                                <th className="py-2.5 px-3">ASSIGNED PORTALS</th>
                                <th className="py-2.5 px-3 text-center">STATUS</th>
                                <th className="py-2.5 px-3">REGISTERED AT</th>
                                <th className="py-2.5 px-3 text-center">ACTION</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-10 text-center text-ink-3 font-medium">
                                        {loading ? 'Loading operators…' : 'No Operators Found'}
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u, idx) => (
                                    <tr key={u.id} className="hover:bg-surface-hover transition-colors">
                                        <td className="py-2.5 px-3 font-semibold text-ink-3">{idx + 1}</td>
                                        <td className="py-2.5 px-3 font-mono font-bold text-ink">
                                            {u.username}
                                        </td>
                                        <td className="py-2.5 px-3 font-semibold text-ink">
                                            {u.name}
                                        </td>
                                        <td className="py-2.5 px-3">
                                            <Tag color={u.role === 'Sub-Admin' ? 'purple' : 'blue'}>
                                                {u.role}
                                            </Tag>
                                        </td>
                                        <td className="py-2.5 px-3">
                                            <Space wrap size={[4, 4]}>
                                                {u.assigned_portals.map((p, i) => (
                                                    <Tag key={i} color="cyan">{p}</Tag>
                                                ))}
                                            </Space>
                                        </td>
                                        <td className="py-2.5 px-3 text-center">
                                            <Tag color={u.status === 'Active' ? 'success' : 'error'}>
                                                {u.status}
                                            </Tag>
                                        </td>
                                        <td className="py-2.5 px-3 text-ink-3 text-[11px] whitespace-nowrap">
                                            {u.created_at}
                                        </td>
                                        <td className="py-2.5 px-3 text-center">
                                            <Button
                                                size="small"
                                                danger={u.status === 'Active'}
                                                loading={togglingId === u.id}
                                                onClick={() => handleToggleStatus(u)}
                                            >
                                                {u.status === 'Active' ? 'Suspend' : 'Activate'}
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-4 py-2.5 bg-surface-2 border-t border-line flex items-center justify-between text-xs text-ink-3">
                    <span>Showing <strong>1</strong> to <strong>{filteredUsers.length}</strong> operators</span>
                    <span className="font-medium text-ink-3">Rolex RBAC Security</span>
                </div>
            </Card>

            {/* Create Operator Modal */}
            <Modal
                title="Create Delegated Operator"
                open={isAddModalOpen}
                onCancel={() => setIsAddModalOpen(false)}
                onOk={() => handleCreateUser()}
                okText="Create User"
                confirmLoading={isCreating}
            >
                <div className="space-y-3 pt-2 text-xs">
                    <div>
                        <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                            Operator Username <span className="text-error">*</span>
                        </label>
                        <Input
                            placeholder="e.g. OP_SETTLEMENT_03"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                            Full Name <span className="text-error">*</span>
                        </label>
                        <Input
                            placeholder="e.g. Rajesh Kumar"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                            Password <span className="text-error">*</span>
                        </label>
                        <Input.Password
                            placeholder="Minimum 6 characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                            Operator Role
                        </label>
                        <Select
                            value={newRole}
                            onChange={(val) => setNewRole(val as OperatorRole)}
                            className="w-full"
                            options={[
                                { label: 'Settlement Manager', value: 'Settlement Manager' },
                                { label: 'Sub-Admin', value: 'Sub-Admin' },
                                { label: 'Customer Support', value: 'Customer Support' },
                                { label: 'Audit Operator', value: 'Audit Operator' },
                            ]}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                            Assigned Portal
                        </label>
                        <Select
                            value={newPortals}
                            onChange={(val) => setNewPortals(val)}
                            className="w-full"
                            options={[
                                { label: 'All Portals', value: 'All Portals' },
                                { label: 'Mastan 247', value: 'Mastan 247' },
                                { label: 'Mastan365', value: 'Mastan365' },
                                { label: 'Mastan99', value: 'Mastan99' },
                                { label: 'Mastanredd', value: 'Mastanredd' },
                            ]}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default ExtraUsersView
