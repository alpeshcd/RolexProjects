import Dropdown from '@/components/ui/Dropdown'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import { useSessionUser } from '@/store/authStore'
import { Link } from 'react-router-dom'
import { PiUserDuotone, PiSignOutDuotone, PiShieldCheckDuotone, PiKeyDuotone } from 'react-icons/pi'
import { useAuth } from '@/auth'

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
            toggleClassName="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-surface-hover transition-colors"
            renderTitle={
                <div className="cursor-pointer flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center text-xs font-bold">
                        {username.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="hidden md:flex flex-col text-left leading-tight">
                        <span className="text-[13px] font-semibold text-ink">
                            {username}
                        </span>
                        <span className="text-[10px] text-accent font-semibold uppercase tracking-[0.1em]">
                            {role}
                        </span>
                    </div>
                </div>
            }
            placement="bottom-end"
        >
            <Dropdown.Item variant="header">
                <div className="py-2.5 px-3 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">
                        {username.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <div className="font-semibold text-ink text-sm truncate">
                            {username}
                        </div>
                        {email && (
                            <div className="text-[11px] text-ink-3 truncate">
                                {email}
                            </div>
                        )}
                        <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-primary-subtle text-primary px-1.5 py-0.5 text-[10px] font-semibold">
                            Balance: {balance}
                        </div>
                    </div>
                </div>
            </Dropdown.Item>

            <Dropdown.Item variant="divider" />

            <Dropdown.Item eventKey="2fa" className="px-0">
                <Link className="flex h-full w-full px-3 py-2 items-center gap-2 text-xs font-semibold" to="/verify">
                    <PiShieldCheckDuotone className="text-base text-primary" />
                    <span>2FA Verification</span>
                </Link>
            </Dropdown.Item>

            <Dropdown.Item eventKey="password" className="px-0">
                <Link className="flex h-full w-full px-3 py-2 items-center gap-2 text-xs font-semibold" to="/change-password">
                    <PiKeyDuotone className="text-base text-ink-3" />
                    <span>Change Password</span>
                </Link>
            </Dropdown.Item>

            <Dropdown.Item variant="divider" />

            <Dropdown.Item
                eventKey="Sign Out"
                className="gap-2 text-error text-xs font-semibold"
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
