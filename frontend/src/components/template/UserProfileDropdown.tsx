import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import { useSessionUser } from '@/store/authStore'
import { Link } from 'react-router-dom'
import { PiUserDuotone, PiSignOutDuotone, PiShieldCheckDuotone, PiKeyDuotone } from 'react-icons/pi'
import { useAuth } from '@/auth'
import Tag from '@/components/ui/Tag'

const _UserDropdown = () => {
    const user = useSessionUser((state) => state.user)
    const username = user?.full_name || user?.userName || (user as any)?.username || 'User'
    const email = user?.email || ''
    const role = ((user as any)?.role || 'Admin').toUpperCase()
    const balance = user?.balance !== undefined
        ? `${Number(user.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PTS`
        : '0.00 PTS'

    const { signOut } = useAuth()

    return (
        <Dropdown
            className="flex"
            toggleClassName="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
            renderTitle={
                <div className="cursor-pointer flex items-center gap-2.5">
                    <Avatar 
                        size={32} 
                        className="bg-gradient-to-tr from-teal-600 to-cyan-500 text-white font-bold text-xs"
                    >
                        {username.slice(0, 2).toUpperCase()}
                    </Avatar>
                    <div className="hidden md:flex flex-col text-left">
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-100 leading-tight">
                            {username}
                        </span>
                        <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold uppercase">
                            {role}
                        </span>
                    </div>
                </div>
            }
            placement="bottom-end"
        >
            <Dropdown.Item variant="header">
                <div className="py-2.5 px-3 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800">
                    <Avatar 
                        size={40} 
                        className="bg-gradient-to-tr from-teal-600 to-cyan-500 text-white font-bold text-sm"
                    >
                        {username.slice(0, 2).toUpperCase()}
                    </Avatar>
                    <div>
                        <div className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                            {username}
                        </div>
                        {email && (
                            <div className="text-[11px] text-gray-500">
                                {email}
                            </div>
                        )}
                        <div className="mt-1">
                            <Tag className="bg-teal-50 border-teal-200 text-teal-700 text-[10px] font-bold">
                                Balance: {balance}
                            </Tag>
                        </div>
                    </div>
                </div>
            </Dropdown.Item>

            <Dropdown.Item variant="divider" />

            <Dropdown.Item eventKey="2fa" className="px-0">
                <Link className="flex h-full w-full px-3 py-2 items-center gap-2 text-xs font-semibold" to="/verify">
                    <PiShieldCheckDuotone className="text-base text-teal-600" />
                    <span>2FA Verification</span>
                </Link>
            </Dropdown.Item>

            <Dropdown.Item eventKey="password" className="px-0">
                <Link className="flex h-full w-full px-3 py-2 items-center gap-2 text-xs font-semibold" to="/change-password">
                    <PiKeyDuotone className="text-base text-gray-500" />
                    <span>Change Password</span>
                </Link>
            </Dropdown.Item>

            <Dropdown.Item variant="divider" />

            <Dropdown.Item
                eventKey="Sign Out"
                className="gap-2 text-red-600 hover:text-red-700 text-xs font-semibold"
                onClick={() => signOut()}
            >
                <span className="text-lg">
                    <PiSignOutDuotone />
                </span>
                <span>Sign Out</span>
            </Dropdown.Item>
        </Dropdown>
    )
}

const UserProfileDropdown = withHeaderItem(_UserDropdown)

export default UserProfileDropdown
