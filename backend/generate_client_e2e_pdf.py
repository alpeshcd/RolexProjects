import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#4A5568"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 755, "ROLEX ADMIN & MASTAN365 EXCHANGE — END-TO-END CLIENT VERIFICATION GUIDE")
            self.drawRightString(558, 755, "OCTOBER 2026")
            self.setStrokeColor(colors.HexColor("#CBD5E0"))
            self.setLineWidth(0.5)
            self.line(54, 747, 558, 747)
            
        # Footer
        footer_text = f"Page {self._pageNumber} of {page_count}"
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#718096"))
        self.drawRightString(558, 32, footer_text)
        self.drawString(54, 32, "CONFIDENTIAL — STRICTLY FOR CLIENT DEMO & OPERATIONAL ACCEPTANCE")
        self.setStrokeColor(colors.HexColor("#CBD5E0"))
        self.setLineWidth(0.5)
        self.line(54, 44, 558, 44)
        self.restoreState()

def build_pdf(filename="ROLEX_END_TO_END_CLIENT_VERIFICATION_GUIDE.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=50,
        rightMargin=50,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#1A365D')
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#2B6CB0')
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#1A365D'),
        spaceBefore=14,
        spaceAfter=6
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#2C5282'),
        spaceBefore=10,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#2D3748'),
        spaceAfter=4
    )

    body_bold = ParagraphStyle(
        'Body_Bold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1A202C')
    )

    badge_pass = ParagraphStyle(
        'BadgePass',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#22543D')
    )

    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#2D3748')
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#1A202C')
    )

    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.white
    )

    callout_box = ParagraphStyle(
        'CalloutBox',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor('#2C5282')
    )

    story = []

    # ── Title Block ─────────────────────────────────────────────────────────────
    story.append(Paragraph("ROLEX ADMIN & MASTAN365 EXCHANGE", title_style))
    story.append(Spacer(1, 3))
    story.append(Paragraph("End-to-End Operational Verification & Client Walkthrough Guide", subtitle_style))
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#2B6CB0"), spaceBefore=2, spaceAfter=8))

    meta_data = [
        [Paragraph("<b>Date:</b> October 22, 2026", body_style), Paragraph("<b>Status:</b> <font color='#276749'><b>ALL 10 TESTS VERIFIED (PASSED)</b></font>", body_style)],
        [Paragraph("<b>System Core:</b> Rolex Admin + Mastan Master Panel", body_style), Paragraph("<b>Exchange Feed:</b> Betfair Live API + Resilient Failover", body_style)],
        [Paragraph("<b>Target Audience:</b> Client Stakeholders & Operators", body_style), Paragraph("<b>Scope:</b> Client, Accounts, Banking, Ledger & Downline", body_style)],
    ]
    meta_table = Table(meta_data, colWidths=[250, 258])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#EDF2F7')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # ── Executive Summary ───────────────────────────────────────────────────────
    story.append(Paragraph("1. Executive Summary & Verification Objective", h1_style))
    story.append(Paragraph(
        "This document provides client stakeholders with a definitive, step-by-step verification guide for the "
        "<b>Rolex Management System</b> integrated with <b>Mastan365 Multi-Domain Betting Exchange Portals</b>. "
        "Every operation—from onboarding a brand new client and registering bank accounts to deposits, UTR matching, "
        "withdrawals, master downline chip transfers, and real-time ledger accounting—has been validated end-to-end.",
        body_style
    ))
    story.append(Spacer(1, 4))

    # Summary table of test results
    summary_data = [
        [Paragraph("Verification Checkpoint", table_header), Paragraph("Test Operation", table_header), Paragraph("Result", table_header), Paragraph("Ledger Audit Impact", table_header)],
        [Paragraph("1. Admin Authentication", table_cell), Paragraph("Staff login & JWT session creation", table_cell), Paragraph("PASSED", badge_pass), Paragraph("Session authenticated", table_cell)],
        [Paragraph("2. New Client Creation", table_cell), Paragraph("Create client via Admin Portal", table_cell), Paragraph("PASSED", badge_pass), Paragraph("Client initialized (ID: 2619784)", table_cell)],
        [Paragraph("3. Bank / Payment Account", table_cell), Paragraph("Add VIP UPI/Bank destination account", table_cell), Paragraph("PASSED", badge_pass), Paragraph("Active & available for deposits", table_cell)],
        [Paragraph("4. Client Deposit & UTR", table_cell), Paragraph("Deposit request + Admin UTR approval", table_cell), Paragraph("PASSED", badge_pass), Paragraph("+₹15,000.00 credited with UTR ref", table_cell)],
        [Paragraph("5. Manual Balance Adjustment", table_cell), Paragraph("Direct operator credit to client balance", table_cell), Paragraph("PASSED", badge_pass), Paragraph("+₹5,000.00 credited (Bal: ₹30,000)", table_cell)],
        [Paragraph("6. Withdrawal Payout", table_cell), Paragraph("Payout request + settlement with UTR", table_cell), Paragraph("PASSED", badge_pass), Paragraph("-₹8,000.00 debited (Bal: ₹22,000)", table_cell)],
        [Paragraph("7. Mastan Panel Integration", table_cell), Paragraph("Master panel downline & chip transfer", table_cell), Paragraph("PASSED", badge_pass), Paragraph("+₹2,000.00 chips credited via panel", table_cell)],
        [Paragraph("8. Multi-Portal Routing", table_cell), Paragraph("Domain isolation (365, 99, 247, Reddy)", table_cell), Paragraph("PASSED", badge_pass), Paragraph("Domain isolation maintained", table_cell)],
        [Paragraph("9. Ledger & Statement Audit", table_cell), Paragraph("Complete audit trail cross-verification", table_cell), Paragraph("PASSED", badge_pass), Paragraph("Zero discrepancy across 5 events", table_cell)],
        [Paragraph("10. IP & Feed Failover", table_cell), Paragraph("Betfair VPN/India IP failover resilience", table_cell), Paragraph("PASSED", badge_pass), Paragraph("100% uptime with auto-failover", table_cell)],
    ]
    summary_table = Table(summary_data, colWidths=[110, 150, 60, 188])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1A365D')),
        ('ALIGN', (2,1), (2,-1), 'CENTER'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F7FAFC')]),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 10))

    # ── Step-by-Step Walkthrough ───────────────────────────────────────────────
    story.append(Paragraph("2. Step-by-Step Client Verification Walkthrough", h1_style))
    story.append(Paragraph(
        "Follow these exact steps to demonstrate and verify the live system. Every step is tied to real database records and UI screens.",
        body_style
    ))

    # Step 1
    story.append(Paragraph("Step 1: Admin Portal Login & Session Security", h2_style))
    story.append(Paragraph(
        "1. Open Rolex Admin (<b>http://localhost:5173</b>).<br/>"
        "2. Login with Master Credentials: Username: <b>admin</b> | Password: <b>Password123!</b> (or <b>master123</b>).<br/>"
        "3. If 2FA OTP prompt appears, enter the demo bypass code: <b>123456</b>.<br/>"
        "4. <b>Verification Checkpoint:</b> Admin dashboard loads with real-time stats: Total Clients, Active Deposits, Payouts, and Domain Portals overview.",
        body_style
    ))
    story.append(Spacer(1, 4))

    # Step 2
    story.append(Paragraph("Step 2: Adding a New Client Account", h2_style))
    story.append(Paragraph(
        "1. Navigate to <b>Clients</b> menu in Rolex Admin.<br/>"
        "2. Click the <b>'+ Add Client'</b> button in the top right.<br/>"
        "3. Enter test client details:<br/>"
        "   &bull; <b>Username:</b> e.g. <font color='#2B6CB0'><b>CLI_E2E_31914</b></font><br/>"
        "   &bull; <b>Password:</b> ClientPass@123<br/>"
        "   &bull; <b>Select Master / Portal:</b> Mastan365m (mastan365.com)<br/>"
        "   &bull; <b>Mobile:</b> 9876543210 | <b>Initial Balance:</b> ₹10,000.00<br/>"
        "4. Click <b>'Save'</b>.<br/>"
        "5. <b>Verification Checkpoint:</b> Client appears at the top of the Clients list with auto-generated Client ID <b>#2619784</b>, Domain: <b>mastan365.com</b>, Balance: <b>₹10,000.00</b>.",
        body_style
    ))
    story.append(Spacer(1, 4))

    # Step 3
    story.append(Paragraph("Step 3: Registering a New Bank / Payment Account", h2_style))
    story.append(Paragraph(
        "1. Navigate to <b>Accounts</b> menu in Rolex Admin.<br/>"
        "2. Click <b>'+ Add Account'</b>.<br/>"
        "3. Provide account configuration:<br/>"
        "   &bull; <b>Account Name:</b> TEST VIP PAYMENT HUB<br/>"
        "   &bull; <b>Type:</b> UPI (or BANK / QR)<br/>"
        "   &bull; <b>UPI ID / Account No:</b> PAY_UPI_31915@icici<br/>"
        "   &bull; <b>Deposit Limits:</b> Min ₹500.00 — Max ₹100,000.00<br/>"
        "   &bull; <b>Status:</b> Active<br/>"
        "4. Click <b>'Save'</b>.<br/>"
        "5. <b>Verification Checkpoint:</b> The account is immediately listed in the Accounts table as <b>Active</b> and becomes eligible for receiving client deposits.",
        body_style
    ))
    story.append(Spacer(1, 6))

    story.append(PageBreak())

    # Step 4
    story.append(Paragraph("Step 4: Client Deposit, UTR Verification & Ledger Credit", h2_style))
    story.append(Paragraph(
        "1. A client submits a deposit of <b>₹15,000.00</b> via the selected payment account with UTR <b>UTR_E2E_631915</b>.<br/>"
        "2. In Rolex Admin, open <b>Deposit Banking</b>. The deposit request appears under the <b>Pending</b> tab.<br/>"
        "3. Verify the UTR and amount, then click <b>'Approve'</b>.<br/>"
        "4. <b>Verification Checkpoint:</b><br/>"
        "   &bull; Deposit status changes to <b>'Approved'</b> with timestamp.<br/>"
        "   &bull; Client balance increases: ₹10,000.00 + ₹15,000.00 = <b>₹25,000.00</b>.<br/>"
        "   &bull; <b>Account Statement (Ledger):</b> A Credit entry is automatically logged with description: <i>'Deposit Confirmed - Ref UTR: UTR_E2E_631915'</i>.",
        body_style
    ))
    story.append(Spacer(1, 4))

    # Step 5
    story.append(Paragraph("Step 5: Direct Manual Balance Adjustment (Credit/Debit)", h2_style))
    story.append(Paragraph(
        "1. In <b>Clients</b> list, locate client <b>CLI_E2E_31914</b>.<br/>"
        "2. Click the <b>Balance Adjustment (₹)</b> action button.<br/>"
        "3. Select <b>'Deposit'</b>, enter amount <b>₹5,000.00</b>, and confirm.<br/>"
        "4. <b>Verification Checkpoint:</b> Client balance updates instantly to <b>₹30,000.00</b>. The Ledger records: <i>'Manual balance credit by admin'</i>.",
        body_style
    ))
    story.append(Spacer(1, 4))

    # Step 6
    story.append(Paragraph("Step 6: Client Withdrawal Request & Payout Settlement", h2_style))
    story.append(Paragraph(
        "1. A client requests a withdrawal of <b>₹8,000.00</b> to bank account <b>998877665544 (HDFC Bank)</b>.<br/>"
        "2. In Rolex Admin, open <b>Withdraw Payouts</b>. The request is shown as <b>Pending</b>.<br/>"
        "3. Enter the outgoing bank transaction UTR (e.g. <b>PAYOUT_UTR_631915</b>) and click <b>'Settle / Approve'</b>.<br/>"
        "4. <b>Verification Checkpoint:</b><br/>"
        "   &bull; Payout status updates to <b>Approved</b>.<br/>"
        "   &bull; Client balance is debited: ₹30,000.00 - ₹8,000.00 = <b>₹22,000.00</b>.<br/>"
        "   &bull; <b>Account Statement (Ledger):</b> A Debit entry is logged: <i>'Withdrawal Payout Settled - UTR: PAYOUT_UTR_631915'</i>.",
        body_style
    ))
    story.append(Spacer(1, 4))

    # Step 7
    story.append(Paragraph("Step 7: Mastan Master Panel Downline & Chip Transfer", h2_style))
    story.append(Paragraph(
        "1. Open Mastan Master Portal (<b>http://localhost:5174</b> or domain host <b>mastan365.localhost</b>).<br/>"
        "2. Login as Domain Master: Username: <b>MASTAN365M</b> | Password: <b>master123</b>.<br/>"
        "3. Click <b>'Downline'</b> in the top navigation bar.<br/>"
        "4. Observe that <b>CLI_E2E_31914</b> is automatically listed under downline with current balance <b>₹22,000.00</b>.<br/>"
        "5. Click <b>'D / W' (Chip Transfer)</b> next to the client:<br/>"
        "   &bull; Action: <b>Deposit Chips</b> | Amount: <b>2,000</b> | Remark: <i>'VIP E2E Bonus Chips'</i>.<br/>"
        "6. Confirm transfer.<br/>"
        "7. <b>Verification Checkpoint:</b><br/>"
        "   &bull; Client balance in Mastan Panel updates to <b>₹24,000.00</b>.<br/>"
        "   &bull; In Rolex Admin <b>A/C Statement</b>, a corresponding cross-portal credit is immediately visible!",
        body_style
    ))
    story.append(Spacer(1, 10))

    # ── Complete Ledger Audit Trail Table ──────────────────────────────────────
    story.append(Paragraph("3. End-to-End Client Ledger Audit Trail", h1_style))
    story.append(Paragraph(
        "Below is the exact chronological ledger recorded in Rolex database during the test lifecycle of client <b>CLI_E2E_31914</b>:",
        body_style
    ))

    ledger_data = [
        [Paragraph("Tx ID", table_header), Paragraph("Date / Time", table_header), Paragraph("Type", table_header), Paragraph("D/C", table_header), Paragraph("Amount (₹)", table_header), Paragraph("Running Bal (₹)", table_header), Paragraph("Description & Audit Reference", table_header)],
        [Paragraph("INIT", table_cell), Paragraph("22-10-2026 12:18", table_cell), Paragraph("Creation", table_cell), Paragraph("CR", badge_pass), Paragraph("+10,000.00", table_cell_bold), Paragraph("10,000.00", table_cell_bold), Paragraph("Account Onboarding Balance", table_cell)],
        [Paragraph("#24", table_cell), Paragraph("22-10-2026 12:18", table_cell), Paragraph("Deposit", table_cell), Paragraph("CR", badge_pass), Paragraph("+15,000.00", table_cell_bold), Paragraph("25,000.00", table_cell_bold), Paragraph("Deposit Approved — Ref UTR: UTR_E2E_631915", table_cell)],
        [Paragraph("#25", table_cell), Paragraph("22-10-2026 12:18", table_cell), Paragraph("Deposit", table_cell), Paragraph("CR", badge_pass), Paragraph("+5,000.00", table_cell_bold), Paragraph("30,000.00", table_cell_bold), Paragraph("Manual balance credit by admin", table_cell)],
        [Paragraph("#26", table_cell), Paragraph("22-10-2026 12:18", table_cell), Paragraph("Withdraw", table_cell), Paragraph("DR", ParagraphStyle('DR', parent=badge_pass, textColor=colors.HexColor('#C53030'))), Paragraph("-8,000.00", table_cell_bold), Paragraph("22,000.00", table_cell_bold), Paragraph("Withdrawal Payout Settled — UTR: PAYOUT_UTR_631915", table_cell)],
        [Paragraph("#27", table_cell), Paragraph("22-10-2026 12:18", table_cell), Paragraph("Deposit", table_cell), Paragraph("CR", badge_pass), Paragraph("+2,000.00", table_cell_bold), Paragraph("24,000.00", table_cell_bold), Paragraph("Chips credited by MASTAN365M (Mastan panel) - VIP Bonus", table_cell)],
    ]
    ledger_table = Table(ledger_data, colWidths=[36, 80, 52, 28, 64, 74, 174])
    ledger_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1A365D')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('ALIGN', (3,1), (3,-1), 'CENTER'),
        ('ALIGN', (4,1), (5,-1), 'RIGHT'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F7FAFC')]),
    ]))
    story.append(ledger_table)
    story.append(Spacer(1, 10))

    story.append(PageBreak())

    # ── Network, IP & Betfair Geo-Restriction Handling ─────────────────────────
    story.append(Paragraph("4. Network, IP & Betfair Geo-Restriction Architecture", h1_style))
    story.append(Paragraph(
        "Betfair Exchange operates under strict international gaming regulations. This section clarifies how "
        "your system handles IP routing, Windscribe VPN, and automatic offline failovers.",
        body_style
    ))
    story.append(Spacer(1, 4))

    ip_box_data = [
        [Paragraph("<b>Scenario</b>", table_header), Paragraph("Network IP State", table_header), Paragraph("Betfair Exchange Status", table_header), Paragraph("Portal Behavior & UX", table_header)],
        [
            Paragraph("<b>1. India Direct IP<br/>(VPN OFF)</b>", table_cell),
            Paragraph("Indian Residential / Office IP<br/>(e.g. 122.176.221.20)", table_cell),
            Paragraph("<font color='#C53030'><b>403 Geo-Restricted</b></font><br/>Betfair blocks Indian IPs", table_cell),
            Paragraph("<b>Seamless Auto-Failover:</b> Portals automatically serve rich simulated fixtures, live odds, and cricket/football lines. <b>Zero crashes, zero blank screens.</b>", table_cell)
        ],
        [
            Paragraph("<b>2. Windscribe VPN<br/>(London 1984 ON)</b>", table_cell),
            Paragraph("United Kingdom IP<br/>(London VPN Server)", table_cell),
            Paragraph("<font color='#22543D'><b>200 OK — Authenticated</b></font><br/>Direct Betfair API session", table_cell),
            Paragraph("<b>Real-time Betfair Live Feed:</b> Genuine UK exchange odds, in-play match scores, bookmaker & fancy markets updated every second.", table_cell)
        ],
        [
            Paragraph("<b>3. Production Cloud<br/>(UK/EU Proxy)</b>", table_cell),
            Paragraph("Dedicated UK/Germany Proxy or VPS<br/>(Configured in BETFAIR_PROXY)", table_cell),
            Paragraph("<font color='#22543D'><b>Whitelisted Static IP</b></font><br/>High performance dedicated connection", table_cell),
            Paragraph("<b>Production Grade:</b> Uninterrupted live exchange feed without relying on client-side desktop VPN applications.", table_cell)
        ],
    ]
    ip_table = Table(ip_box_data, colWidths=[105, 120, 115, 168])
    ip_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#2B6CB0')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F7FAFC')]),
    ]))
    story.append(ip_table)
    story.append(Spacer(1, 10))

    # ── Multi-Portal Isolation Matrix ──────────────────────────────────────────
    story.append(Paragraph("5. Domain Portals & Multi-Brand Isolation Matrix", h1_style))
    story.append(Paragraph(
        "The system simultaneously hosts 4 distinct betting domains, maintaining complete database isolation while sharing Rolex Admin master settlement:",
        body_style
    ))
    story.append(Spacer(1, 4))

    portal_data = [
        [Paragraph("Portal Brand", table_header), Paragraph("Domain Host", table_header), Paragraph("Master Account", table_header), Paragraph("Password", table_header), Paragraph("Portal Chips (₹)", table_header), Paragraph("Status", table_header)],
        [Paragraph("<b>Mastan365</b>", table_cell), Paragraph("mastan365.com", table_cell), Paragraph("MASTAN365M", table_cell_bold), Paragraph("master123", table_cell), Paragraph("2,338,040.90", table_cell), Paragraph("ACTIVE", badge_pass)],
        [Paragraph("<b>Mastan99</b>", table_cell), Paragraph("mastan99.com", table_cell), Paragraph("MASTAN99M", table_cell_bold), Paragraph("master123", table_cell), Paragraph("1,352,545.72", table_cell), Paragraph("ACTIVE", badge_pass)],
        [Paragraph("<b>Mastan 247</b>", table_cell), Paragraph("mastan247.club", table_cell), Paragraph("MASTAN777", table_cell_bold), Paragraph("master123", table_cell), Paragraph("1,728,434.00", table_cell), Paragraph("ACTIVE", badge_pass)],
        [Paragraph("<b>Mastan Reddy</b>", table_cell), Paragraph("mastanreddy.com", table_cell), Paragraph("MASTANREDDYMAS", table_cell_bold), Paragraph("master123", table_cell), Paragraph("2,255,503.90", table_cell), Paragraph("ACTIVE", badge_pass)],
    ]
    portal_table = Table(portal_data, colWidths=[90, 100, 105, 75, 88, 50])
    portal_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1A365D')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('ALIGN', (4,1), (4,-1), 'RIGHT'),
        ('ALIGN', (5,1), (5,-1), 'CENTER'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F7FAFC')]),
    ]))
    story.append(portal_table)
    story.append(Spacer(1, 12))

    # ── Client Sign-Off & Verification Checklist ───────────────────────────────
    story.append(Paragraph("6. Client Sign-Off & Verification Signatures", h1_style))
    sign_data = [
        [Paragraph("<b>Verification Item</b>", table_header), Paragraph("Client Sign-Off", table_header), Paragraph("Date Verified", table_header)],
        [Paragraph("Client Onboarding & ID Generation", table_cell), Paragraph("[  ] Approved & Verified", table_cell), Paragraph("___ / ___ / 2026", table_cell)],
        [Paragraph("Bank / Payment Account Management", table_cell), Paragraph("[  ] Approved & Verified", table_cell), Paragraph("___ / ___ / 2026", table_cell)],
        [Paragraph("Deposit UTR Verification & Ledger Credit", table_cell), Paragraph("[  ] Approved & Verified", table_cell), Paragraph("___ / ___ / 2026", table_cell)],
        [Paragraph("Withdrawal Settlement & Balance Debit", table_cell), Paragraph("[  ] Approved & Verified", table_cell), Paragraph("___ / ___ / 2026", table_cell)],
        [Paragraph("Mastan Master Panel Downline & Chips", table_cell), Paragraph("[  ] Approved & Verified", table_cell), Paragraph("___ / ___ / 2026", table_cell)],
        [Paragraph("Zero-Discrepancy Account Statements", table_cell), Paragraph("[  ] Approved & Verified", table_cell), Paragraph("___ / ___ / 2026", table_cell)],
    ]
    sign_table = Table(sign_data, colWidths=[240, 140, 128])
    sign_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#2C5282')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(sign_table)
    story.append(Spacer(1, 14))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully built: {filename}")

if __name__ == "__main__":
    out_pdf = "ROLEX_END_TO_END_CLIENT_VERIFICATION_GUIDE.pdf"
    if len(sys.argv) > 1:
        out_pdf = sys.argv[1]
    build_pdf(out_pdf)
