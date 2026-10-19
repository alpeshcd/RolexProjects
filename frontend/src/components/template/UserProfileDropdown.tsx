import Dropdown from '@/components/ui/Dropdown'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import { useSessionUser } from '@/store/authStore'
import { Link } from 'react-router-dom'
import { PiSignOutBold, PiShieldCheckDuotone, PiKeyDuotone, PiCaretDownBold } from 'react-icons/pi'
import { useAuth } from '@/auth'
import { getInitials, formatRole } from '@/utils/userDisplay'

const Avatar = ({ initials, size }: { initials: string; size: 'sm' | 'md' }) => (
    <div
        className={
            size === 'sm'
                ? 'h-8 w-8 rounded-full bg-primary-subtle text-primary flex items-center justify-center text-[12px] font-bold shrink-0'
                : 'h-11 w-11 rounded-full bg-primary-subtle text-primary flex items-center justify-center text-[14px] font-bold shrink-0'
        }
    >
        {initials}
    </div>
)

const _UserDropdown = () => {
    const user = useSessionUser((state) => state.user)
    const username = user?.full_name || user?.userName || user?.username || 'User'
    const email = user?.email || ''
    const role = formatRole(user?.role || 'Admin')
    const initials = getInitials(username)

    const { signOut } = useAuth()

    return (
        <Dropdown
            className="flex"
            toggleClassName="flex items-center rounded-lg py-1 pl-1 pr-2 hover:bg-surface-hover transition-colors"
            menuClass="w-[264px] !p-2"
            renderTitle={
                <div className="cursor-pointer flex items-center gap-2.5">
                    <Avatar initials={initials} size="sm" />
                    <div className="hidden md:flex flex-col text-left leading-tight">
                        <span className="text-[13px] font-semibold text-ink max-w-[160px] truncate">
                            {username}
                        </span>
                        <span className="text-[11px] font-medium text-ink-3">{role}</span>
                    </div>
                    <PiCaretDownBold className="hidden md:block text-[11px] text-ink-3" />
                </div>
            }
            placement="bottom-end"
        >
            <Dropdown.Item variant="header">
                <div className="px-2 pt-2 pb-3 flex items-center gap-3">
                    <Avatar initials={initials} size="md" />
                    <div className="min-w-0">
                        <div className="font-semibold text-ink text-[14px] leading-tight truncate">
                            {username}
                        </div>
                        <div className="mt-0.5 text-[12px] text-ink-3 truncate">
                            {email || role}
                        </div>
                    </div>
                </div>
            </Dropdown.Item>

            <Dropdown.Item variant="divider" />

            <Dropdown.Item eventKey="2fa" className="px-0">
                <Link className="flex h-full w-full px-2.5 items-center gap-2.5 outline-none" to="/verify">
                    <PiShieldCheckDuotone className="text-lg text-ink-3" />
                    <span>2FA Verification</span>
                </Link>
            </Dropdown.Item>

            <Dropdown.Item eventKey="password" className="px-0">
                <Link className="flex h-full w-full px-2.5 items-center gap-2.5 outline-none" to="/change-password">
                    <PiKeyDuotone className="text-lg text-ink-3" />
                    <span>Change Password</span>
                </Link>
            </Dropdown.Item>

            <Dropdown.Item variant="divider" />

            <Dropdown.Item
                eventKey="Sign Out"
                className="!px-2.5 gap-2.5 !text-error hover:!bg-error-subtle"
                onClick={() => signOut()}
            >
                <PiSignOutBold className="text-lg" />
                <span>Sign Out</span>
            </Dropdown.Item>
        </Dropdown>
    )
}

const UserProfileDropdown = withHeaderItem(_UserDropdown)

export default UserProfileDropdown
