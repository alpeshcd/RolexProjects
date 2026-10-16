import { useState } from 'react'
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
import {
    PlusOutlined,
    SearchOutlined,
    UserOutlined,
    CheckOutlined,
} from '@ant-design/icons'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

const { Title, Text } = Typography

interface ExtraUser {
    id: number
    username: string
    name: string
    role: 'Sub-Admin' | 'Settlement Manager' | 'Customer Support' | 'Audit Operator'
    assigned_portals: string[]
    status: 'Active' | 'Suspended'
    created_at: string
}

const INITIAL_EXTRA_USERS: ExtraUser[] = [
    {
        id: 701,
        username: 'OP_DEPOSIT_01',
        name: 'Vikas Sharma',
        role: 'Settlement Manager',
        assigned_portals: ['Mastan 247', 'Mastan365', 'Mastan99'],
        status: 'Active',
        created_at: '12/10/2026 10:24 AM',
    },
    {
        id: 702,
        username: 'OP_WITHDRAW_02',
        name: 'Rahul Varma',
        role: 'Settlement Manager',
        assigned_portals: ['Mastan99', 'Mastanreddy'],
        status: 'Active',
        created_at: '10/10/2026 03:15 PM',
    },
    {
        id: 703,
        username: 'SUPPORT_CHAUDHARY',
        name: 'Alpesh Chaudhary',
        role: 'Sub-Admin',
        assigned_portals: ['All Portals'],
        status: 'Active',
        created_at: '01/10/2026 09:00 AM',
    },
    {
        id: 704,
        username: 'AUDIT_OFFICER_99',
        name: 'Pooja Patel',
        role: 'Audit Operator',
        assigned_portals: ['Mastan365', 'Mastan99'],
        status: 'Active',
        created_at: '05/10/2026 11:40 AM',
    },
]

const ExtraUsersView = () => {
    const [users, setUsers] = useState<ExtraUser[]>(INITIAL_EXTRA_USERS)
    const [searchTerm, setSearchTerm] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    // Form fields
    const [newUsername, setNewUsername] = useState('')
    const [newName, setNewName] = useState('')
    const [newRole, setNewRole] = useState<ExtraUser['role']>('Settlement Manager')
    const [newPortals, setNewPortals] = useState('All Portals')

    const filteredUsers = users.filter(
        (u) =>
            u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.role.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleToggleStatus = (id: number) => {
        setUsers((prev) =>
            prev.map((u) => {
                if (u.id === id) {
                    const newStatus = u.status === 'Active' ? 'Suspended' : 'Active'
                    toast.push(
                        <Notification title="Status Changed" type="info">
                            User {u.username} marked as {newStatus}.
                        </Notification>
                    )
                    return { ...u, status: newStatus }
                }
                return u
            })
        )
    }

    const handleCreateUser = (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!newUsername.trim() || !newName.trim()) {
            toast.push(
                <Notification title="Missing Fields" type="warning">
                    Please provide username and full name.
                </Notification>
            )
            return
        }

        const newUser: ExtraUser = {
            id: Date.now() % 10000,
            username: newUsername.trim().toUpperCase(),
            name: newName.trim(),
            role: newRole,
            assigned_portals: [newPortals],
            status: 'Active',
            created_at: new Date().toLocaleString(),
        }

        setUsers((prev) => [newUser, ...prev])
        toast.push(
            <Notification title="User Created" type="success">
                Extra administrative user {newUser.username} added successfully!
            </Notification>
        )
        setIsAddModalOpen(false)
        setNewUsername('')
        setNewName('')
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
                                        No Operators Found
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
                                                onClick={() => handleToggleStatus(u.id)}
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
                            Operator Role
                        </label>
                        <Select
                            value={newRole}
                            onChange={(val) => setNewRole(val as ExtraUser['role'])}
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
