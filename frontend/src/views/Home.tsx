import { useNavigate } from 'react-router-dom'
import { useSessionUser } from '@/store/authStore'
import Card from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import Button from '@/components/ui/Button'
import { MdAccountBalanceWallet, MdPeople, MdTrendingUp, MdSecurity, MdArrowForward } from 'react-icons/md'

const Home = () => {
    const navigate = useNavigate()
    const user = useSessionUser((state) => state.user)
    const username = user?.userName || (user as any)?.username || 'MASTAN99M'

    return (
        <div className="flex-1 w-full p-4 sm:p-6 bg-slate-50/70 dark:bg-gray-900 min-h-[calc(100vh-64px)]">
            {/* Header Breadcrumbs Row */}
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200/80 dark:border-gray-800">
                <div className="flex items-center gap-2">
                    <h1 className="text-sm font-black tracking-wide text-gray-800 dark:text-gray-100 uppercase">
                        EXCHANGE DASHBOARD
                    </h1>
                    <Tag className="bg-teal-50 border-teal-200 text-teal-700 font-bold text-[10px]">
                        LIVE
                    </Tag>
                </div>
                <div className="text-xs text-gray-500 font-medium">
                    <span className="text-gray-400">Home</span>
                    <span className="mx-1.5 text-gray-400">/</span>
                    <span className="text-teal-700 dark:text-teal-400 font-semibold">Dashboard</span>
                </div>
            </div>

            {/* Welcome Banner Card */}
            <Card 
                className="bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600 border-none text-white mb-6 shadow-lg shadow-teal-700/10 rounded-2xl overflow-hidden"
                bodyClass="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
                <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Rolex Master Portal
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white">
                        Welcome back, {username}
                    </h2>
                    <p className="text-xs text-teal-100 mt-1 max-w-xl">
                        Master administrative account active. Full 2FA cryptographic protection enabled with realtime odds synchronization.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        size="sm"
                        variant="plain"
                        onClick={() => navigate('/verify')}
                        className="!bg-white/10 hover:!bg-white/20 !text-white text-xs font-semibold rounded-lg"
                        icon={<MdSecurity />}
                    >
                        2FA Screen
                    </Button>
                    <Button 
                        size="sm"
                        variant="solid"
                        onClick={() => navigate('/clients')}
                        className="!bg-white hover:!bg-teal-50 !text-teal-800 text-xs font-bold shadow-md rounded-lg"
                    >
                        Manage Clients
                    </Button>
                </div>
            </Card>

            {/* Quick Metrics Cards using Ecme Theme Card Component */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card 
                    className="shadow-sm border-gray-200/80 dark:border-gray-800 rounded-xl hover:shadow-md transition-all"
                    bodyClass="p-4 flex items-center justify-between"
                >
                    <div>
                        <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Total Balance</div>
                        <div className="text-2xl font-black text-gray-800 dark:text-gray-100 mt-1 font-mono">143,418.00</div>
                        <div className="text-[11px] text-teal-600 dark:text-teal-400 font-bold mt-0.5">PTS Available</div>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center text-2xl">
                        <MdAccountBalanceWallet />
                    </div>
                </Card>

                <Card 
                    className="shadow-sm border-gray-200/80 dark:border-gray-800 rounded-xl hover:shadow-md transition-all"
                    bodyClass="p-4 flex items-center justify-between"
                >
                    <div>
                        <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Upline Share</div>
                        <div className="text-2xl font-black text-gray-800 dark:text-gray-100 mt-1 font-mono">25,589.00</div>
                        <div className="text-[11px] text-blue-600 dark:text-blue-400 font-bold mt-0.5">MASTAN365</div>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl">
                        <MdTrendingUp />
                    </div>
                </Card>

                <Card 
                    className="shadow-sm border-gray-200/80 dark:border-gray-800 rounded-xl hover:shadow-md transition-all"
                    bodyClass="p-4 flex items-center justify-between"
                >
                    <div>
                        <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Active Clients</div>
                        <div className="text-2xl font-black text-gray-800 dark:text-gray-100 mt-1 font-mono">1,248</div>
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">+14 registered today</div>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl">
                        <MdPeople />
                    </div>
                </Card>

                <Card 
                    className="shadow-sm border-gray-200/80 dark:border-gray-800 rounded-xl hover:shadow-md transition-all"
                    bodyClass="p-4 flex items-center justify-between"
                >
                    <div>
                        <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Security State</div>
                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">PROTECTED</div>
                        <div className="text-[11px] text-gray-400 font-medium mt-0.5">TOTP 2FA Active</div>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl">
                        <MdSecurity />
                    </div>
                </Card>
            </div>

            {/* Quick Navigation Cards */}
            <Card 
                className="shadow-sm border-gray-200/80 dark:border-gray-800 rounded-xl"
                bodyClass="p-6"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Rolex Quick Navigation
                    </h3>
                    <Tag className="bg-slate-100 text-slate-600 text-[10px]">10 Modules Available</Tag>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {[
                        { name: 'Clients', path: '/clients', desc: 'Accounts & credits' },
                        { name: 'Accounts', path: '/accounts', desc: 'Ledger statements' },
                        { name: 'Deposit', path: '/deposit', desc: 'Banking in' },
                        { name: 'Withdraw', path: '/withdraw', desc: 'Payouts out' },
                        { name: 'Extra Users', path: '/extra-users', desc: 'Sub-agents' },
                        { name: 'A/C Statement', path: '/statement', desc: 'Detailed log' },
                        { name: 'Site Stats', path: '/site-user-stats', desc: 'Realtime views' },
                        { name: 'Global Search', path: '/global-search', desc: 'Fast query' },
                        { name: 'Change Password', path: '/change-password', desc: 'Credentials' },
                        { name: 'Verify 2FA', path: '/verify', desc: 'Security screen' },
                    ].map((item) => (
                        <div
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className="p-3.5 rounded-lg border border-gray-200/90 dark:border-gray-700/80 hover:border-teal-500 hover:bg-teal-50/30 dark:hover:bg-teal-950/20 cursor-pointer transition-all group"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-teal-600 transition-colors">
                                    {item.name}
                                </span>
                                <MdArrowForward className="text-gray-400 group-hover:text-teal-600 transition-transform group-hover:translate-x-0.5 text-xs" />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    )
}

export default Home
