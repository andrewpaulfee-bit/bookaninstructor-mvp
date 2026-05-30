import Nav from "../../components/Nav";

const faqs = [
  {
    question: "What is BookAnInstructor.com?",
    answer:
      "BookAnInstructor.com is an online community that connects clients with instructors, trainers, coaches, and teachers from various fields. The platform offers a wide range of services, from fitness and education to personal development and specialised skills training.",
  },
  {
    question: "How do I find the right instructor?",
    answer:
      "You can search for instructors based on your specific needs, such as expertise, location, or availability. Each instructor has a profile showcasing their qualifications, experience, and reviews from past clients to help you make an informed decision.",
  },
  {
    question: "Are there any upfront fees for using the platform?",
    answer:
      "No, there are no upfront fees for joining BookAnInstructor.com. Clients pay for services once they book a session with their chosen instructor.",
  },
  {
    question: "How do payments work?",
    answer:
      "Payments are handled securely through the platform. Once you book an instructor, you will be guided through the payment process, and the instructor will be paid after the session is completed.",
  },
  {
    question: "Can I communicate with instructors before booking?",
    answer:
      "Yes, you can message instructors directly through the platform to discuss your requirements, ask questions, or clarify any details before making a booking.",
  },
  {
    question: "What types of instructors are available?",
    answer:
      "BookAnInstructor.com offers a wide range of professionals. Initially, we are able to provide performing arts and wellbeing instructors. We plan to include language tutors, music teachers, business coaches, sports coaches and more in the future.",
  },
];

const childrenCheckLinks = [
  { label: "NSW", href: "https://ocg.nsw.gov.au/" },
  { label: "VIC", href: "https://www.workingwithchildren.vic.gov.au/" },
  { label: "WA", href: "https://workingwithchildren.wa.gov.au/" },
  {
    label: "NT",
    href: "https://nt.gov.au/emergency/child-safety/working-with-children-clearance-before-you-apply",
  },
  { label: "SA", href: "https://screening.sa.gov.au/" },
  {
    label: "TAS",
    href: "https://www.cbos.tas.gov.au/topics/licensing-and-registration/work-with-vulnerable-people",
  },
  {
    label: "ACT",
    href: "https://www.accesscanberra.act.gov.au/s/article/working-with-vulnerable-people-wwvp-registration-tab-overview",
  },
];

export default function FAQs() {
  return (
    <main className="container">
      <Nav />

      <article className="termsPage">
        <p className="eyebrow">BookAnInstructor</p>
        <h1>FAQs</h1>
        <h2>Please review our most Frequently Asked Questions</h2>

        <div className="faqList">
          {faqs.map((faq) => (
            <section className="faqItem" key={faq.question}>
              <h2>{faq.question}</h2>
              <p>{faq.answer}</p>
            </section>
          ))}
        </div>

        <section className="faqItem">
          <h2>Working with Children Links</h2>
          <p>
            When working with children in Australia, you must have a Working
            with Children Card. Please see more information below for each state
            and territory.
          </p>

          <div className="linkGrid">
            {childrenCheckLinks.map((link) => (
              <a href={link.href} key={link.label} target="_blank">
                {link.label} Link
              </a>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}

