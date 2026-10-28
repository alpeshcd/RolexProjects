import type { ReactNode } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import Layout from './components/Layout'
import ChangePassword from './pages/ChangePassword'
import Casino from './pages/Casino'
import EventPage from './pages/EventPage'
import Home from './pages/Home'
import Login from './pages/Login'
import MyBets from './pages/MyBets'
import Statement from './pages/Statement'

function RequireAuth({ children }: { children: ReactNode }) {
    const { ready, account } = useAuth()
    if (!ready) return <div className="loading full">Loading…</div>
    if (!account) return <Navigate to="/login" replace />
    return <>{children}</>
}

function NotFound() {
    return (
        <div className="empty-panel">
            This page doesn't exist. <Link to="/home">Go to matches</Link>
        </div>
    )
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Standalone Login Page */}
                    <Route path="/login" element={<Login />} />

                    {/* Main Layout containing Public & Authenticated Pages */}
                    <Route element={<Layout />}>
                        <Route index element={<Navigate to="/home" replace />} />
                        {/* Publicly Accessible Live Odds & Matches */}
                        <Route path="/home" element={<Home />} />
                        <Route path="/sport/:sportId" element={<Home />} />
                        <Route path="/event/:eventId" element={<EventPage />} />
                        <Route path="/casino" element={<Casino />} />

                        {/* Protected Account Pages */}
                        <Route
                            path="/bets"
                            element={
                                <RequireAuth>
                                    <MyBets />
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="/statement"
                            element={
                                <RequireAuth>
                                    <Statement />
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="/change-password"
                            element={
                                <RequireAuth>
                                    <ChangePassword />
                                </RequireAuth>
                            }
                        />

                        <Route path="*" element={<NotFound />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}
