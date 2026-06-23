from html import escape
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "presentation_assets"


SLIDES = [
    (
        "Pentvars Certificate Verification System",
        [
            "A secure web-based certificate request and collection workflow",
            "Combines student registration, face verification, device biometric checks, admin approval, and messaging",
            "Built with React, Flask, Supabase, and biometric verification logic",
        ],
    ),
    (
        "Problem Statement",
        [
            "Manual certificate collection can be slow, difficult to track, and vulnerable to impersonation",
            "Students may need clearer communication about request status and collection readiness",
            "Administrators need one place to review, approve, reject, and record collection",
        ],
    ),
    (
        "Project Aim",
        [
            "To design and implement a certificate verification system that improves identity assurance and administrative control",
            "To reduce impersonation by combining face verification with device biometric confirmation",
            "To provide a digital workflow from student request to final collection",
        ],
    ),
    (
        "Core Users",
        [
            "Students register, verify identity, request certificates, read messages, and check status",
            "Administrators review requests, approve or reject, message students, and mark certificates as collected",
            "Super admins manage admin users and permissions",
        ],
    ),
    (
        "System Architecture",
        [
            "React and Vite provide the frontend user interface",
            "Flask provides the backend API and business logic",
            "Supabase Postgres stores student, admin, request, and message records",
            "Supabase Storage or local storage keeps captured face images",
        ],
    ),
    (
        "Student Workflow",
        [
            "Student signs up with academic details, password, face capture, and device biometric credential",
            "Student logs in and requests certificate collection",
            "The system verifies identity and sends the request to administrators",
            "Student receives approval, rejection, or collection messages",
        ],
    ),
    (
        "Admin Workflow",
        [
            "Admin logs in through the staff access page",
            "Admin reviews pending requests and student records",
            "Admin approves, rejects, sends messages, and marks certificate collection",
            "Admin users can be created with controlled permissions",
        ],
    ),
    (
        "Why Face Verification",
        [
            "It confirms that the requester visually matches the registered student",
            "It reduces the risk of another person requesting or collecting a certificate",
            "It adds evidence to support administrator decision-making",
        ],
    ),
    (
        "Why Device Biometrics",
        [
            "It uses security already available on phones and computers",
            "It strengthens login and request verification without storing raw fingerprints",
            "It makes the process more convenient while improving identity confidence",
        ],
    ),
    (
        "Main Pages",
        [
            "Splash: official branded entry screen",
            "Auth: signup, login, face capture, and device biometric registration",
            "Home: student dashboard and quick workflow actions",
            "Request, Verify, Messages, Profile: certificate process and student communication",
        ],
    ),
    (
        "Admin Pages",
        [
            "Admin Login: secure staff access point",
            "Admin Dashboard: request review, approval, rejection, collection, and user management",
            "Admin Messages: communication between staff and students",
            "Admin Users: controlled access through roles and permissions",
        ],
    ),
    (
        "Security And Privacy",
        [
            "Passwords are hashed before storage",
            "Service role keys remain on the backend",
            "Face data should be stored in private storage in production",
            "FAQ, Privacy, and Legal pages explain responsibilities and data use",
        ],
    ),
    (
        "Benefits",
        [
            "Improves certificate collection traceability",
            "Reduces impersonation and unauthorized collection risk",
            "Creates faster communication between students and administrators",
            "Provides a foundation for future institutional integration",
        ],
    ),
    (
        "Limitations",
        [
            "Face matching can be affected by lighting and camera quality",
            "Supabase and deployment environment variables must be configured correctly",
            "Institutional legal review is required before real production use",
            "More audit logging and automated testing should be added",
        ],
    ),
    (
        "Future Implementation",
        [
            "Add liveness detection to reduce spoofing attempts",
            "Add email or SMS notifications",
            "Integrate with official student information systems",
            "Add reporting dashboards, audit logs, and automated tests",
        ],
    ),
    (
        "Conclusion",
        [
            "The system provides a practical digital certificate verification workflow",
            "Face and device biometric verification strengthen identity assurance",
            "The project improves security, organization, communication, and accountability",
        ],
    ),
]


QUESTIONS = [
    ("What is the main purpose of your project?", "The main purpose is to create a secure certificate verification and collection system that helps students request certificates and helps administrators verify identity, approve requests, send updates, and record collection."),
    ("Why did you choose certificate verification as your project?", "I chose it because certificate collection is a sensitive institutional process. If it is handled manually, it can be slow, hard to track, and open to impersonation. This project improves trust and organization."),
    ("What problem does the system solve?", "It solves problems such as manual delays, weak identity checks, poor communication, and limited records of who requested or collected a certificate."),
    ("Who are the main users of the system?", "The main users are students and administrators. Students register, verify themselves, request certificates, and read updates. Administrators review requests, approve or reject them, and manage collection records."),
    ("What technologies did you use?", "I used React and Vite for the frontend, Flask for the backend, SQLite for local development, Supabase Postgres for deployment, Supabase Storage for image storage, and Python libraries for face processing and password hashing."),
    ("Why did you use React for the frontend?", "React makes it easier to build reusable pages and components, manage state, and create a responsive user interface for both students and administrators."),
    ("Why did you use Flask for the backend?", "Flask is lightweight, flexible, and suitable for building REST APIs. It allowed me to connect the frontend to database operations, verification logic, and admin workflows."),
    ("What database does the system use?", "Locally, it can use SQLite. In deployment, it is designed to use Supabase Postgres so records can be stored in a hosted cloud database."),
    ("Why did you use Supabase?", "Supabase provides hosted Postgres, storage, and environment-friendly deployment support. It helps keep student and admin records available beyond local development."),
    ("What is stored in the database?", "The database stores student details, hashed passwords, face image references, device credential IDs, certificate request status, admin messages, collection dates, and admin user records."),
    ("Does the system store raw fingerprints?", "No. The system does not store raw fingerprints. Device biometric authentication is handled by the user's device, and the application stores credential information needed for verification."),
    ("Why is face verification important here?", "Face verification helps confirm that the person making a request matches the registered student, reducing impersonation during certificate processing."),
    ("Why add device biometric verification as well?", "Device biometric verification adds another layer of confidence. It uses something the student has and can unlock, such as a phone or laptop with fingerprint, face unlock, PIN, or Windows Hello."),
    ("How does a student register?", "A student enters personal and academic details, creates a password, captures a face image, and registers a device biometric credential before submitting the signup form."),
    ("How does login work?", "The student enters an email and password. The backend checks the hashed password stored in the database and returns the student profile if the credentials are valid."),
    ("What happens after a student requests a certificate?", "The request is saved with a pending status. An administrator can then review it, approve it, reject it with a message, or mark it as collected later."),
    ("What can an administrator do?", "An administrator can view students, view certificate requests, approve or reject requests, send messages, mark certificates as collected, and manage admin users depending on permissions."),
    ("What is the role of a super admin?", "A super admin has full permissions, including managing other admin users and accessing the main administrative functions."),
    ("How are admin users created?", "Admin users can be created from the admin dashboard or directly from the backend terminal using the seed-admin Flask command."),
    ("Why did you add backend admin commands?", "They allow the software owner to create or update an admin without going through the user interface. This is useful during setup, deployment, and recovery."),
    ("How do you delete test data?", "The backend includes a reset-test-data command that deletes student and message records and clears local captured image files. It can also delete admin users if the include-admins option is used."),
    ("What is the purpose of the messages page?", "The messages page allows students to receive updates from administrators, such as approval notes, rejection reasons, or certificate collection instructions."),
    ("What is shown on the profile page?", "The profile page shows student information, certificate request status, and admin messages related to the student's certificate process."),
    ("What is the purpose of the splash screen?", "The splash screen gives the application a branded entry point and shows the official logo before directing users to authentication."),
    ("Why did you add FAQ, Privacy, and Legal pages?", "They explain how the system works, how data is handled, and what responsibilities users and administrators have. This improves transparency and trust."),
    ("How does the system protect passwords?", "Passwords are hashed using Werkzeug security helpers before being stored, so plain text passwords are not saved in the database."),
    ("What are environment variables used for?", "They store configuration such as database URL, Supabase URL, service role key, storage bucket name, CORS origins, and face match threshold."),
    ("Why should secrets not be committed to GitHub?", "Secrets such as database passwords and service role keys could allow unauthorized access if exposed. They should stay in local or deployment environment variables."),
    ("What issue did you face with Supabase connection?", "The database connection required the correct pooler username and URL-encoded password. Special characters like @ must be encoded as %40 inside the connection string."),
    ("What is the difference between local and deployed database usage?", "Locally the app can use SQLite if no database URL is set. In deployment, it uses Supabase Postgres so data is stored online and accessible to the deployed backend."),
    ("What is CORS and why is it needed?", "CORS controls which frontend domains can call the backend API. It is needed because the frontend and backend may be hosted on different domains."),
    ("How does the admin approve a request?", "The admin opens the dashboard, reviews the pending request, optionally enters an admin message, and submits approval. The student's status is then updated."),
    ("How does the admin reject a request?", "The admin selects the request, enters a rejection message or uses the default one, and the backend updates the student's request status."),
    ("How is certificate collection recorded?", "The admin can mark an approved certificate as collected. The system stores collection-related fields such as collection date and collected status."),
    ("What are the strengths of the system?", "Its strengths include improved identity assurance, organized request management, admin messaging, digital records, and support for both local and cloud deployment."),
    ("What are the limitations of the system?", "Limitations include dependence on good lighting for face capture, correct deployment configuration, and the need for stronger audit logs and production-level legal review."),
    ("Can the system work without internet?", "For local testing, it can work with SQLite and local storage. For deployed use with Supabase, internet access is required."),
    ("What happens if face verification fails?", "The student can retry with better lighting and positioning. If problems continue, an administrator can review the situation and guide the student."),
    ("Could someone spoof the face verification with a photo?", "Basic face matching may be vulnerable to spoofing, which is why liveness detection is listed as an important future improvement."),
    ("What is liveness detection?", "Liveness detection checks whether the face belongs to a real live person rather than a printed photo, screen image, or replayed media."),
    ("Why is audit logging important?", "Audit logging records who performed important actions and when. It helps accountability, investigation, and institutional compliance."),
    ("What would you improve first if you had more time?", "I would add stronger audit logs, liveness detection, automated tests, and email or SMS notifications for students."),
    ("How would you integrate it with the school system?", "I would connect it to the official student information system so student records can be verified automatically instead of entered manually."),
    ("What makes your project different from a normal login system?", "It is not just a login system. It connects login, face capture, biometric device verification, certificate request workflow, admin review, messaging, and collection tracking."),
    ("How did you handle official branding?", "I replaced the default Vite and React logos with the official application logo across the splash screen, browser tab, navbar, and sidebar."),
    ("What files should another developer read first?", "They should read README.md, DEPLOYMENT.md, backend/app.py, backend/supabase_schema.sql, and the React pages under face-cert/src/pages."),
    ("How can another developer run the project?", "They can install backend dependencies, run python app.py, install frontend dependencies, run npm run dev, and configure .env files as described in the README."),
    ("How can the project be deployed?", "The frontend can be deployed to Vercel and the backend to Render or another Python host. Supabase provides the hosted database and storage."),
    ("What security advice would you give before production?", "Use strong passwords, keep service keys private, use HTTPS, restrict admin access, remove test data, configure CORS correctly, and review privacy/legal requirements."),
    ("In one sentence, how would you defend this project?", "I would say it is a practical certificate management system that improves identity verification, administrative control, communication, and accountability using modern web and biometric-supported workflows."),
]


def paragraph(text, style=None):
    style_attr = f' w:val="{style}"' if style else ""
    return (
        f"<w:p><w:pPr>{'<w:pStyle' + style_attr + '/>' if style else ''}</w:pPr>"
        f"<w:r><w:t>{escape(text)}</w:t></w:r></w:p>"
    )


def write_docx(path):
    body = [
        paragraph("Certificate Verification System: Lecturer Questions And Student Answers", "Title"),
        paragraph("Prepared as presentation defense notes for the Pentvars Certificate Verification System."),
    ]

    for index, (question, answer) in enumerate(QUESTIONS, 1):
        body.append(paragraph(f"{index}. {question}", "Heading1"))
        body.append(paragraph(f"Student answer: {answer}"))

    document_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
        f"<w:body>{''.join(body)}<w:sectPr><w:pgSz w:w=\"12240\" w:h=\"15840\"/><w:pgMar w:top=\"1440\" w:right=\"1440\" w:bottom=\"1440\" w:left=\"1440\"/></w:sectPr></w:body>"
        "</w:document>"
    )

    styles_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
        '<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:rPr><w:b/><w:sz w:val="36"/></w:rPr></w:style>'
        '<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:rPr><w:b/><w:sz w:val="26"/></w:rPr></w:style>'
        "</w:styles>"
    )

    with ZipFile(path, "w", ZIP_DEFLATED) as docx:
        docx.writestr("[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>')
        docx.writestr("_rels/.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>')
        docx.writestr("word/_rels/document.xml.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>')
        docx.writestr("word/document.xml", document_xml)
        docx.writestr("word/styles.xml", styles_xml)


def ppt_text_shape(shape_id, title, lines, x, y, cx, cy):
    paragraphs = [f"<a:p><a:r><a:rPr lang=\"en-US\" sz=\"3000\" b=\"1\"/><a:t>{escape(title)}</a:t></a:r></a:p>"]
    for line in lines:
        paragraphs.append(
            f"<a:p><a:buChar char=\"•\"/><a:r><a:rPr lang=\"en-US\" sz=\"2000\"/><a:t>{escape(line)}</a:t></a:r></a:p>"
        )
    return (
        f"<p:sp><p:nvSpPr><p:cNvPr id=\"{shape_id}\" name=\"Content {shape_id}\"/>"
        "<p:cNvSpPr txBox=\"1\"/><p:nvPr/></p:nvSpPr>"
        f"<p:spPr><a:xfrm><a:off x=\"{x}\" y=\"{y}\"/><a:ext cx=\"{cx}\" cy=\"{cy}\"/></a:xfrm>"
        '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/><a:ln><a:noFill/></a:ln></p:spPr>'
        f"<p:txBody><a:bodyPr wrap=\"square\"/><a:lstStyle/>{''.join(paragraphs)}</p:txBody></p:sp>"
    )


def slide_xml(title, lines):
    shape = ppt_text_shape(2, title, lines, 650000, 700000, 8000000, 5200000)
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
        'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">'
        "<p:cSld><p:spTree>"
        '<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
        '<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>'
        f"{shape}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>"
    )


def write_pptx(path):
    slide_overrides = "".join(
        f'<Override PartName="/ppt/slides/slide{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>'
        for i in range(1, len(SLIDES) + 1)
    )
    slide_ids = "".join(
        f'<p:sldId id="{255 + i}" r:id="rId{i}"/>'
        for i in range(1, len(SLIDES) + 1)
    )
    rels = "".join(
        f'<Relationship Id="rId{i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide{i}.xml"/>'
        for i in range(1, len(SLIDES) + 1)
    )

    with ZipFile(path, "w", ZIP_DEFLATED) as pptx:
        pptx.writestr("[Content_Types].xml", f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>{slide_overrides}</Types>')
        pptx.writestr("_rels/.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>')
        pptx.writestr("ppt/presentation.xml", f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:sldIdLst>{slide_ids}</p:sldIdLst><p:sldSz cx="9144000" cy="6858000" type="screen4x3"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>')
        pptx.writestr("ppt/_rels/presentation.xml.rels", f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">{rels}</Relationships>')
        for index, (title, lines) in enumerate(SLIDES, 1):
            pptx.writestr(f"ppt/slides/slide{index}.xml", slide_xml(title, lines))


def main():
    OUT.mkdir(exist_ok=True)
    write_pptx(OUT / "certificate-verification-presentation.pptx")
    write_docx(OUT / "lecturer-questions-and-student-answers.docx")
    print(f"Created files in {OUT}")


if __name__ == "__main__":
    main()
