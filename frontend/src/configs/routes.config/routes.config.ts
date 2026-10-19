import { lazy } from 'react'
import authRoute from './authRoute'
import othersRoute from './othersRoute'
import type { Routes } from '@/@types/routes'

// One component per module, shared by all of its routes, so switching tabs (which changes
// the URL) keeps the page mounted instead of reloading it
const DepositPage = lazy(() => import('@/views/rolex/pages').then(m => ({ default: m.DepositView })))
const WithdrawPage = lazy(() => import('@/views/rolex/pages').then(m => ({ default: m.WithdrawView })))

export const publicRoutes: Routes = [
    ...authRoute,
]

export const protectedRoutes: Routes = [
    {
        key: 'rolex.dashboard',
        path: '/home',
        component: lazy(() => import('@/views/Home')),
        authority: [],
    },
    {
        key: 'rolex.verify',
        path: '/verify-2fa',
        component: lazy(() => import('@/views/rolex/Verify2FA/Verify2FA')),
        authority: [],
    },
    {
        key: 'rolex.globalSearch',
        path: '/global-search',
        component: lazy(() => import('@/views/rolex/pages').then(m => ({ default: m.GlobalSearchView }))),
        authority: [],
    },
    {
        key: 'rolex.clients.list',
        path: '/clients',
        component: lazy(() => import('@/views/rolex/pages').then(m => ({ default: m.ClientsView }))),
        authority: [],
    },
    {
        key: 'rolex.clients.add',
        path: '/clients/add',
        component: lazy(() => import('@/views/rolex/pages').then(m => ({ default: m.AddClientsView }))),
        authority: [],
    },
    {
        key: 'rolex.accounts.list',
        path: '/accounts',
        component: lazy(() => import('@/views/rolex/pages').then(m => ({ default: m.AccountsView }))),
        authority: [],
    },
    {
        key: 'rolex.accounts.add',
        path: '/accounts/create',
        component: lazy(() => import('@/views/rolex/pages').then(m => ({ default: m.AddAccountView }))),
        authority: [],
    },
    {
        key: 'rolex.deposit.list',
        path: '/deposit',
        component: DepositPage,
        authority: [],
    },
    {
        key: 'rolex.deposit.list',
        path: '/deposits',
        component: DepositPage,
        authority: [],
    },
    {
        key: 'rolex.deposit.history',
        path: '/deposits/history',
        component: DepositPage,
        authority: [],
    },
    {
        key: 'rolex.deposit.utrEntry',
        path: '/deposits/utr-entry',
        component: DepositPage,
        authority: [],
    },
    {
        key: 'rolex.deposit.utrPending',
        path: '/deposits/utr-pending',
        component: DepositPage,
        authority: [],
    },
    {
        key: 'rolex.deposit.utrRemoved',
        path: '/deposits/utr-entry/removed-list',
        component: DepositPage,
        authority: [],
    },
    {
        key: 'rolex.withdraw.list',
        path: '/withdraw',
        component: WithdrawPage,
        authority: [],
    },
    {
        key: 'rolex.withdraw.list',
        path: '/withdrawals',
        component: WithdrawPage,
        authority: [],
    },
    {
        key: 'rolex.withdraw.history',
        path: '/withdrawals/history',
        component: WithdrawPage,
        authority: [],
    },
    {
        key: 'rolex.withdraw.history',
        path: '/withdraw/history',
        component: WithdrawPage,
        authority: [],
    },
    {
        key: 'rolex.extraUsers.manage',
        path: '/extra-users',
        component: lazy(() => import('@/views/rolex/pages').then(m => ({ default: m.ExtraUsersView }))),
        authority: [],
    },
    {
        key: 'rolex.statement',
        path: '/statement',
        component: lazy(() => import('@/views/rolex/pages').then(m => ({ default: m.StatementView }))),
        authority: [],
    },
    {
        key: 'rolex.statement',
        path: '/account-statement',
        component: lazy(() => import('@/views/rolex/pages').then(m => ({ default: m.StatementView }))),
        authority: [],
    },
    {
        key: 'rolex.siteStats',
        path: '/site-user-stats',
        component: lazy(() => import('@/views/rolex/pages').then(m => ({ default: m.SiteStatsView }))),
        authority: [],
    },
    {
        key: 'rolex.siteStats',
        path: '/users/site-user-stats',
        component: lazy(() => import('@/views/rolex/pages').then(m => ({ default: m.SiteStatsView }))),
        authority: [],
    },
    {
        key: 'rolex.changePassword',
        path: '/change-password',
        component: lazy(() => import('@/views/rolex/pages').then(m => ({ default: m.ChangePasswordView }))),
        authority: [],
    },
    ...othersRoute,
]
