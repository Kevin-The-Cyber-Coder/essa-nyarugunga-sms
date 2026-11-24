import React, { useEffect } from 'react';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Only the image that is actually used on this page
import studentsImage from '../assets/students.png';

const AcademicsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLearnMore = (programName) => {
    Swal.fire({
      title: programName,
      text: `For more information about ${programName}, please contact the academic office or visit the school.`,
      icon: 'info',
      confirmButtonText: 'Contact Admissions',
      confirmButtonColor: '#1e3c72'
    });
  };

  const combinations = [
    {
      id: 1,
      name: 'Software Development',
      icon: 'fas fa-code',
      subtitle: 'ICT Option',
      subjects: ['Computer Science', 'Mathematics', 'Physics', 'Programming Languages'],
      careerPath: 'Software Engineer, Web Developer, IT Consultant, Database Administrator',
      color: '#3498db'
    },
    {
      id: 2,
      name: 'Accounting',
      icon: 'fas fa-chart-line',
      subtitle: 'Economics Option',
      subjects: ['Accounting', 'Economics', 'Mathematics', 'Entrepreneurship'],
      careerPath: 'Accountant, Auditor, Financial Analyst, Tax Consultant, Banker',
      color: '#27ae60'
    },
    {
      id: 3,
      name: 'Computer Systems & Architecture',
      icon: 'fas fa-microchip',
      subtitle: 'ICT Option',
      subjects: ['Computer Architecture', 'Networking', 'Mathematics', 'Electronics'],
      careerPath: 'Network Engineer, Systems Administrator, Hardware Engineer, IT Support',
      color: '#9b59b6'
    },
    {
      id: 4,
      name: 'Tourism & Hospitality',
      icon: 'fas fa-umbrella-beach',
      subtitle: 'Languages Option',
      subjects: ['Tourism', 'Hospitality Management', 'French', 'English'],
      careerPath: 'Tour Operator, Hotel Manager, Travel Agent, Event Planner',
      color: '#e74c3c'
    },
    {
      id: 5,
      name: 'Building and Construction',
      icon: 'fas fa-building',
      subtitle: 'BDC Option',
      subjects: ['Stone Structure', 'Building Management', 'Physics', 'Mathematics'],
      careerPath: 'Building Engineer, Construction Manager, Site Supervisor',
      color: '#f39c12'
    },
    {
      id: 6,
      name: 'Food and Beverages Operation',
      icon: 'fas fa-utensils',
      subtitle: 'FBO Option',
      subjects: ['Food Preparation', 'Beverages Management', 'French', 'English'],
      careerPath: 'Kitchen Operator, Cook, Restaurant Manager, Event Planner',
      color: '#1abc9c'
    }
  ];

  const ordinaryCoreSubjects = [
    'Mathematics',
    'English Language',
    'French',
    'Kinyarwanda',
    'Physics',
    'Chemistry',
    'Biology',
    'Social Studies',
    'Computer Science',
    'Religion & Ethics'
  ];

  const ordinaryElectives = [
    'Entrepreneurship',
    'Art & Design',
    'Music',
    'Physical Education',
    'Agriculture',
    'Home Economics'
  ];

  const ordinaryAssessment = [
    { label: 'Continuous Assessment', value: '30%' },
    { label: 'Term Exams', value: '30%' },
    { label: 'National Exams', value: '40%' },
    { label: 'Projects & Practicals', value: 'Included' }
  ];

  const resources = [
    { name: 'School Library', icon: 'fas fa-book', description: 'Over 5,000 books including textbooks, references, fiction, and periodicals.', detail: 'Mon-Fri: 8AM - 5PM' },
    { name: 'Computer Labs', icon: 'fas fa-laptop', description: 'Three modern computer labs with 50+ computers and high-speed internet.', detail: '3 Labs | 50+ PCs' },
    { name: 'Science Laboratory', icon: 'fas fa-flask', description: 'Fully equipped Physics, Chemistry, and Biology laboratories.', detail: '3 Specialized Labs' },
    { name: 'E-Learning Platform', icon: 'fas fa-wifi', description: 'Access to online resources, digital assignments, and virtual classrooms.', detail: '24/7 Access' }
  ];

  const heroStats = [
    { number: '95%', label: 'Pass Rate', icon: 'fas fa-chart-line' },
    { number: '6+', label: 'Programs', icon: 'fas fa-layer-group' },
    { number: '30+', label: 'Teachers', icon: 'fas fa-chalkboard-user' },
    { number: '1:15', label: 'Teacher Ratio', icon: 'fas fa-users' }
  ];

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="academics-hero">
        <div className="container academics-hero-content">
          <div className="hero-badge">
            <i className="fas fa-graduation-cap"></i> ACADEMIC EXCELLENCE
          </div>
          <h1>Academics at <span className="highlight">ESSA Nyarugunga</span></h1>
          <p>Excellence in Education | Diverse Programs | Holistic Development</p>
        </div>
      </section>

      {/* Stats cards: overlap the bottom of the hero using one shared offset,
          so no per-breakpoint magic numbers are needed */}
      <section className="stats-strip">
        <div className="container">
          <div className="stats-cards">
            {heroStats.map((stat, index) => (
              <div key={index} className="stat-card">
                <i className={stat.icon}></i>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Academic Overview */}
      <section className="academics-overview">
        <div className="container">
          <div className="overview-grid">
            <div className="overview-content">
              <div className="section-badge">Academic Excellence</div>
              <h2>Quality Education <span className="highlight">For Every Student</span></h2>
              <p>At ESSA Nyarugunga, we follow the Rwandan national curriculum enhanced with modern teaching methodologies. Our academic programs are designed to develop critical thinking, problem-solving skills, and practical knowledge.</p>
              <p>We offer both Ordinary Level (S1-S3) and Advanced Level (S4-S6) programs with various combinations to suit different career paths.</p>
              <div className="academic-stats">
                <div className="stat-item">
                  <span className="stat-number">95%</span>
                  <span className="stat-label">Pass Rate</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">6+</span>
                  <span className="stat-label">Programs</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">30+</span>
                  <span className="stat-label">Teachers</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">1:15</span>
                  <span className="stat-label">Teacher Ratio</span>
                </div>
              </div>
            </div>
            <div className="overview-image">
              <img src={studentsImage} alt="Students in class" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* ============ ACADEMIC LEVELS ============ */}
      <section className="academics-levels">
        <div className="container">
          <div className="section-title">
            <h2><i className="fas fa-layer-group"></i> Academic Levels</h2>
            <div className="underline"></div>
            <p className="section-subtitle">Choose your path to success</p>
          </div>

          {/* ORDINARY LEVEL */}
          <div className="level-section">
            <div className="level-section-header">
              <div className="level-section-icon">
                <i className="fas fa-book-open"></i>
              </div>
              <div className="level-section-heading">
                <span className="level-tag">Ordinary Level</span>
                <h3>Ordinary Level (S1 - S3)</h3>
                <p>A strong foundation for future success — building core skills, curiosity, and character.</p>
              </div>
            </div>

            <div className="level-grid">
              <div className="level-card">
                <i className="fas fa-book-open"></i>
                <h4>Core Subjects</h4>
                <ul>
                  {ordinaryCoreSubjects.map((subject, idx) => (
                    <li key={idx}><span><i className="fas fa-check"></i> {subject}</span></li>
                  ))}
                </ul>
              </div>
              <div className="level-card">
                <i className="fas fa-palette"></i>
                <h4>Electives</h4>
                <ul>
                  {ordinaryElectives.map((subject, idx) => (
                    <li key={idx}><span><i className="fas fa-check"></i> {subject}</span></li>
                  ))}
                </ul>
              </div>
              <div className="level-card">
                <i className="fas fa-clock"></i>
                <h4>Assessment</h4>
                <ul>
                  {ordinaryAssessment.map((item, idx) => (
                    <li key={idx}>
                      <span><i className="fas fa-check"></i> {item.label}</span>
                      <span className="assessment-value">{item.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ADVANCED LEVEL */}
          <div className="level-section advanced-section">
            <div className="level-section-header">
              <div className="level-section-icon advanced-icon">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <div className="level-section-heading">
                <span className="level-tag advanced-tag">Advanced Level</span>
                <h3>Advanced Level (L3 - L5)</h3>
                <p>Specialized combinations designed to prepare students for university and professional careers.</p>
              </div>
            </div>

            <div className="advanced-intro">
              <p>At Advanced Level, students choose combinations based on their career aspirations. Each combination is carefully designed to prepare students for university education and professional careers. Explore our six specialized programs below.</p>
            </div>

            <div className="combinations-grid">
              {combinations.map(combo => (
                <div key={combo.id} className="combination-card" style={{ borderTop: `4px solid ${combo.color}` }}>
                  <div className="combination-icon" style={{ background: combo.color }}>
                    <i className={combo.icon}></i>
                  </div>
                  <h3>{combo.name}</h3>
                  <p className="combination-subtitle">{combo.subtitle}</p>
                  <div className="subjects">
                    <h4>Subjects:</h4>
                    <ul>
                      {combo.subjects.map((subject, idx) => (
                        <li key={idx}>{subject}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="career-path">
                    <h4>Career Path:</h4>
                    <p>{combo.careerPath}</p>
                  </div>
                  <button type="button" className="learn-more" onClick={() => handleLearnMore(combo.name)}>
                    Learn More <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Learning Resources */}
      <section className="academics-resources">
        <div className="container">
          <div className="section-title">
            <h2><i className="fas fa-book-open"></i> Learning Resources</h2>
            <div className="underline"></div>
          </div>
          <div className="resources-grid">
            {resources.map((resource, index) => (
              <div key={index} className="resource-card">
                <i className={resource.icon}></i>
                <h3>{resource.name}</h3>
                <p>{resource.description}</p>
                <span className="resource-hours"><i className="fas fa-clock"></i> {resource.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Academic Support */}
      <section className="academics-support">
        <div className="container">
          <div className="support-box">
            <div className="support-icon">
              <i className="fas fa-chalkboard-user"></i>
            </div>
            <div className="support-content">
              <h3>Academic Support & Remedial Classes</h3>
              <p>We offer extra classes, tutoring, and academic counseling to ensure every student succeeds. Remedial programs are available for students who need additional support in any subject.</p>
              <div className="support-features">
                <span><i className="fas fa-clock"></i> After-school Tutoring</span>
                <span><i className="fas fa-users"></i> Peer Mentoring</span>
                <span><i className="fas fa-chart-line"></i> Progress Tracking</span>
                <span><i className="fas fa-calendar"></i> Saturday Classes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Styles */}
      <style>{`
        /* ---------- Shared container (fallback if no global .container) ---------- */
        .academics-hero .container,
        .stats-strip .container,
        .academics-overview .container,
        .academics-levels .container,
        .academics-resources .container,
        .academics-support .container {
          width: 100%;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
          padding-left: clamp(1rem, 4vw, 2rem);
          padding-right: clamp(1rem, 4vw, 2rem);
          box-sizing: border-box;
        }

        .academics-hero *,
        .stats-strip *,
        .academics-overview *,
        .academics-levels *,
        .academics-resources *,
        .academics-support * {
          box-sizing: border-box;
        }

        /* One shared overlap value for the hero + stats strip */
        .academics-hero,
        .stats-strip {
          --overlap: 4.5rem;
        }

        /* ---------- Hero ---------- */
        .academics-hero {
          position: relative;
          background: #1e3c72;
          padding: clamp(2.5rem, 6vw, 4rem) 0 calc(var(--overlap) + 2.5rem);
        }

        .academics-hero-content {
          text-align: center;
          color: white;
        }

        .hero-badge {
          display: inline-block;
          background: rgba(255,193,7,0.15);
          color: #ffc107;
          padding: 7px 18px;
          border-radius: 30px;
          font-size: clamp(0.7rem, 2.5vw, 0.8rem);
          margin-bottom: 1rem;
          border: 1px solid rgba(255,193,7,0.3);
          letter-spacing: 1px;
          font-weight: 600;
          animation: fadeInDown 0.6s ease both;
        }

        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-15px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .academics-hero-content h1 {
          font-size: clamp(1.5rem, 5.5vw, 2.5rem);
          line-height: 1.2;
          margin: 0 0 1rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.25);
          overflow-wrap: anywhere;
          animation: fadeInUp 0.7s ease 0.1s both;
        }

        .academics-hero-content .highlight {
          color: #ffc107;
        }

        .academics-hero-content p {
          font-size: clamp(0.88rem, 2.6vw, 1.05rem);
          opacity: 0.92;
          margin: 0 auto;
          max-width: 620px;
          line-height: 1.6;
          animation: fadeInUp 0.7s ease 0.2s both;
        }

        /* ---------- Stats strip ---------- */
        .stats-strip {
          position: relative;
          z-index: 5;
          margin-top: calc(var(--overlap) * -1);
          /* transparent over the hero, white below it */
          background: linear-gradient(to bottom, transparent 0, transparent var(--overlap), #ffffff var(--overlap));
        }

        .stats-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }

        .stat-card {
          background: #ffffff;
          border-radius: 14px;
          padding: 1.75rem 1rem;
          text-align: center;
          box-shadow: 0 12px 32px rgba(10, 22, 40, 0.14);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 18px 44px rgba(10, 22, 40, 0.2);
        }

        .stat-card i {
          font-size: 2rem;
          color: #ffc107;
          margin-bottom: 0.5rem;
          display: inline-block;
        }

        .stat-card .stat-number {
          font-size: 2rem;
          font-weight: 800;
          color: #ffc107;
          margin: 0.25rem 0;
          letter-spacing: -0.5px;
        }

        .stat-card .stat-label {
          font-size: 0.88rem;
          color: #4a5568;
          font-weight: 500;
        }

        /* ---------- Overview ---------- */
        .academics-overview {
          padding: clamp(2rem, 5vw, 3.5rem) 0 clamp(2.5rem, 6vw, 4rem);
          background: white;
        }

        .overview-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(1.5rem, 4vw, 3rem);
          align-items: center;
        }

        .overview-content {
          text-align: left;
          min-width: 0;
        }

        .section-badge {
          display: inline-block;
          background: #ffc10720;
          color: #d4a017;
          padding: 0.3rem 1rem;
          border-radius: 30px;
          font-size: 0.8rem;
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .overview-content h2 {
          font-size: clamp(1.4rem, 4.5vw, 2rem);
          line-height: 1.25;
          margin: 0 0 1rem;
          color: #1e3c72;
        }

        .overview-content .highlight {
          color: #ffc107;
        }

        .overview-content p {
          color: #555;
          margin: 0 0 1rem;
          line-height: 1.7;
          font-size: clamp(0.92rem, 2.4vw, 1rem);
        }

        .academic-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .stat-item {
          text-align: center;
          background: #f8f9fa;
          padding: 0.9rem 0.5rem;
          border-radius: 12px;
        }

        .stat-item .stat-number {
          display: block;
          font-size: clamp(1.15rem, 3.5vw, 1.5rem);
          font-weight: 700;
          color: #1e3c72;
        }

        .stat-item .stat-label {
          font-size: 0.75rem;
          color: #666;
        }

        .overview-image {
          min-width: 0;
        }

        .overview-image img {
          display: block;
          width: 100%;
          height: auto;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        /* ---------- Academic Levels ---------- */
        .academics-levels {
          padding: clamp(2.5rem, 6vw, 4rem) 0;
          background: #f8f9fa;
        }

        .section-title {
          text-align: center;
          margin-bottom: clamp(1.75rem, 5vw, 3rem);
        }

        .section-title h2 {
          font-size: clamp(1.4rem, 4.5vw, 2rem);
          color: #1e3c72;
          margin: 0;
        }

        .section-title h2 i {
          color: #ffc107;
          margin-right: 10px;
        }

        .underline {
          width: 80px;
          height: 3px;
          background: #ffc107;
          margin: 10px auto;
        }

        .section-subtitle {
          color: #666;
          font-size: 0.9rem;
          margin: 0;
        }

        .level-section {
          background: #ffffff;
          border-radius: 20px;
          padding: clamp(1.25rem, 4vw, 2.5rem);
          margin-bottom: clamp(1.5rem, 4vw, 2.5rem);
          box-shadow: 0 6px 24px rgba(30, 60, 114, 0.06);
          border: 1px solid #eef1f6;
        }

        .advanced-section {
          margin-bottom: 0;
        }

        .level-section-header {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding-bottom: 1.5rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid #f1f5f9;
          text-align: left;
        }

        .level-section-icon {
          flex-shrink: 0;
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: #1e3c72;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .level-section-icon i {
          font-size: 1.6rem;
          color: #ffc107;
        }

        .level-section-icon.advanced-icon {
          background: linear-gradient(135deg, #ffc107 0%, #d4a017 100%);
        }

        .level-section-icon.advanced-icon i {
          color: #1e3c72;
        }

        .level-section-heading {
          text-align: left;
          min-width: 0;
        }

        .level-tag {
          display: inline-block;
          background: #1e3c72;
          color: #ffffff;
          padding: 4px 14px;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }

        .level-tag.advanced-tag {
          background: #ffc107;
          color: #1e3c72;
        }

        .level-section-heading h3 {
          font-size: clamp(1.15rem, 3.6vw, 1.6rem);
          color: #1e3c72;
          margin: 0 0 0.35rem;
          font-weight: 800;
        }

        .level-section-heading p {
          color: #64748b;
          font-size: 0.9rem;
          line-height: 1.5;
          margin: 0;
        }

        .level-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .level-card {
          background: #f8fafc;
          padding: clamp(1.15rem, 3vw, 1.75rem);
          border-radius: 16px;
          text-align: left;
          border: 1px solid #eef1f6;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          min-width: 0;
        }

        .level-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(30, 60, 114, 0.08);
        }

        .level-card > i {
          font-size: 2rem;
          color: #1e3c72;
          margin-bottom: 1rem;
          display: inline-block;
        }

        .level-card h4 {
          margin: 0 0 1rem;
          color: #1e3c72;
          font-size: 1.1rem;
        }

        .level-card ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .level-card ul li {
          margin: 0.55rem 0;
          font-size: 0.9rem;
          color: #475569;
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 10px;
        }

        .level-card ul li i {
          font-size: 0.75rem;
          color: #ffc107;
          margin-right: 8px;
        }

        .assessment-value {
          font-weight: 700;
          color: #1e3c72;
          font-size: 0.82rem;
          white-space: nowrap;
        }

        /* ---------- Combinations ---------- */
        .advanced-intro {
          text-align: center;
          margin-bottom: 2rem;
          padding: 1.25rem 1.5rem;
          background: #f8fafc;
          border-radius: 12px;
          border-left: 4px solid #ffc107;
        }

        .advanced-intro p {
          margin: 0;
          color: #475569;
          font-size: 0.92rem;
          line-height: 1.6;
        }

        .combinations-grid {
          display: grid;
          /* min(100%, 300px) stops overflow on very narrow phones */
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
          gap: 1.5rem;
        }

        .combination-card {
          background: #ffffff;
          border-radius: 16px;
          padding: clamp(1.25rem, 3vw, 1.75rem);
          transition: transform 0.3s, box-shadow 0.3s;
          text-align: left;
          box-shadow: 0 4px 16px rgba(30, 60, 114, 0.06);
          min-width: 0;
        }

        .combination-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 14px 34px rgba(30, 60, 114, 0.12);
        }

        .combination-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .combination-icon i {
          font-size: 1.5rem;
          color: white;
        }

        .combination-card h3 {
          margin: 0 0 0.3rem;
          color: #1e3c72;
          font-size: 1.15rem;
          overflow-wrap: anywhere;
        }

        .combination-subtitle {
          color: #d4a017;
          font-weight: 600;
          font-size: 0.8rem;
          margin: 0 0 1rem;
        }

        .subjects, .career-path {
          margin: 1rem 0;
        }

        .subjects h4, .career-path h4 {
          font-size: 0.85rem;
          color: #666;
          margin: 0 0 0.5rem;
        }

        .subjects ul {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .subjects ul li {
          background: #f0f2f5;
          padding: 0.3rem 0.8rem;
          border-radius: 20px;
          font-size: 0.78rem;
          color: #475569;
        }

        .career-path p {
          font-size: 0.88rem;
          color: #555;
          line-height: 1.5;
          margin: 0;
        }

        .learn-more {
          background: none;
          border: none;
          color: #d4a017;
          font-weight: 600;
          cursor: pointer;
          margin-top: 0.5rem;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.6rem 0;
          min-height: 44px; /* comfortable touch target */
          font-size: 0.9rem;
          font-family: inherit;
        }

        .learn-more:hover,
        .learn-more:focus-visible {
          color: #1e3c72;
        }

        /* ---------- Resources ---------- */
        .academics-resources {
          padding: clamp(2.5rem, 6vw, 4rem) 0;
          background: #f8f9fa;
        }

        .resources-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 230px), 1fr));
          gap: 1.5rem;
        }

        .resource-card {
          background: white;
          padding: 1.5rem;
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 4px 16px rgba(30, 60, 114, 0.05);
          transition: transform 0.3s ease;
        }

        .resource-card:hover {
          transform: translateY(-4px);
        }

        .resource-card i {
          font-size: 2rem;
          color: #1e3c72;
          margin-bottom: 1rem;
        }

        .resource-card h3 {
          margin: 0 0 0.5rem;
          color: #1e3c72;
        }

        .resource-card p {
          font-size: 0.88rem;
          color: #666;
          line-height: 1.6;
          margin: 0 0 1rem;
        }

        .resource-hours {
          font-size: 0.78rem;
          color: #d4a017;
          font-weight: 600;
        }

        /* ---------- Support ---------- */
        .academics-support {
          padding: clamp(2.5rem, 6vw, 4rem) 0;
          background: #1e3c72;
          color: white;
        }

        .support-box {
          display: flex;
          gap: 2rem;
          align-items: center;
          max-width: 900px;
          margin: 0 auto;
        }

        .support-icon i {
          font-size: 3rem;
          color: #ffc107;
        }

        .support-content h3 {
          margin: 0 0 0.5rem;
          font-size: clamp(1.15rem, 3.6vw, 1.4rem);
        }

        .support-content p {
          opacity: 0.9;
          line-height: 1.65;
          margin: 0 0 1rem;
          font-size: clamp(0.9rem, 2.4vw, 1rem);
        }

        .support-features {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
        }

        .support-features span {
          background: rgba(255,255,255,0.15);
          padding: 0.4rem 1rem;
          border-radius: 30px;
          font-size: 0.78rem;
        }

        /* ---------- Responsive ---------- */

        /* Tablet landscape / small laptop */
        @media (max-width: 1024px) {
          .level-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          /* third card spans the full width so the grid has no orphan gap */
          .level-grid .level-card:nth-child(3) {
            grid-column: 1 / -1;
          }
        }

        /* Tablet portrait */
        @media (max-width: 900px) {
          .academics-hero,
          .stats-strip {
            --overlap: 3.5rem;
          }

          .stats-cards {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }

          .overview-grid {
            grid-template-columns: 1fr;
          }

          .overview-image {
            order: -1; /* image first, then text */
          }
        }

        /* Phones */
        @media (max-width: 768px) {
          .academics-hero,
          .stats-strip {
            --overlap: 3rem;
          }

          .stat-card {
            padding: 1.25rem 0.75rem;
          }

          .stat-card i {
            font-size: 1.6rem;
          }

          .stat-card .stat-number {
            font-size: 1.6rem;
          }

          .stat-card .stat-label {
            font-size: 0.8rem;
          }

          .academic-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .level-grid {
            grid-template-columns: 1fr;
          }

          .level-grid .level-card:nth-child(3) {
            grid-column: auto;
          }

          .level-section-header {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .level-section-heading {
            text-align: center;
          }

          .advanced-intro {
            padding: 1rem;
            text-align: left;
          }

          .support-box {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .support-features {
            justify-content: center;
          }
        }

        /* Small phones */
        @media (max-width: 400px) {
          .stats-cards {
            gap: 0.75rem;
          }

          .stat-card {
            padding: 1rem 0.5rem;
          }

          .level-section-icon {
            width: 54px;
            height: 54px;
          }

          .level-section-icon i {
            font-size: 1.35rem;
          }
        }

        /* Touch devices: no hover "jump" that sticks after a tap */
        @media (hover: none) {
          .stat-card:hover,
          .level-card:hover,
          .combination-card:hover,
          .resource-card:hover {
            transform: none;
          }
        }

        /* Respect users who prefer less motion */
        @media (prefers-reduced-motion: reduce) {
          .hero-badge,
          .academics-hero-content h1,
          .academics-hero-content p {
            animation: none;
          }

          .stat-card,
          .level-card,
          .combination-card,
          .resource-card {
            transition: none;
          }
        }
      `}</style>
    </>
  );
};

export default AcademicsPage;