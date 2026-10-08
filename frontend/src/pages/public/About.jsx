import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumb';

const About = () => {
  useEffect(() => {
    document.title = 'About BookLoop | Smart Book Lending & Exchange Platform';
  }, []);

  return (
    <div className="about-page container">
      <Breadcrumb items={[{ label: 'About BookLoop' }]} />

      <section className="about-hero">
        <span className="section-tag">Campus Initiative</span>
        <h1 className="about-title">About BookLoop</h1>
        <p className="about-lead">
          BookLoop is a student-driven book lending and exchange ecosystem built to make textbooks,
          novels, and technical literature accessible across the campus community without financial barriers.
        </p>
      </section>

      {/* Philosophy & Pillars */}
      <section className="about-pillars-grid">
        <div className="pillar-card">
          <div className="pillar-icon">
            <i className="fa-solid fa-recycle"></i>
          </div>
          <h3>Sustainable Reading</h3>
          <p>
            Instead of books gathering dust on dorm shelves, BookLoop ensures every copy finds its next
            enthusiastic reader, reducing waste and textbook expenses.
          </p>
        </div>

        <div className="pillar-card">
          <div className="pillar-icon">
            <i className="fa-solid fa-coins"></i>
          </div>
          <h3>Credit Economy</h3>
          <p>
            No real currency needed. Our internal credit flow rewards active lenders and allows
            responsible borrowers to access books seamlessly.
          </p>
        </div>

        <div className="pillar-card">
          <div className="pillar-icon">
            <i className="fa-solid fa-certificate"></i>
          </div>
          <h3>Trusted Peer Network</h3>
          <p>
            Community members earn ratings and reviews on completed exchanges. Dedicated members
            achieve the verified Trusted User badge.
          </p>
        </div>
      </section>

      {/* Credit System Breakdown */}
      <section className="about-rules-card">
        <div className="rules-header">
          <h2>
            <i className="fa-solid fa-circle-question"></i> How Does the Credit Flow Work?
          </h2>
          <p>Fair, automated, and built to encourage reciprocal sharing.</p>
        </div>

        <div className="rules-steps-grid">
          <div className="rule-step">
            <div className="rule-num">1</div>
            <h4>Sign Up Gift</h4>
            <p>Every newly registered user automatically starts with <strong>3 Credits</strong>.</p>
          </div>

          <div className="rule-step">
            <div className="rule-num">2</div>
            <h4>Requesting Books</h4>
            <p>Requesting requires at least <strong>1 Credit</strong>. Your credit is held once accepted.</p>
          </div>

          <div className="rule-step">
            <div className="rule-num">3</div>
            <h4>Borrowing</h4>
            <p>When the owner accepts, <strong>1 Credit</strong> is deducted from the borrower for 14 days.</p>
          </div>

          <div className="rule-step">
            <div className="rule-num">4</div>
            <h4>Returning</h4>
            <p>Upon return, <strong>1 Credit</strong> is awarded to the book owner for sharing.</p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="faq-section">
        <div className="section-header">
          <span className="section-tag">Common Inquiries</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
        </div>

        <div className="faq-grid">
          <div className="faq-card">
            <h4><i className="fa-solid fa-arrow-right-arrow-left"></i> What does an "Exchange" listing mean?</h4>
            <p>
              "Exchange" listings signify that the owner is particularly open to swapping books with other members.
              In BookLoop, both Lend and Exchange use the same smooth credit flow: <em>Swap or borrow using credits</em>.
            </p>
          </div>

          <div className="faq-card">
            <h4><i className="fa-solid fa-clock"></i> What happens if a loan becomes overdue?</h4>
            <p>
              Loans have a standard 14-day duration. If not returned by the due date, the listing displays
              a red Overdue badge on the platform to notify the borrower and owner.
            </p>
          </div>

          <div className="faq-card">
            <h4><i className="fa-solid fa-star"></i> How do I become a Trusted User?</h4>
            <p>
              To earn the Trusted User badge, you must maintain an average rating of 4.0 or higher
              with at least 3 completed ratings from fellow community members.
            </p>
          </div>

          <div className="faq-card">
            <h4><i className="fa-solid fa-ban"></i> Can I delete a book that is currently borrowed?</h4>
            <p>
              No. To protect active readers, books currently marked as 'borrowed' cannot be deleted by
              either the owner or administrators until returned.
            </p>
          </div>
        </div>
      </section>

      <div className="about-cta-footer">
        <h3>Have more questions or feedback?</h3>
        <p>Our student support desk is happy to help you get the most out of BookLoop.</p>
        <Link to="/contact" className="btn btn-primary">
          <i className="fa-solid fa-envelope"></i> Contact Us
        </Link>
      </div>
    </div>
  );
};

export default About;
