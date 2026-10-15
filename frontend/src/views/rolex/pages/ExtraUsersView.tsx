import { useState } from 'react'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import Dialog from '@/components/ui/Dialog'
import {
    HiUserGroup,
    HiPlus,
    HiShieldCheck,
    HiLockClosed,
    HiCheck,
    HiTrash,
    HiPencil,
    HiSearch,
} from 'react-icons/hi'
import { MdAdminPanelSettings, MdSupervisorAccount } from 'react-icons/md'

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

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault()
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
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700/60 shadow-xl text-white">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-1">
                        <span>Rolex Administration</span>
                        <span>•</span>
                        <span>Sub-Agent Roles</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3">
                        <MdSupervisorAccount className="text-emerald-400 text-3xl" />
                        <span>EXTRA USERS & SUB-ADMINISTRATORS</span>
                    </h1>
                    <p className="text-xs text-slate-300 mt-1">
                        Assign delegated operators, settlement managers, and restricted portal administrators.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2 transition"
                >
                    <HiPlus className="text-base" />
                    <span>Add Extra User</span>
                </button>
            </div>

            {/* Filter and Table */}
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <input
                            type="text"
                            placeholder="Search sub-users by name, role or username..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3.5 py-2 pl-9 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#008080]"
                        />
                        <HiSearch className="absolute left-3 top-2.5 text-slate-400 text-sm" />
                    </div>
                    <div className="text-xs text-slate-500 font-semibold">
                        Showing {filteredUsers.length} active administrative accounts
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-100 dark:bg-slate-900/80 text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="py-3 px-4">USER ID</th>
                                <th className="py-3 px-4">USERNAME</th>
                                <th className="py-3 px-4">STAFF NAME</th>
                                <th className="py-3 px-4">ASSIGNED ROLE</th>
                                <th className="py-3 px-4">PORTAL PERMISSIONS</th>
                                <th className="py-3 px-4">STATUS</th>
                                <th className="py-3 px-4 text-center">ACTION</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredUsers.map((u) => (
                                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-white">
                                        #{u.id}
                                    </td>
                                    <td className="py-3.5 px-4 font-bold text-teal-600 dark:text-teal-400">
                                        {u.username}
                                    </td>
                                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                                        {u.name}
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <div className="flex flex-wrap gap-1">
                                            {u.assigned_portals.map((p, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                                >
                                                    {p}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-3.5 px-4">
                                        {u.status === 'Active' ? (
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-300">
                                                Suspended
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3.5 px-4 text-center">
                                        <button
                                            type="button"
                                            onClick={() => handleToggleStatus(u.id)}
                                            className={`px-3 py-1 rounded text-[11px] font-bold shadow-sm transition ${
                                                u.status === 'Active'
                                                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                            }`}
                                        >
                                            {u.status === 'Active' ? 'Suspend' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Extra User Dialog */}
            <Dialog
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onRequestClose={() => setIsAddModalOpen(false)}
                width={500}
            >
                <form onSubmit={handleCreateUser} className="space-y-4 p-2">
                    <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center text-2xl font-bold">
                            <MdAdminPanelSettings />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                Add Extra Administrative User
                            </h3>
                            <p className="text-xs text-slate-500">
                                Create an operator login with specific role privileges.
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                            Username:
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. OP_SETTLEMENT_03"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono uppercase text-slate-800 dark:text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                            Staff Full Name:
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Suresh Kumar"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                            Assigned Role:
                        </label>
                        <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value as any)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-white"
                        >
                            <option value="Settlement Manager">Settlement Manager (Deposits & Payouts)</option>
                            <option value="Customer Support">Customer Support</option>
                            <option value="Audit Operator">Audit Operator (Ledger & Statements)</option>
                            <option value="Sub-Admin">Sub-Admin (Full Delegated Access)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                            Assigned Portal Group:
                        </label>
                        <select
                            value={newPortals}
                            onChange={(e) => setNewPortals(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-white"
                        >
                            <option value="All Portals">All Portals (Global)</option>
                            <option value="Mastan 247">Mastan 247 Only</option>
                            <option value="Mastan365">Mastan365 Only</option>
                            <option value="Mastan99">Mastan99 Only</option>
                            <option value="Mastanreddy">Mastanreddy Only</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg uppercase tracking-wider"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 bg-[#008080] hover:bg-[#006e6e] text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow"
                        >
                            Create User
                        </button>
                    </div>
                </form>
            </Dialog>
        </div>
    )
}

export default ExtraUsersView
