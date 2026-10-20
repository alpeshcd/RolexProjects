import type { Role } from './types'

export interface MenuItem {
    label: string
    to: string
    letter?: string
}

export const MARKET_MENU: MenuItem[] = [
    { label: 'Market Analysis', to: '/market/analysis' },
    { label: 'Multi Market', to: '/market/multi' },
    { label: 'Unsettled Bets', to: '/market/unsettled' },
    { label: 'Casino1 Pending Bets', to: '/market/casino-pending' },
    { label: 'Int Casino History', to: '/market/casino-history' },
]

export const CLIENT_MENU: (MenuItem & { adminOnly?: boolean })[] = [
    { letter: 'A', label: 'Down-Line', to: '/clients/downline' },
    { letter: 'S', label: 'Super Master', to: '/clients/super-master', adminOnly: true },
    { letter: 'B', label: 'Blocked Users', to: '/clients/blocked' },
]

export const CREATE_ITEMS: Record<Exclude<Role, 'admin'>, MenuItem> = {
    supermaster: { letter: 'S', label: 'Super Master', to: '/create/supermaster' },
    master: { letter: 'M', label: 'Master', to: '/create/master' },
    client: { letter: 'C', label: 'Client', to: '/create/client' },
}

export const ACCOUNT_MENU: MenuItem[] = [
    { label: 'A/C Statement', to: '/reports/statement' },
    { label: 'Old A/C Statement', to: '/reports/old-statement' },
    { label: 'Top Clients', to: '/reports/top-clients' },
    { label: 'Top Clients New', to: '/reports/top-clients-new' },
    { label: 'Sport Report', to: '/reports/sport' },
    { label: 'Sport Report New', to: '/reports/sport-new' },
    { label: 'Weekly Report', to: '/reports/weekly' },
    { label: 'Settlement Report', to: '/reports/settlement-report' },
    { label: 'Chip Smry', to: '/reports/chip-summary' },
    { label: 'Balance Sheet', to: '/reports/balance-sheet' },
    { label: 'Settlement', to: '/reports/settlement' },
    { label: 'Export', to: '/reports/export' },
    { label: 'Profile', to: '/profile' },
    { label: 'Change Password', to: '/change-password' },
]

// Reports whose numbers come from bets and settlements, which only the Mastan
// exchange API will provide. Until then they show their layout with no rows.
export const PENDING_REPORTS: Record<string, { title: string; columns: string[]; dateFilter?: boolean }> = {
    '/market/analysis': { title: 'Market Analysis', columns: ['Sport', 'Event', 'Market', 'Total Bets', 'Exposure'] },
    '/market/casino-pending': {
        title: 'Casino1 Pending Bets',
        columns: ['Client', 'Game', 'Round ID', 'Stake', 'Placed At'],
    },
    '/market/casino-history': {
        title: 'Int Casino History',
        columns: ['Client', 'Game', 'Round ID', 'Stake', 'Result', 'Profit/Loss', 'Date'],
        dateFilter: true,
    },
    '/reports/old-statement': {
        title: 'Old A/C Statement',
        columns: ['Date', 'Description', 'Credit', 'Debit', 'Balance'],
        dateFilter: true,
    },
    '/reports/top-clients': { title: 'Top Clients', columns: ['Client', 'Total Bets', 'Turnover', 'Profit/Loss'], dateFilter: true },
    '/reports/top-clients-new': {
        title: 'Top Clients New',
        columns: ['Client', 'Total Bets', 'Turnover', 'Profit/Loss', 'Commission'],
        dateFilter: true,
    },
    '/reports/sport': { title: 'Sport Report', columns: ['Sport', 'Bets', 'Turnover', 'Profit/Loss', 'Commission'], dateFilter: true },
    '/reports/sport-new': {
        title: 'Sport Report New',
        columns: ['Sport', 'Event', 'Bets', 'Turnover', 'Profit/Loss', 'Commission'],
        dateFilter: true,
    },
    '/reports/weekly': { title: 'Weekly Report', columns: ['Week', 'Turnover', 'Profit/Loss', 'Commission', 'Settlement'] },
    '/reports/settlement-report': {
        title: 'Settlement Report',
        columns: ['Date', 'User', 'Amount', 'Type', 'Remark'],
        dateFilter: true,
    },
    '/reports/chip-summary': { title: 'Chip Smry', columns: ['User', 'Opening', 'Deposit', 'Withdraw', 'Profit/Loss', 'Closing'] },
    '/reports/balance-sheet': { title: 'Balance Sheet', columns: ['Particular', 'Debit', 'Credit'] },
    '/reports/settlement': { title: 'Settlement', columns: ['User', 'Balance', 'Profit/Loss', 'Settle Amount', 'Action'] },
    '/reports/export': { title: 'Export', columns: ['Report', 'From', 'To', 'Format', 'Download'] },
}
