import Footer from "../../components/Footer";
import Nav from "../../components/Nav";

const steps = [
  {
    number: "1",
    title: "Post a Job for an Instructor",
    body:
      "Tell us what you need, including style, class level, location, budget, frequency, and any important details. Your request is reviewed by BookAnInstructor before it is released to approved instructors.",
    image: "/how-step-1.jpeg",
    align: "imageLeft",
  },
  {
    number: "2",
    title: "Approved Instructors Submit Offers",
    body:
      "Once your job is approved, suitable instructors can reply with their availability, proposed fee, and message. All communication stays inside the BookAnInstructor message system.",
    image: "/how-step-2.jpeg",
    align: "imageRight",
  },
  {
    number: "3",
    title: "Select Your Instructor",
    body:
      "Review instructor replies, message them through the platform, choose the best fit, and complete the booking payment when prompted. Your booking is then confirmed in the system.",
    image: "/how-step-3.jpeg",
    align: "imageLeft",
  },
  {
    number: "4",
    title: "Complete the Class and Leave Reviews",
    body:
      "After the class, the instructor marks the session complete. The client and instructor are then invited to review each other, helping keep the marketplace trusted and transparent.",
    image: "/how-step-4.jpeg",
    align: "imageRight",
  },
];

export default function HowItWorks() {
  return (
    <main className="container">
      <Nav />

      <section className="howHero">
        <div className="dotAccent" />
        <p className="eyebrow">How it works</p>
        <h1>Finding your perfect instructor is simple.</h1>
        <p>
          BookAnInstructor keeps the process clear: reviewed job posts, approved
          instructors, in-platform messaging, secure booking steps, and reviews
          after completion.
        </p>
      </section>

      <section className="howSteps">
        {steps.map((step) => (
          <article className={`howStep ${step.align}`} key={step.number}>
            <div className="howStepVisual">
              <img alt="" src={step.image} />
            </div>

            <div className="howStepText">
              <h2>{step.title}</h2>
              <p>{step.body}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="howCta">
        <h2>Ready to find an instructor?</h2>
        <p>
          Post a request and our review process will make sure it is ready before
          approved instructors respond.
        </p>
        <div className="buttonRow">
          <a className="btn" href="/post-job">
            Post a Job
          </a>
          <a className="secondaryButton" href="/instructors">
            Find Instructors
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
