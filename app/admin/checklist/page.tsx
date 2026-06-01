import AdminGate from "../../../components/AdminGate";
import Nav from "../../../components/Nav";

const checklistSections = [
  {
    title: "Approve Jobs",
    intro:
      "Use this when a client submits a new instructor request. The job should be clear enough for instructors to decide whether they can apply.",
    steps: [
      "Open Admin, then click the Pending Jobs number or scroll to Pending job approvals.",
      "Click Review job.",
      "Check the title, style, class level, location, budget, total hours, date or recurring details, and client notes.",
      "Make sure the job does not include private contact details inside the public description.",
      "Edit small spelling or formatting issues if needed.",
      "Click Approve / publish when the request is ready for instructors.",
    ],
    goodToKnow:
      "Once approved, the job appears for instructors and the client receives an approval email.",
  },
  {
    title: "Approve Instructors",
    intro:
      "Use this when a new instructor profile is submitted. We want profiles to look professional and trustworthy before they appear publicly.",
    steps: [
      "Open Admin, then click the Pending Instructors number or scroll to Pending instructor approvals.",
      "Click Review instructor.",
      "Check their name, profile photo, location, categories, service areas, ABN/GST fields, and Working with Children details if provided.",
      "Read the bio and make sure it explains what they teach without showing private contact details.",
      "Confirm the profile photo is suitable and the profile feels client-ready.",
      "Click Approve / publish when the profile is ready.",
    ],
    goodToKnow:
      "Only approved instructors should appear in Find Instructors and be able to confidently apply for jobs.",
  },
  {
    title: "Handle Needs Changes",
    intro:
      "Use this when a job or instructor profile is close, but needs more information or clearer wording before approval.",
    steps: [
      "Open the job or instructor review page.",
      "Click Needs changes.",
      "Write a short, specific note explaining what needs to be fixed.",
      "Mention exactly which field needs attention, such as budget, class level, date, location, bio, or profile photo.",
      "Keep the wording friendly and practical.",
      "Send the change request. The system emails the client or instructor with your notes.",
    ],
    goodToKnow:
      "Good notes save time. Example: Please add the class date and confirm whether this is one-off or ongoing.",
  },
  {
    title: "Check Agreements and Payments",
    intro:
      "Use this after a client selects an instructor. The agreement and payment flow should move the booking from selected to confirmed.",
    steps: [
      "Open Admin and check Active bookings.",
      "Open the job or agreement if a booking looks stuck.",
      "Confirm the agreement has been sent to the instructor.",
      "Check whether the instructor has accepted the agreement.",
      "Once accepted, confirm the client has received the payment request.",
      "After payment, the agreement should show Payment received and the booking is confirmed.",
    ],
    goodToKnow:
      "If payment is not marked paid after checkout, open the agreement link from the client account and refresh the page.",
  },
  {
    title: "Process Payout Review",
    intro:
      "Use this after the class is complete and both reviews have been submitted. This is the final admin step.",
    steps: [
      "Open Admin and click the Payout Review number.",
      "Check the booking card: contract number, total fee, instructor payout, completion date, and both reviews.",
      "Open View agreement if you need to confirm the booking details.",
      "If Stripe Connect is ready for that instructor, use Release via Stripe.",
      "If paying another way, use Approve manual payout and add a useful reference or note.",
      "Confirm the payout status changes and the instructor receives the payout confirmation email.",
    ],
    goodToKnow:
      "For now, payout review is human-controlled. Do not release a payout unless the booking, reviews, and amount all look correct.",
  },
];

export default function AdminChecklist() {
  return (
    <main className="container">
      <Nav />

      <AdminGate>
        <section className="pageHeader">
          <p className="eyebrow">Admin guide</p>
          <h1>BookAnInstructor admin checklist</h1>
          <p>
            A practical operating guide for reviewing submissions, managing bookings,
            and closing payouts.
          </p>
        </section>

        <section className="adminGuideIntro">
          <h2>Daily admin rhythm</h2>
          <ol>
            <li>Review pending jobs and instructor profiles first.</li>
            <li>Check active bookings for agreements, payments, and messages.</li>
            <li>Watch completed classes until both reviews are submitted.</li>
            <li>Process payout review only after reviews and booking details are complete.</li>
          </ol>
          <a className="btn" href="/admin">
            Open admin dashboard
          </a>
        </section>

        <section className="adminGuideList">
          {checklistSections.map((section) => (
            <article className="adminGuideCard" key={section.title}>
              <div>
                <h2>{section.title}</h2>
                <p>{section.intro}</p>
              </div>

              <ol>
                {section.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>

              <p className="adminGuideNote">
                <strong>Good to know:</strong> {section.goodToKnow}
              </p>
            </article>
          ))}
        </section>
      </AdminGate>
    </main>
  );
}
