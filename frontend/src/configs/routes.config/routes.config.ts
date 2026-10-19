import { lazy } from 'react'
import authRoute from './authRoute'
import othersRoute from './othersRoute'
import type { Routes } from '@/@types/routes'

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
        key: 'rolex.clients',
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
        key: 'rolex.accounts',
        path: '/accounts',
        component: lazy(() => import('@/views/rolex/pages').then(m => ({ default: m.AccountsView }))),
        authority: [],
    },
    {
        key: 'rolex.accounts.create',
        path: '/accounts/create',
        component: lazy(() => import('@/views/rolex/pages').then(m => ({ default: m.AddAccountView }))),
        authority: [],
    },
    {
        key: 'rolex.deposit',
        path: '/deposit',
        component: lazy(() => import('@/views/rolex/pages').then(m => ({ default: m.DepositView }))),
        authority: [],
    },
    {
        key: 'rolex.deposit.deposits',
        path: '/deposits',
        component: lazy(() => import('@/views/rolex/pages').then(m => ({ default: m.DepositView }))),
        authority: [],
    },
    {
        key: 'rolex.deposit.history',
        path: '/deposits/history',
        component: lazy(() => import('@/views/rolex/pages').then(m => ({ default: m.DepositView }))),
        authority: [],
    },
    {
        key: 'rolex.deposit.utrEntry',
        path: '/deposits/utr-entry',
        component: lazy(() => import('@/views/rolex/pages').then(m => ({ default: m.DepositView }))),
        authority: [],
    },
    {
        key: 'rolex.deposit.utrPending',
        path: '/deposits/utr-pending',
        component: lazy(() => import('@/views/rolex/pages').then(m => ({ default: m.DepositView }))),
        authority: [],
    },
    {
        key: 'rolex.deposit.utrRemoved',
        path: '/deposits/utr-entry/removed-list',
        component: lazy(() => import('@/views/rolex/pages').then(m => ({ default: m.DepositView }))),
        authority: [],
    },
    {
        key: 'rolex.withdraw',
        path: '/withdraw',
        component: lazy(() => import('@/views/rolex/pages').then(m => ({ default: m.WithdrawView }))),
        authority: [],
    },
    {
        key: 'rolex.withdraw.withdrawals',
        path: '/withdrawals',
        component: lazy(() => import('@/views/rolex/pages').then(m => ({ default: m.WithdrawView }))),
        authority: [],
    },
    {
        key: 'rolex.withdraw.history',
        path: '/withdrawals/history',
        component: lazy(() => import('@/views/rolex/pages').then(m => ({ default: m.WithdrawView }))),
        authority: [],
    },
    {
        key: 'rolex.withdraw.historyAlt',
        path: '/withdraw/history',
        component: lazy(() => import('@/views/rolex/pages').then(m => ({ default: m.WithdrawView }))),
        authority: [],
    },
    {
        key: 'rolex.extraUsers',
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
        key: 'rolex.statement.alt',
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
        key: 'rolex.siteStats.alt',
        path: '/users/site-user-stats',
        component: lazy(() => import('@/views/rolex/pages').then(m => ({ default: m.SiteStatsView }))),
        authority: [],
    },
    {
        key: 'rolex.directMaster',
        path: '/direct-master',
        component: lazy(() => import('@/views/rolex/pages').then(m => ({ default: m.DirectMasterView }))),
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
