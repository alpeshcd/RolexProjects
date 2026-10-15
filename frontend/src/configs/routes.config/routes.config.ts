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
        key: 'rolex.accounts',
        path: '/accounts',
        component: lazy(() => import('@/views/rolex/pages').then(m => ({ default: m.AccountsView }))),
        authority: [],
    },
    {
        key: 'rolex.deposit',
        path: '/deposit',
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
        key: 'rolex.siteStats',
        path: '/site-user-stats',
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
