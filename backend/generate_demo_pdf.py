import sys
import os
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
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#718096"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 755, "ROLEX ADMIN & MASTAN365 INTEGRATION — CLIENT DEMO GUIDE")
            self.setStrokeColor(colors.HexColor("#CBD5E0"))
            self.setLineWidth(0.5)
            self.line(54, 747, 558, 747)
            
        # Footer
        footer_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 35, footer_text)
        self.drawString(54, 35, "CONFIDENTIAL — FOR CLIENT DEMO & TECHNICAL SPECIFICATION")
        self.setStrokeColor(colors.HexColor("#CBD5E0"))
        self.setLineWidth(0.5)
        self.line(54, 47, 558, 47)
        self.restoreState()

def build_pdf(filename="ROLEX_MASTAN365_DEMO_AND_REQUIREMENTS.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#1A365D')
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#2B6CB0')
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=colors.HexColor('#1A365D'),
        spaceBefore=14,
        spaceAfter=8
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#2C5282'),
        spaceBefore=10,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#2D3748'),
        spaceAfter=6
    )

    body_bold = ParagraphStyle(
        'Body_Bold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#1A202C')
    )

    script_box = ParagraphStyle(
        'ScriptBox',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor('#1A365D')
    )

    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#2D3748')
    )

    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.white
    )

    story = []

    # Title Block
    story.append(Paragraph("ROLEX ADMIN & MASTAN365 EXCHANGE", title_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph("Client Presentation, Live Demo Script & Technical Integration Blueprint", subtitle_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#2B6CB0"), spaceBefore=2, spaceAfter=12))

    meta_data = [
        [Paragraph("<b>Date:</b> October 19, 2026", body_style), Paragraph("<b>Version:</b> 1.0 (Demo Ready)", body_style)],
        [Paragraph("<b>Primary Portals:</b> Rolex Admin Panel + Mastan365 Exchange", body_style), Paragraph("<b>Module Focus:</b> Direct Master Settlement & Operations", body_style)]
    ]
    meta_table = Table(meta_data, colWidths=[250, 254])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EDF2F7")),
        ('PADDING', (0,0), (-1,-1), 6),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E0")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # SECTION 1
    story.append(Paragraph("1. Executive Overview & Two-Portal Architecture", h1_style))
    story.append(Paragraph(
        "Client ko sabse pehle ye clarify karna hai ki <b>dono portals ka purpose alag hai</b> aur dono milkar ek complete high-performance betting operations ecosystem banate hain:",
        body_style
    ))

    arch_data = [
        [
            Paragraph("<b>Rolex Admin Panel (Central Operations & Settlement)</b>", table_header),
            Paragraph("<b>Mastan365 Portal (Exchange & Betting Engine)</b>", table_header)
        ],
        [
            Paragraph("• <b>Finance & Banking:</b> Deposit, UTR manual/auto verify, withdrawal payouts.<br/>"
                      "• <b>Direct Master Management:</b> Purchase & Seller party rate settlement, credit allocation, broker/third-party commission calculation.<br/>"
                      "• <b>Audit & Statements:</b> Comprehensive A/C statement ledger, client user stats, multi-operator security.", table_cell),
            Paragraph("• <b>Live Betting Markets:</b> Cricket, Football, Tennis, Casino, Virtual sports odds.<br/>"
                      "• <b>Market Operations:</b> Real-time Back/Lay rate depths (blue/pink boxes), suspensions, match result settlements.<br/>"
                      "• <b>Exchange Downline:</b> Agent/Client betting accounts, live liability, upline balance (-223 or -718).", table_cell)
        ],
        [
            Paragraph("<b>Target Flow:</b> Rolex acts as the master financial cockpit. Once verified, chips & points auto-sync to Mastan365.", table_cell),
            Paragraph("<b>Target Flow:</b> Mastan365 generates market bets and win/loss, which sync back to Rolex statements automatically.", table_cell)
        ]
    ]
    t_arch = Table(arch_data, colWidths=[250, 254])
    t_arch.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor("#1A365D")),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor("#2C5282")),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor("#F7FAFC")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E0")),
        ('PADDING', (0,0), (-1,-1), 7),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_arch)
    story.append(Spacer(1, 14))

    # SECTION 2
    story.append(Paragraph("2. Status of Direct Master Management (Tested & Verified)", h1_style))
    story.append(Paragraph(
        "Aapki screen (Direct Master Management) ka poora automated testing backend aur frontend dono me complete ho chuka hai:",
        body_style
    ))

    features_data = [
        [Paragraph("Feature Component", table_header), Paragraph("Implementation & Test Status", table_header), Paragraph("Client Value Delivered", table_header)],
        [
            Paragraph("<b>Exchange & Admin Record</b>", table_cell),
            Paragraph("Verified. Dropdown links to Mastan365, Mastan99, etc. Admin name is auto-capitalized and indexed.", table_cell),
            Paragraph("Har master account ka exact exchange tracking bina confusion ke.", table_cell)
        ],
        [
            Paragraph("<b>Purchase & Seller Parties</b>", table_cell),
            Paragraph("Verified. Master party table with roles (Purchase, Seller, Third, All). Instant party creation modal.", table_cell),
            Paragraph("Kahan se points kharide aur kis party ko distribute kiye, exact separation.", table_cell)
        ],
        [
            Paragraph("<b>Rate Spread & Profit Calculation</b>", table_cell),
            Paragraph("Verified. Auto-calculates <b>Spread = Purchase Rate - Seller Rate</b> (e.g., 0.0250 - 0.0200 = 0.0050).", table_cell),
            Paragraph("Margin aur profit per point real-time screen par dikhta hai.", table_cell)
        ],
        [
            Paragraph("<b>Third Party Multi-Commission</b>", table_cell),
            Paragraph("Verified. Multiple brokers/third-parties can be added (+ button). Deducts commission from spread to yield <b>Net Spread</b>.", table_cell),
            Paragraph("Multiple brokers ka commission split bina manual Excel ke accurate calculate hota hai.", table_cell)
        ],
        [
            Paragraph("<b>Credit Allocation</b>", table_cell),
            Paragraph("Verified. Dedicated credit limit field with active/inactive status toggle.", table_cell),
            Paragraph("Master ko kitna exposure/credit diya gaya hai uska safe boundary control.", table_cell)
        ]
    ]
    t_feat = Table(features_data, colWidths=[130, 204, 170])
    t_feat.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#2B6CB0")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#FFFFFF"), colors.HexColor("#F7FAFC")]),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E0")),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_feat)
    story.append(Spacer(1, 14))

    # Page Break for Demo Script
    story.append(PageBreak())

    # SECTION 3
    story.append(Paragraph("3. Step-by-Step Client Demo Script (Kya Bolna Hai & Kya Dikhana Hai)", h1_style))
    story.append(Paragraph(
        "Demo dete waqt meeting me ye 4-step sequence follow kijiye. Har step par exactly kya bolna hai aur kya dikhana hai niche detailed hai:",
        body_style
    ))

    # Step 1
    story.append(Paragraph("STEP 1: Introduction & Operations Overview (2-3 Minutes)", h2_style))
    demo_s1 = [
        [Paragraph("<b>Kya Dikhana Hai:</b>", body_bold), Paragraph("Rolex Admin Dashboard, Client List, aur Bank/Payment Accounts view.", table_cell)],
        [Paragraph("<b>Kya Bolna Hai (Script):</b>", body_bold), Paragraph(
            "\"Sir, humne Rolex Admin ko aapke business ki complete financial backbone ke roop me design kiya hai. "
            "Yahan aapke saare clients, operational bank accounts, deposits aur withdrawals centralized control me hain. "
            "Pehle jo manual tracking me galti hoti thi, yahan har transaction instant verify aur log hoti hai.\"",
            script_box
        )]
    ]
    t_s1 = Table(demo_s1, colWidths=[140, 364])
    t_s1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EDF2F7")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E0")),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_s1)
    story.append(Spacer(1, 10))

    # Step 2
    story.append(Paragraph("STEP 2: Deposit UTR Automation & Payout Verification (3-4 Minutes)", h2_style))
    demo_s2 = [
        [Paragraph("<b>Kya Dikhana Hai:</b>", body_bold), Paragraph("Deposit List, UTR Entry screen, UTR Pending status, aur Withdrawal queue.", table_cell)],
        [Paragraph("<b>Kya Bolna Hai (Script):</b>", body_bold), Paragraph(
            "\"Jab bhi koi client payment karta hai, operator yahan UTR enter karta hai. System duplicate UTR check karta hai taaki fraud na ho. "
            "Ek baar UTR verify hote hi account statement me automatic ledger ban jata hai aur client ka balance update ho jata hai. "
            "Same tareeqe se withdrawal payouts ka 2-factor approval flow chalta hai.\"",
            script_box
        )]
    ]
    t_s2 = Table(demo_s2, colWidths=[140, 364])
    t_s2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EDF2F7")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E0")),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_s2)
    story.append(Spacer(1, 10))

    # Step 3
    story.append(Paragraph("STEP 3: Highlight of the Day — Direct Master Settlement (5-7 Minutes)", h2_style))
    demo_s3 = [
        [Paragraph("<b>Kya Dikhana Hai:</b>", body_bold), Paragraph("Direct Master Management screen (Add Record form + Live Calculation + Action table).", table_cell)],
        [Paragraph("<b>Kya Bolna Hai (Script):</b>", body_bold), Paragraph(
            "\"Sir, ye screen humne specific aapke Master Settlement workflow ke liye tayyar ki hai. "
            "Exchange select kijiye (jaise Mastan365), Admin ka naam daaliye. "
            "Humne yahan Purchase Party aur Seller Party alag ki hai. Example ke liye agar aapne 0.0250 par purchase kiya aur 0.0200 par sell kiya, "
            "to system instantly 0.0050 ka spread margin calculate kar leta hai. "
            "Agar isme koi third party ya broker involved hai, to '+' dabake unka commission % daal dijiye — system automatic Net Margin derive karke "
            "aapko real-time profit figure dikha deta hai. Yahan edit, delete aur active/inactive ka poora control hai.\"",
            script_box
        )]
    ]
    t_s3 = Table(demo_s3, colWidths=[140, 364])
    t_s3.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EDF2F7")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E0")),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_s3)
    story.append(Spacer(1, 10))

    # Step 4
    story.append(Paragraph("STEP 4: Connecting with Mastan365 Exchange (2-3 Minutes)", h2_style))
    demo_s4 = [
        [Paragraph("<b>Kya Dikhana Hai:</b>", body_bold), Paragraph("Mastan365 panel screenshot / live demo of markets, upline, and downline accounts.", table_cell)],
        [Paragraph("<b>Kya Bolna Hai (Script):</b>", body_bold), Paragraph(
            "\"Sir, Mastan365 exchange par aapka market feed, cricket odds aur downline chal raha hai. "
            "Humara agla step is Mastan365 panel ko Rolex ke sath direct API se link karna hai. "
            "Isse aapka balance, client chip deposit/withdrawal, aur match settlements dono taraf automatically bina kisi manual entry ke sync ho jayenge.\"",
            script_box
        )]
    ]
    t_s4 = Table(demo_s4, colWidths=[140, 364])
    t_s4.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EDF2F7")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E0")),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_s4)
    story.append(Spacer(1, 14))

    # Page Break for Requirements
    story.append(PageBreak())

    # SECTION 4
    story.append(Paragraph("4. Client Se Aage Kya Requirements Chahiye (Technical & Business Checklist)", h1_style))
    story.append(Paragraph(
        "Mastan365 exchange ko Rolex Admin ke sath seamlessly integrate karne ke liye client se ye exact inputs chahiye:",
        body_style
    ))

    req_data = [
        [Paragraph("#", table_header), Paragraph("Requirement Category", table_header), Paragraph("Exact Detail / Specification Needed", table_header), Paragraph("Priority", table_header)],
        [
            Paragraph("1", table_cell),
            Paragraph("<b>API Documentation & Postman</b>", table_cell),
            Paragraph("Mastan365 master panel ka Swagger URL ya Postman Collection jisme login, balance, aur market endpoints hon.", table_cell),
            Paragraph("<font color='red'><b>CRITICAL</b></font>", table_cell)
        ],
        [
            Paragraph("2", table_cell),
            Paragraph("<b>Sandbox / Staging Account</b>", table_cell),
            Paragraph("Testing ke liye ek staging master account with dummy points (live production master par test nahi karenge).", table_cell),
            Paragraph("<font color='red'><b>CRITICAL</b></font>", table_cell)
        ],
        [
            Paragraph("3", table_cell),
            Paragraph("<b>Odds Feed Protocol</b>", table_cell),
            Paragraph("Back/Lay odds real-time WebSocket feed (wss://) se aate hain ya REST API polling interval (e.g. 500ms / 1s)?", table_cell),
            Paragraph("<font color='red'><b>CRITICAL</b></font>", table_cell)
        ],
        [
            Paragraph("4", table_cell),
            Paragraph("<b>Wallet Chip Operations</b>", table_cell),
            Paragraph("Client ke exchange wallet me Chip Credit (Deposit) aur Chip Debit (Withdraw) karne ki exact APIs aur payload.", table_cell),
            Paragraph("<font color='orange'><b>HIGH</b></font>", table_cell)
        ],
        [
            Paragraph("5", table_cell),
            Paragraph("<b>Direct Master Business Rules</b>", table_cell),
            Paragraph("Purchase Rate vs Seller Rate ka exact spread formula aur broker commission base (spread par hai ya total volume par).", table_cell),
            Paragraph("<font color='orange'><b>HIGH</b></font>", table_cell)
        ],
        [
            Paragraph("6", table_cell),
            Paragraph("<b>Upline Field Definition</b>", table_cell),
            Paragraph("Mastan365 top bar par 'Upline : -223' ka exact meaning (downline liability, pending settlement, ya unsettled P&L).", table_cell),
            Paragraph("<font color='blue'>MEDIUM</font>", table_cell)
        ],
        [
            Paragraph("7", table_cell),
            Paragraph("<b>IP Whitelisting & Server Access</b>", table_cell),
            Paragraph("Hamare development & production server IPs whitelist karne ka portal/procedure.", table_cell),
            Paragraph("<font color='blue'>MEDIUM</font>", table_cell)
        ]
    ]
    t_req = Table(req_data, colWidths=[20, 140, 284, 60])
    t_req.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1A365D")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#FFFFFF"), colors.HexColor("#F7FAFC")]),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E0")),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_req)
    story.append(Spacer(1, 14))

    # SECTION 5
    story.append(Paragraph("5. Agla Kaam Kaise Hoga (Forward Roadmap & Execution Phases)", h1_style))
    story.append(Paragraph(
        "Client se credentials aur API docs aane ke baad work execution is timeline ke hisaab se proceed hoga:",
        body_style
    ))

    roadmap_data = [
        [Paragraph("Phase", table_header), Paragraph("Focus Area", table_header), Paragraph("Deliverables & Milestones", table_header), Paragraph("Timeline", table_header)],
        [
            Paragraph("<b>Phase 1</b>", table_cell),
            Paragraph("API Discovery & Handshake", table_cell),
            Paragraph("• Sandbox login integration.<br/>• Auth token refresh & IP whitelisting validation.<br/>• Master balance & upline sync.", table_cell),
            Paragraph("Days 1 - 3", table_cell)
        ],
        [
            Paragraph("<b>Phase 2</b>", table_cell),
            Paragraph("Wallet & Chip Automation", table_cell),
            Paragraph("• Rolex Deposit approval directly credits Mastan365 chips.<br/>• Rolex Withdrawal approval debits Mastan365 chips.<br/>• Reversal / failure handling.", table_cell),
            Paragraph("Days 4 - 7", table_cell)
        ],
        [
            Paragraph("<b>Phase 3</b>", table_cell),
            Paragraph("Odds & Sports Integration", table_cell),
            Paragraph("• Live Sports list (Cricket, Football, Tennis) feed.<br/>• In-play match odds & back/lay boxes rendering.<br/>• Market status updates (Open/Suspended).", table_cell),
            Paragraph("Days 8 - 12", table_cell)
        ],
        [
            Paragraph("<b>Phase 4</b>", table_cell),
            Paragraph("Master Settlement & P&L", table_cell),
            Paragraph("• Direct Master records linking with live exchange volume.<br/>• Commission calculations auto-posting to A/C Statement.<br/>• Daily/weekly P&L reconciliation.", table_cell),
            Paragraph("Days 13 - 16", table_cell)
        ],
        [
            Paragraph("<b>Phase 5</b>", table_cell),
            Paragraph("UAT, Security & Go-Live", table_cell),
            Paragraph("• End-to-end user acceptance testing with client team.<br/>• Load testing & 2FA security hardening.<br/>• Production launch.", table_cell),
            Paragraph("Days 17 - 20", table_cell)
        ]
    ]
    t_road = Table(roadmap_data, colWidths=[55, 125, 264, 60])
    t_road.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#2C5282")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#FFFFFF"), colors.HexColor("#F7FAFC")]),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E0")),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_road)
    story.append(Spacer(1, 14))

    # SECTION 6
    story.append(Paragraph("6. Quick Meeting Summary / Takeaways for Client", h1_style))
    summary_box = [
        [Paragraph(
            "<b>Key Meeting Pitch:</b><br/>"
            "1. <b>Rolex Admin</b> is 100% operational with Client Management, UTR Banking, Statement Ledger, and the brand new <b>Direct Master Settlement</b> engine.<br/>"
            "2. <b>Direct Master</b> accurately handles purchase/seller party rates, margin spread, broker commissions, and credit allocation.<br/>"
            "3. <b>Mastan365 Integration</b> will bridge the finance hub with live betting exchange operations once the API documentation & sandbox credentials are provided.<br/>"
            "4. <b>Action Item for Client:</b> Provide Postman Collection / API Docs + Test Master account so integration development kicks off immediately.",
            body_style
        )]
    ]
    t_sum = Table(summary_box, colWidths=[504])
    t_sum.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EBF8FF")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#3182CE")),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_sum)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF generated successfully at {os.path.abspath(filename)}")

if __name__ == "__main__":
    out_path = sys.argv[1] if len(sys.argv) > 1 else "ROLEX_MASTAN365_DEMO_AND_REQUIREMENTS.pdf"
    build_pdf(out_path)
