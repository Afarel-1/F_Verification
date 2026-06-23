import { Link, useParams } from "react-router-dom"

import appLogo from "../assets/facial logo.png"

const pageContent = {
  faq: {
    title: "Frequently Asked Questions",
    intro:
      "Answers to common questions about certificate requests, face verification, device biometric checks, and admin approval.",
    sections: [
      {
        heading: "What is this system used for?",
        body:
          "It helps students request, verify, and collect certificates through a controlled digital workflow. The system connects student registration, face capture, device biometric registration, admin review, messaging, and certificate collection tracking."
      },
      {
        heading: "Why does the system use face verification?",
        body:
          "Face verification helps confirm that the person requesting or collecting a certificate matches the registered student identity. It reduces impersonation risk and gives administrators stronger evidence during approval."
      },
      {
        heading: "What does device biometric mean?",
        body:
          "Device biometric uses the security already available on a student's phone or computer, such as fingerprint, face unlock, PIN, screen lock, or Windows Hello. The application stores a credential reference, not the raw fingerprint or device unlock secret."
      },
      {
        heading: "Can an admin approve or reject requests?",
        body:
          "Yes. Admin users can review student requests, approve collection, reject requests with a reason, mark certificates as collected, and send messages that students can read in the application."
      },
      {
        heading: "What happens if verification fails?",
        body:
          "The student should retry with better lighting, a clear face position, and the same registered device. If the issue continues, an admin can review the case and guide the student."
      },
      {
        heading: "Does the system replace human administrators?",
        body:
          "No. It supports administrators by organizing evidence and workflow. Final approval and institutional decisions still remain with authorized staff."
      }
    ]
  },
  privacy: {
    title: "Privacy Policy",
    intro:
      "This policy explains how the certificate verification system handles student information, biometric-related verification data, and administrative records.",
    sections: [
      {
        heading: "Information collected",
        body:
          "The system may collect a student's name, student ID, email address, faculty, programme, password hash, face image, device credential ID, certificate request status, admin messages, request dates, approval dates, and collection records."
      },
      {
        heading: "How information is used",
        body:
          "Information is used to create student accounts, verify identity, process certificate requests, support administrator decisions, send status messages, and maintain a record of certificate collection."
      },
      {
        heading: "Biometric-related data",
        body:
          "The system uses face images for matching and device biometric credentials for account verification. Device biometric secrets such as raw fingerprints, face unlock data, or PINs remain on the user's device and are not stored by this application."
      },
      {
        heading: "Storage and access",
        body:
          "Records are stored in the configured database, and face images may be stored locally during development or in the configured private Supabase storage bucket during deployment. Access should be limited to authorized administrators."
      },
      {
        heading: "Retention",
        body:
          "The institution should keep records only for as long as needed for certificate processing, audit, dispute resolution, and institutional policy. Test records should be removed before production use."
      },
      {
        heading: "Student responsibility",
        body:
          "Students should use accurate information, protect their account password, and report suspicious account activity or incorrect certificate status to an administrator."
      }
    ]
  },
  legal: {
    title: "Legal Notice",
    intro:
      "These terms describe acceptable use, responsibilities, and limitations for the certificate verification system.",
    sections: [
      {
        heading: "Purpose",
        body:
          "The system is provided to support certificate request, identity verification, approval, messaging, and collection tracking. It should be used only for legitimate institutional certificate workflows."
      },
      {
        heading: "Authorized use",
        body:
          "Students must use their own account and accurate details. Administrators must access only the records required for their assigned duties and must not share credentials."
      },
      {
        heading: "Accuracy of records",
        body:
          "The system improves traceability but depends on accurate registration, clear face capture, correct administrator review, and properly configured database and storage services."
      },
      {
        heading: "Security limitations",
        body:
          "No digital system can guarantee absolute security. The application should be deployed with strong passwords, private storage, restricted service keys, HTTPS, limited admin access, and regular backups."
      },
      {
        heading: "Administrative decisions",
        body:
          "The application provides workflow support. Final certificate approval, rejection, collection, and dispute decisions remain the responsibility of the institution and authorized staff."
      },
      {
        heading: "Changes",
        body:
          "The system may be improved over time to strengthen security, user experience, reporting, auditing, and integration with institutional platforms."
      }
    ]
  }
}

function InfoPage() {
  const { page = "faq" } = useParams()
  const content = pageContent[page] || pageContent.faq

  return (
    <main className="info-page">
      <section className="info-shell">
        <header className="info-header">
          <Link to="/auth" className="info-brand">
            <img
              src={appLogo}
              alt="Pentvars Certificate Verification"
            />
          </Link>

          <nav className="info-nav" aria-label="Information pages">
            <Link to="/info/faq">FAQ</Link>
            <Link to="/info/privacy">Privacy</Link>
            <Link to="/info/legal">Legal</Link>
          </nav>
        </header>

        <div className="info-hero">
          <h1>{content.title}</h1>
          <p>{content.intro}</p>
        </div>

        <div className="info-downloads">
          <a
            href="/downloads/certificate-verification-presentation.pptx"
            download
          >
            Download Presentation
          </a>

          <a
            href="/downloads/lecturer-questions-and-student-answers.docx"
            download
          >
            Download Q&A Document
          </a>
        </div>

        <div className="info-sections">
          {content.sections.map((section) => (
            <article className="info-section" key={section.heading}>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default InfoPage
