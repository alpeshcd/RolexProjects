import {
    PiHouseLineDuotone,
    PiArrowsInDuotone,
    PiSquaresFourBold,
    PiMagnifyingGlassBold,
    PiUserBold,
    PiUsersBold,
    PiWalletBold,
    PiHandCoinsBold,
    PiMoneyBold,
    PiFileTextBold,
    PiChartLineUpBold,
    PiKeyBold,
    PiSignOutBold
} from 'react-icons/pi'
import {
    MdDashboard,
    MdSearch,
    MdPerson,
    MdAccountBalanceWallet,
    MdAttachMoney,
    MdMoneyOff,
    MdPeople,
    MdReceiptLong,
    MdQueryStats,
    MdVpnKey
} from 'react-icons/md'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    home: <PiSquaresFourBold className="text-lg" />,
    dashboard: <MdDashboard className="text-lg text-slate-600" />,
    globalSearch: <MdSearch className="text-xl text-slate-600" />,
    clients: <MdPerson className="text-lg text-slate-600" />,
    accounts: <MdAccountBalanceWallet className="text-lg text-slate-600" />,
    deposit: <MdAttachMoney className="text-lg text-slate-600" />,
    withdraw: <MdMoneyOff className="text-lg text-slate-600" />,
    extraUsers: <MdPeople className="text-lg text-slate-600" />,
    statement: <MdReceiptLong className="text-lg text-slate-600" />,
    siteStats: <MdQueryStats className="text-lg text-slate-600" />,
    changePassword: <MdVpnKey className="text-lg text-slate-600" />,
    collapseMenu: <PiArrowsInDuotone />,
}

export default navigationIcon
