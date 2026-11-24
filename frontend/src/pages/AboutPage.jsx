import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Only the images that are actually used on this page
import campusImage from '../assets/campus.png';
import studentsImage from '../assets/students.png';
import classroomImg from '../assets/classroom.png';
import libraryImg from '../assets/library.png';
import footballImg from '../assets/football.png';
import scienceLabImg from '../assets/science-lab.png';
import graduationImg from '../assets/graduation.png';

// Escape text before putting it into SweetAlert's html option
const escapeHtml = (str = '') =>
  String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const leadershipTeam = [
    {
      name: 'Musana Alex',
      title: 'Headmaster / Director',
      image: campusImage,
      education: 'Experienced in Educational Leadership',
      experience: '5+ years experience'
    },
    {
      name: 'Linah',
      title: 'Assistant Administrator',
      image: studentsImage,
      education: 'Experience in Educational and Social Affairs Management',
      experience: '5+ years experience'
    },
    {
      name: 'Kabutore Boniface',
      title: 'Director of Studies',
      image: graduationImg,
      education: 'Experience in Curriculum Development and Academic Management',
      experience: '5+ years experience'
    },
    {
      name: 'Nemeye',
      title: 'Dean of Discipline',
      image: graduationImg,
      education: 'Experience in Behaviours Management and Discipline Conduct',
      experience: '5+ years experience'
    },
    {
      name: 'Huguette',
      title: 'Dean of Discipline',
      image: graduationImg,
      education: 'Experience in Behaviours Management and Discipline Conduct',
      experience: '5+ years experience'
    },
    {
      name: 'Rebecca',
      title: 'Accountant',
      image: graduationImg,
      education: 'Experience in Accounting and Budgeting',
      experience: '5+ years experience'
    }
  ];

  const stats = [
    { number: '2006', label: 'Year Founded', icon: 'fas fa-calendar-alt' },
    { number: '800+', label: 'Current Students', icon: 'fas fa-user-graduate' },
    { number: '20+', label: 'Qualified Teachers', icon: 'fas fa-chalkboard-user' },
    { number: '85%', label: 'Pass Rate', icon: 'fas fa-chart-line' }
  ];

  const facilities = [
    { name: 'Modern Classrooms', description: 'Spacious, well-lit classrooms with smart boards for interactive learning', icon: 'fas fa-chalkboard', image: classroomImg },
    { name: 'Modern Dormitories', description: 'Comfortable boarding facilities for both boys and girls with 24/7 supervision', icon: 'fas fa-bed', image: scienceLabImg },
    { name: 'Computer Lab', description: 'State-of-the-art computers with high-speed internet and modern software', icon: 'fas fa-laptop-code', image: libraryImg },
    { name: 'Library', description: 'Well-stocked library with reference books, textbooks, and e-resources', icon: 'fas fa-book', image: libraryImg },
    { name: 'Sports Complex', description: 'Football field, basketball court, volleyball court, and athletic facilities', icon: 'fas fa-futbol', image: footballImg },
    { name: 'Main Hall', description: '500+ seat multipurpose hall for assemblies, events, and meetings', icon: 'fas fa-building', image: graduationImg }
  ];

  const handleContactClick = () => {
    Swal.fire({
      title: 'Contact Us',
      text: 'Would you like to visit our school or speak with admissions?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Call Admissions',
      cancelButtonText: 'Email Us',
      confirmButtonColor: '#1e3c72'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Call Us',
          text: 'Call +250 788 123 456 to speak with our admissions office.',
          icon: 'info',
          confirmButtonColor: '#1e3c72'
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Email Us',
          text: 'Send an email to admissions@essanyarugunga.rw',
          icon: 'info',
          confirmButtonColor: '#1e3c72'
        });
      }
    });
  };

  const handleLeadershipClick = (leader) => {
    Swal.fire({
      title: leader.name,
      html: `
        <div style="text-align: left;">
          <p><strong>Position:</strong> ${escapeHtml(leader.title)}</p>
          <p><strong>Education:</strong> ${escapeHtml(leader.education)}</p>
          <p><strong>Experience:</strong> ${escapeHtml(leader.experience)}</p>
          <hr>
          <p>${escapeHtml(leader.name)} is dedicated to providing quality education and leadership at ESSA Nyarugunga.</p>
        </div>
      `,
      icon: 'info',
      confirmButtonColor: '#1e3c72'
    });
  };

  const truncate = (text, max = 40) => (text.length > max ? `${text.substring(0, max)}...` : text);

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-badge">
            <i className="fas fa-info-circle"></i> ABOUT US
          </div>
          <h1>
            About <span className="highlight">ESSA Nyarugunga</span>
          </h1>
          <p>
            Excellence in Technology & Administrative Education — shaping future leaders since 2006.
          </p>
          <div className="hero-buttons">
            <button type="button" onClick={handleContactClick} className="btn btn-primary">
              <i className="fas fa-phone-alt"></i> Contact Admissions
            </button>
            <Link to="/admissions" className="btn btn-secondary">
              <i className="fas fa-user-graduate"></i> Apply Now
            </Link>
          </div>
        </div>
      </section>

      {/* Stats cards: overlap the bottom of the hero using one shared offset,
          so no per-breakpoint magic numbers are needed */}
      <section className="stats-strip">
        <div className="container">
          <div className="stats-cards">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <i className={stat.icon}></i>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="our-story">
        <div className="container">
          <div className="section-title">
            <h2><i className="fas fa-history"></i> Our Story</h2>
            <div className="underline"></div>
            <p className="section-subtitle">The journey of excellence since 2006</p>
          </div>
          <div className="story-grid">
            <div className="story-text">
              <p>ESSA Nyarugunga (Ecole Secondaire des Sciences et Administrative) was established in <strong>2006</strong> with a vision to provide quality secondary education in Kigali's Kicukiro District. What started as a small institution has now grown into one of the most respected secondary schools in Rwanda.</p>
              <p>Over the years, we have consistently produced outstanding graduates who have gone on to excel in top universities and various professional fields. Our commitment to <strong>academic excellence, character formation, and holistic development</strong> has made us a school of choice for parents seeking quality education for their children.</p>
              <p>Today, ESSA Nyarugunga serves over <strong>800 students</strong> with a dedicated team of <strong>30+ qualified teachers</strong>, offering programs in Software Development, Accounting, Computer Systems and Architecture, Building and Construction, Food and Beverages Operation, and Tourism & Hospitality.</p>
              <div className="story-highlights">
                <div className="highlight-item">
                  <i className="fas fa-trophy"></i>
                  <div>
                    <h4>Rank Recognition</h4>
                    <p>Ranked among top schools in Kigali for Technology education</p>
                  </div>
                </div>
                <div className="highlight-item">
                  <i className="fas fa-award"></i>
                  <div>
                    <h4>Ministry Accredited</h4>
                    <p>Fully accredited by the Ministry of Education, REB, and RTB</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="story-image">
              <img src={campusImage} alt="ESSA Nyarugunga Campus" loading="lazy" />
              <div className="experience-badge">
                <span>20+</span>
                <p>Years of Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Vision Values Section */}
      <section className="mission-vision">
        <div className="container">
          <div className="mvv-grid">
            <div className="mvv-card mission">
              <div className="mvv-icon">
                <i className="fas fa-bullseye"></i>
              </div>
              <h3>Our Mission</h3>
              <p>To provide holistic education that nurtures intellectual curiosity, moral integrity, and leadership skills, preparing students for higher education and responsible citizenship in Rwanda and beyond.</p>
            </div>
            <div className="mvv-card vision">
              <div className="mvv-icon">
                <i className="fas fa-eye"></i>
              </div>
              <h3>Our Vision</h3>
              <p>To be a center of excellence in Technology and Administrative Education, producing graduates who are innovative, ethical, and ready to contribute to national development.</p>
            </div>
            <div className="mvv-card values">
              <div className="mvv-icon">
                <i className="fas fa-heart"></i>
              </div>
              <h3>Core Values</h3>
              <ul>
                <li><i className="fas fa-check-circle"></i> Excellence - Striving for the highest standards</li>
                <li><i className="fas fa-check-circle"></i> Integrity - Upholding honesty and moral principles</li>
                <li><i className="fas fa-check-circle"></i> Community - Fostering an inclusive environment</li>
                <li><i className="fas fa-check-circle"></i> Innovation - Embracing new ideas and technologies</li>
                <li><i className="fas fa-check-circle"></i> Discipline - Building strong character and work ethic</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="facilities">
        <div className="container">
          <div className="section-title">
            <h2><i className="fas fa-building"></i> Our Facilities</h2>
            <div className="underline"></div>
            <p className="section-subtitle">State-of-the-art infrastructure for modern education</p>
          </div>
          <div className="facilities-grid">
            {facilities.map((facility, index) => (
              <div key={index} className="facility-card">
                <div className="facility-image">
                  <img src={facility.image} alt={facility.name} loading="lazy" />
                  <div className="facility-overlay">
                    <i className={facility.icon}></i>
                  </div>
                </div>
                <div className="facility-info">
                  <h4><i className={facility.icon}></i> {facility.name}</h4>
                  <p>{facility.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="leadership">
        <div className="container">
          <div className="section-title">
            <h2><i className="fas fa-users"></i> Administration Leaders</h2>
            <div className="underline"></div>
            <p className="section-subtitle">Dedicated leaders committed to excellence</p>
          </div>
          <div className="leadership-grid">
            {leadershipTeam.map((leader, index) => (
              <div
                key={index}
                className="leader-card"
                role="button"
                tabIndex={0}
                onClick={() => handleLeadershipClick(leader)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleLeadershipClick(leader);
                  }
                }}
              >
                <div className="leader-image">
                  <img src={leader.image} alt={leader.name} loading="lazy" />
                </div>
                <h4>{leader.name}</h4>
                <p className="leader-title">{leader.title}</p>
                <div className="leader-details">
                  <span><i className="fas fa-graduation-cap"></i> {truncate(leader.education)}</span>
                </div>
                <span className="read-more-btn">View Profile <i className="fas fa-arrow-right"></i></span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Student Life Section */}
      <section className="student-life-preview">
        <div className="container">
          <div className="student-life-grid">
            <div className="student-life-content">
              <div className="section-title left">
                <h2><i className="fas fa-users"></i> Student Life at ESSA</h2>
                <div className="underline left-underline"></div>
              </div>
              <p className="student-life-intro">At ESSA Nyarugunga, we believe education extends beyond the classroom. Our students enjoy a vibrant campus life with numerous opportunities for personal growth, leadership, and recreation.</p>
              <div className="activities-list">
                <div className="activity-item">
                  <i className="fas fa-microphone-alt"></i>
                  <div>
                    <h4>Clubs & Societies</h4>
                    <p>Debate, Music, Sports, Science, and more</p>
                  </div>
                </div>
                <div className="activity-item">
                  <i className="fas fa-church"></i>
                  <div>
                    <h4>Spiritual Growth</h4>
                    <p>Daily prayers, weekly services, and retreats</p>
                  </div>
                </div>
                <div className="activity-item">
                  <i className="fas fa-heart"></i>
                  <div>
                    <h4>Community Service</h4>
                    <p>Outreach programs and charitable activities</p>
                  </div>
                </div>
                <div className="activity-item">
                  <i className="fas fa-trophy"></i>
                  <div>
                    <h4>Competitions</h4>
                    <p>Academic, sports, and cultural events</p>
                  </div>
                </div>
              </div>
              <Link to="/gallery" className="btn btn-outline">View Gallery <i className="fas fa-arrow-right"></i></Link>
            </div>
            <div className="student-life-image">
              <img src={studentsImage} alt="Students at ESSA" loading="lazy" />
              <div className="floating-card">
                <i className="fas fa-smile"></i>
                <p>95% Student Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Join ESSA Nyarugunga?</h2>
            <p>Take the first step towards a bright future. Applications are now open for the 2026-2027 academic year.</p>
            <div className="cta-buttons">
              <Link to="/admissions" className="btn btn-primary"><i className="fas fa-user-graduate"></i> Apply Now</Link>
              <Link to="/contact" className="btn btn-secondary"><i className="fas fa-calendar-alt"></i> Schedule a Visit</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        /* ========== Shared container (fallback if no global .container) ========== */
        .hero .container,
        .stats-strip .container,
        .our-story .container,
        .mission-vision .container,
        .facilities .container,
        .leadership .container,
        .student-life-preview .container,
        .cta-section .container {
          width: 100%;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
          padding-left: clamp(1rem, 4vw, 2rem);
          padding-right: clamp(1rem, 4vw, 2rem);
          box-sizing: border-box;
        }

        .hero *,
        .stats-strip *,
        .our-story *,
        .mission-vision *,
        .facilities *,
        .leadership *,
        .student-life-preview *,
        .cta-section * {
          box-sizing: border-box;
        }

        /* One shared overlap value for the hero + stats strip */
        .hero,
        .stats-strip {
          --overlap: 4.5rem;
        }

        /* ========== HERO ========== */
        .hero {
          position: relative;
          background: #1e3c72;
          padding: clamp(2.5rem, 6vw, 4rem) 0 calc(var(--overlap) + 2.5rem);
        }

        .hero-content {
          text-align: center;
          color: white;
        }

        .hero-badge {
          display: inline-block;
          background: rgba(255, 193, 7, 0.15);
          color: #ffc107;
          padding: 7px 18px;
          border-radius: 30px;
          font-size: clamp(0.7rem, 2.5vw, 0.8rem);
          margin-bottom: 1rem;
          border: 1px solid rgba(255, 193, 7, 0.3);
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

        .hero-content h1 {
          font-size: clamp(1.5rem, 5.5vw, 2.5rem);
          line-height: 1.2;
          margin: 0 0 1rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.25);
          overflow-wrap: anywhere;
          animation: fadeInUp 0.7s ease 0.1s both;
        }

        .hero-content .highlight {
          color: #ffc107;
          position: relative;
          display: inline-block;
        }

        .hero-content .highlight::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, #ffc107, transparent);
          border-radius: 2px;
        }

        .hero-content p {
          font-size: clamp(0.88rem, 2.6vw, 1.05rem);
          opacity: 0.92;
          margin: 0 auto 1.75rem;
          max-width: 620px;
          line-height: 1.6;
          animation: fadeInUp 0.7s ease 0.2s both;
        }

        .hero-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          animation: fadeInUp 0.7s ease 0.3s both;
        }

        .btn-primary {
          background: #ffc107;
          color: #1e3c72;
          padding: 12px 28px;
          min-height: 44px; /* comfortable touch target */
          border-radius: 30px;
          text-decoration: none;
          font-weight: 700;
          font-family: inherit;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(255, 193, 7, 0.35);
          letter-spacing: 0.3px;
          font-size: 0.95rem;
        }

        .btn-primary:hover {
          background: #e0a800;
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(255, 193, 7, 0.45);
        }

        .btn-secondary {
          background: transparent;
          color: white;
          padding: 12px 28px;
          min-height: 44px;
          border-radius: 30px;
          text-decoration: none;
          font-weight: 700;
          font-family: inherit;
          border: 2px solid rgba(255, 255, 255, 0.6);
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          letter-spacing: 0.3px;
          font-size: 0.95rem;
        }

        .btn-secondary:hover {
          background: white;
          color: #1e3c72;
          border-color: white;
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(255, 255, 255, 0.2);
        }

        .btn-outline {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 44px;
          padding: 10px 24px;
          border: 2px solid #1e3c72;
          border-radius: 30px;
          color: #1e3c72;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.92rem;
          transition: all 0.3s ease;
        }

        .btn-outline:hover {
          background: #1e3c72;
          color: #ffffff;
        }

        /* ========== STATS STRIP ========== */
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

        /* ========== SECTION SPACING + TITLES ========== */
        .our-story {
          padding: clamp(2rem, 5vw, 3.5rem) 0 clamp(2.5rem, 6vw, 4rem);
          background: #ffffff;
        }

        .mission-vision,
        .facilities,
        .leadership,
        .student-life-preview {
          padding: clamp(2.5rem, 6vw, 4rem) 0;
        }

        .mission-vision {
          background: #f8f9fa;
        }

        .section-title {
          text-align: center;
          margin-bottom: clamp(1.75rem, 5vw, 3rem);
        }

        .section-title h2 {
          font-size: clamp(1.4rem, 4.5vw, 2rem);
          line-height: 1.25;
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

        /* ========== STORY ========== */
        .story-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(1.5rem, 4vw, 3rem);
          align-items: center;
        }

        .story-text {
          text-align: left;
          min-width: 0;
        }

        .story-text > p {
          margin: 0 0 1rem;
          line-height: 1.7;
          color: #555;
          font-size: clamp(0.92rem, 2.4vw, 1rem);
        }

        .story-highlights {
          margin-top: 1.5rem;
        }

        .highlight-item {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 12px;
        }

        .highlight-item i {
          font-size: 1.8rem;
          color: #ffc107;
          flex-shrink: 0;
        }

        .highlight-item h4 {
          margin: 0 0 0.3rem;
          color: #1e3c72;
        }

        .highlight-item p {
          font-size: 0.85rem;
          margin: 0;
          color: #555;
          line-height: 1.5;
        }

        .story-image {
          position: relative;
          min-width: 0;
        }

        .story-image img {
          display: block;
          width: 100%;
          height: auto;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .experience-badge {
          position: absolute;
          bottom: -20px;
          right: -20px;
          background: #ffc107;
          color: #1e3c72;
          padding: 1rem;
          border-radius: 50%;
          width: 100px;
          height: 100px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .experience-badge span {
          font-size: 1.8rem;
          font-weight: 700;
          line-height: 1;
        }

        .experience-badge p {
          font-size: 0.7rem;
          text-align: center;
          margin: 0;
        }

        /* ========== MISSION / VISION / VALUES ========== */
        .mvv-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .mvv-card {
          background: white;
          padding: clamp(1.25rem, 3vw, 2rem);
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 5px 20px rgba(0,0,0,0.05);
          transition: transform 0.3s;
          min-width: 0;
        }

        .mvv-card:hover {
          transform: translateY(-5px);
        }

        .mvv-icon {
          width: 70px;
          height: 70px;
          background: #1e3c72;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }

        .mvv-icon i {
          font-size: 1.8rem;
          color: #ffc107;
        }

        .mvv-card h3 {
          margin: 0 0 1rem;
          color: #1e3c72;
        }

        .mvv-card p {
          color: #666;
          line-height: 1.6;
          margin: 0;
        }

        .mvv-card ul {
          text-align: left;
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .mvv-card ul li {
          margin: 0.6rem 0;
          font-size: 0.88rem;
          line-height: 1.5;
          color: #555;
        }

        .mvv-card ul li i {
          color: #ffc107;
          margin-right: 8px;
        }

        /* ========== FACILITIES ========== */
        .facilities-grid {
          display: grid;
          /* min(100%, 280px) stops overflow on very narrow phones */
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
          gap: 1.5rem;
        }

        .facility-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 3px 10px rgba(0,0,0,0.05);
          transition: transform 0.3s;
          min-width: 0;
        }

        .facility-card:hover {
          transform: translateY(-3px);
        }

        .facility-image {
          position: relative;
          height: clamp(170px, 40vw, 200px);
          overflow: hidden;
        }

        .facility-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.3s;
        }

        .facility-card:hover .facility-image img {
          transform: scale(1.05);
        }

        .facility-overlay {
          position: absolute;
          inset: 0;
          background: rgba(30,60,114,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .facility-card:hover .facility-overlay {
          opacity: 1;
        }

        .facility-overlay i {
          font-size: 2rem;
          color: #ffc107;
        }

        .facility-info {
          padding: 1rem;
          text-align: left;
        }

        .facility-info h4 {
          margin: 0 0 0.5rem;
          color: #1e3c72;
        }

        .facility-info h4 i {
          margin-right: 8px;
          color: #ffc107;
        }

        .facility-info p {
          font-size: 0.88rem;
          color: #666;
          line-height: 1.5;
          margin: 0;
        }

        /* ========== LEADERSHIP ========== */
        .leadership-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
          gap: clamp(1.25rem, 3vw, 2rem);
        }

        .leader-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          text-align: center;
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
          box-shadow: 0 3px 10px rgba(0,0,0,0.05);
          padding-bottom: 0.5rem;
          min-width: 0;
        }

        .leader-card:hover,
        .leader-card:focus-visible {
          transform: translateY(-5px);
          box-shadow: 0 10px 26px rgba(30, 60, 114, 0.15);
          outline: none;
        }

        .leader-image {
          height: clamp(210px, 55vw, 250px);
          overflow: hidden;
        }

        .leader-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .leader-card h4 {
          margin: 1rem 0 0.3rem;
          color: #1e3c72;
          padding: 0 0.75rem;
        }

        .leader-title {
          color: #d4a017;
          font-weight: 600;
          font-size: 0.88rem;
          margin: 0 0 0.5rem;
          padding: 0 0.75rem;
        }

        .leader-details {
          padding: 0 1rem;
          font-size: 0.8rem;
          color: #666;
          line-height: 1.5;
        }

        .read-more-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin: 1rem;
          background: #f0f2f5;
          min-height: 40px;
          padding: 8px 18px;
          border-radius: 20px;
          font-size: 0.82rem;
          transition: 0.3s;
        }

        .leader-card:hover .read-more-btn,
        .leader-card:focus-visible .read-more-btn {
          background: #1e3c72;
          color: white;
        }

        /* ========== STUDENT LIFE ========== */
        .student-life-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(1.5rem, 4vw, 3rem);
          align-items: center;
        }

        .student-life-content {
          text-align: left;
          min-width: 0;
        }

        .student-life-intro {
          color: #555;
          line-height: 1.7;
          margin: 0;
          font-size: clamp(0.92rem, 2.4vw, 1rem);
        }

        .section-title.left {
          text-align: left;
          margin-bottom: 1.25rem;
        }

        .left-underline {
          margin: 10px 0 0 0;
        }

        .activities-list {
          margin: 1.5rem 0;
        }

        .activity-item {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          padding: 0.8rem;
          background: #f8f9fa;
          border-radius: 10px;
        }

        .activity-item i {
          font-size: 1.3rem;
          color: #ffc107;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .activity-item h4 {
          margin: 0 0 0.2rem;
          color: #1e3c72;
        }

        .activity-item p {
          font-size: 0.85rem;
          color: #666;
          margin: 0;
          line-height: 1.5;
        }

        .student-life-image {
          position: relative;
          min-width: 0;
        }

        .student-life-image img {
          display: block;
          width: 100%;
          height: auto;
          border-radius: 16px;
        }

        .floating-card {
          position: absolute;
          bottom: -20px;
          left: -20px;
          background: #ffc107;
          color: #1e3c72;
          padding: 1rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .floating-card i {
          font-size: 1.5rem;
        }

        .floating-card p {
          margin: 0;
          font-weight: 600;
        }

        /* ========== CTA ========== */
        .cta-section {
          background: #1e3c72;
          color: white;
          padding: clamp(2.5rem, 6vw, 4rem) 0;
          text-align: center;
        }

        .cta-content h2 {
          font-size: clamp(1.4rem, 4.5vw, 2rem);
          line-height: 1.25;
          margin: 0 0 1rem;
        }

        .cta-content p {
          margin: 0 auto 1.5rem;
          max-width: 620px;
          line-height: 1.6;
          opacity: 0.9;
          font-size: clamp(0.92rem, 2.4vw, 1rem);
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        /* ========== RESPONSIVE ========== */

        /* Tablet landscape / small laptop */
        @media (max-width: 1024px) {
          .mvv-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          /* third card spans full width so there is no empty slot */
          .mvv-grid .mvv-card:nth-child(3) {
            grid-column: 1 / -1;
          }
        }

        /* Tablet portrait */
        @media (max-width: 900px) {
          .hero,
          .stats-strip {
            --overlap: 3.5rem;
          }

          .stats-cards {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }

          .story-grid,
          .student-life-grid {
            grid-template-columns: 1fr;
          }

          .story-image {
            order: -1; /* image first, then text */
          }
        }

        /* Phones */
        @media (max-width: 768px) {
          .hero,
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

          .mvv-grid {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }

          .mvv-grid .mvv-card:nth-child(3) {
            grid-column: auto;
          }

          /* keep the decorative badges inside the screen so the page
             never scrolls sideways */
          .experience-badge {
            width: 80px;
            height: 80px;
            bottom: -12px;
            right: 8px;
            padding: 0.5rem;
          }

          .experience-badge span {
            font-size: 1.3rem;
          }

          .floating-card {
            bottom: -14px;
            left: 8px;
            padding: 0.6rem 0.9rem;
          }

          .floating-card p {
            font-size: 0.85rem;
          }

          /* room for the badges that hang below the images */
          .story-text,
          .student-life-content {
            margin-top: 0.75rem;
          }

          .hero-buttons,
          .cta-buttons {
            flex-direction: column;
            align-items: stretch;
            max-width: 320px;
            margin-left: auto;
            margin-right: auto;
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

          .btn-primary,
          .btn-secondary {
            padding: 10px 18px;
            font-size: 0.88rem;
          }
        }

        /* Touch devices: no hover "jump" that sticks after a tap */
        @media (hover: none) {
          .stat-card:hover,
          .mvv-card:hover,
          .facility-card:hover,
          .leader-card:hover,
          .btn-primary:hover,
          .btn-secondary:hover {
            transform: none;
          }

          .facility-card:hover .facility-image img {
            transform: none;
          }
        }

        /* Respect users who prefer less motion */
        @media (prefers-reduced-motion: reduce) {
          .hero-badge,
          .hero-content h1,
          .hero-content p,
          .hero-buttons {
            animation: none;
          }

          .stat-card,
          .mvv-card,
          .facility-card,
          .facility-image img,
          .leader-card,
          .btn-primary,
          .btn-secondary {
            transition: none;
          }
        }
      `}</style>
    </>
  );
};

export default AboutPage;