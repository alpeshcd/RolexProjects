import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export default function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [onClose])

    return createPortal(
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
                <div className="modal-head">
                    <h2>{title}</h2>
                    <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
                        ×
                    </button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>,
        document.body,
    )
}
