import React, { useEffect, useState } from 'react';
import Hero from './components/Hero';
import Flipbook from './components/Flipbook';
import FlyingButton from './components/FlyingButton';
import GlassFolder from './components/glass-folder-cards';
import GhostFibers from './components/GhostFibers';
import { useRegistrationAccess } from './hooks/useRegistrationAccess';
import './styles/theme.css';
import './components/FlyingButton.css';

// Event custom marble art recipe in theme colours
const EVENT_ART = {
  style: 'marble',
  colors: ['#070517', '#1d1250', '#5b3df0', '#2fd6e8', '#3ee8b5', '#8b5cf6', '#eef0ff'],
  scale: 0.7,
  warp: 3.2,
  angle: -0.5,
  gloss: 0.5,
  veins: 0.5
};

// Placeholder URLs & variables to flag, not invent
const REG_URL = 'https://forms.gle/REPLACE-WITH-YOUR-FORM-ID';

export default function App() {
  const { isRegistered, register, reset } = useRegistrationAccess();
  const [ambientActive, setAmbientActive] = useState(true);

  // Reveal on scroll observer for .rv elements
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll('.rv').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [isRegistered]);

  return (
    <>
      {/* Ambient background with GhostFibers in theme tokens */}
      <div className="ambient-bg" aria-hidden="true">
        <GhostFibers
          glowColor="#8b5cf6"
          secondaryColor="#2fd6e8"
          lineColor="#eef0ff"
          gradient="depth"
          layers={3}
          twist={1.2}
          threads={64}
          volume={0.65}
          fiberStyle="dots"
          depthOfField={0.85}
          hoverEffect="focus"
          mouseInteraction={true}
          speed={0.4}
          flow={0.35}
          vignette={0.4}
          grain={0.05}
        />
      </div>

      {/* Sticky Navigation */}
      <nav className="top">
        <a className="logo" href="#top">
          <svg className="i" viewBox="0 0 24 24">
            <path d="m8 7-5 5 5 5M16 7l5 5-5 5" />
          </svg>
          Coders Club
        </a>
        <div className="links">
          <a href="#brochure">Brochure</a>
          <a href="#details">Details</a>
          <a href="#venue">Venue</a>
          <a href="#resources">Resources</a>
          <a className="reg" href="#register">Register</a>
        </div>
      </nav>

      {/* Hero Section */}
      <Hero />

      {/* Brochure Section */}
      <section id="brochure">
        <div className="wrap">
          <p className="eyebrow rv">The 3-day score</p>
          <h2 className="rv">Event brochure</h2>
          <p className="sub rv">
            Turn the pages to see how the three days fit together. Pinch, double-tap or press + to zoom in and read clearly.
          </p>
          <div className="rv">
            <Flipbook />
          </div>
        </div>
      </section>

      {/* Event Details Section */}
      <section id="details">
        <div className="wrap">
          <p className="eyebrow rv">Event details</p>
          <h2 className="rv">Three days, three movements.</h2>
          <p className="sub rv">
            Each day builds on the one before, from learning the tools, to understanding agents, to conducting one of your own.
          </p>

          <div className="cards">
            <article className="card rv">
              <div className="n">I</div>
              <i>Day 1 · Learn + Create</i>
              <h3>From Prompt to Portfolio</h3>
              <p>An AI tools overview, a UI recreation challenge and a personal portfolio site, built by prompting AI.</p>
              <span className="t">First half-day, about 3 hours (proposed)</span>
            </article>

            <article className="card rv">
              <div className="n">II</div>
              <i>Day 2 · Understand + Connect</i>
              <h3>From Chatbot to Agent</h3>
              <p>How chatbots differ from agents, a live workflow demonstration on a visual tool such as n8n, and a mini experiment.</p>
              <span className="t">About 2 hours (proposed)</span>
            </article>

            <article className="card rv">
              <div className="n">III</div>
              <i>Day 3 · Build + Present</i>
              <h3>Conduct Your Own AI Agent</h3>
              <p>A full-day hackathon: pick a problem, form teams, build a prototype with an interface and an agentic workflow, then present it live.</p>
              <span className="t">Full day (proposed)</span>
            </article>
          </div>

          <div className="facts rv">
            <div>
              <b>Who it is for</b>
              <span>Students</span>
            </div>
            <div>
              <b>When</b>
              <span>Dates are fixed once the club approves the plan.</span>
            </div>
            <div>
              <b>Flexible</b>
              <span>The days can run separately if a continuous 3-day event is not possible.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Venue Section */}
      <section id="venue">
        <div className="wrap">
          <div className="venue rv">
            <svg className="i" viewBox="0 0 24 24">
              <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <div>
              <h3>Venue</h3>
              <p>Labs and venues are allocated by the Organizing team, with permission from the principal.</p>
              <span className="ph">Venue and room: to be announced</span>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section id="register">
        <div className="wrap">
          <div className="regbox rv">
            <p className="eyebrow" style={{ justifyContent: 'center' }}>Join the orchestra</p>
            <h2>Register for AI Agent Orchestra</h2>
            <p className="sub">Registration is a Google Form, shared through QR codes and links on the posters.</p>

            {/* React Bits FlyingButton */}
            <div data-slot="flying-button">
              <div style={{ position: 'relative', height: 440, width: '100%', maxWidth: 640, margin: '0 auto' }}>
                <FlyingButton
                  theme="dark"
                  size="large"
                  altitude={170}
                  hoverTime={2.4}
                  jets={2}
                  thrusters
                  trigger="hover"
                  carryCursor
                  smoke={1}
                  turbulence={1}
                  wobble={1}
                  thrustColor="#2fd6e8"
                  smokeColor="#cfc9ff"
                  buttonColor="#5b3df0"
                  textColor="#ffffff"
                  onClick={() => {
                    register();
                    window.open(REG_URL, '_blank', 'noopener');
                  }}
                >
                  Register now
                </FlyingButton>
              </div>
              <a
                id="reg"
                href={REG_URL}
                style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}
                tabIndex={0}
                onClick={() => register()}
              >
                Register now
              </a>
            </div>

            <small>Placeholder link. The registration form is not ready yet.</small>
          </div>
        </div>
      </section>

      {/* Resources Section with Access Gating & GlassFolder Cards */}
      <section id="resources">
        <div className="wrap">
          <p className="eyebrow rv">After you register</p>
          <h2 className="rv">Your 3-day resources.</h2>
          <p className="sub rv">Registered students get access to the resources for all three days.</p>

          {/* Registration Access Gating Feedback Banner */}
          <div className="resource-status-bar rv">
            <div className={`resource-status-badge ${isRegistered ? '' : 'locked'}`}>
              <svg className="i" style={{ width: 16, height: 16 }} viewBox="0 0 24 24">
                {isRegistered ? (
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4" />
                ) : (
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                )}
              </svg>
              <span>
                {isRegistered
                  ? 'Registration detected: All workshop files, handbooks and hackathon briefs are unlocked.'
                  : 'Register above to unlock the official student materials, or browse the previews below.'}
              </span>
            </div>

            <button
              type="button"
              className="btn"
              style={{ fontSize: '13px', padding: '6px 14px' }}
              onClick={isRegistered ? reset : register}
            >
              {isRegistered ? 'Simulate Unregistered' : 'Quick Unlock (Simulate Registration)'}
            </button>
          </div>

          {/* Three GlassFolder cards */}
          <div className="folders-grid" data-slot="glass-folders">
            {/* Folder 1: Day 1 */}
            <div className="rv">
              <GlassFolder
                label="Day 1 · Prompt to Portfolio"
                tone="dark"
                action="none"
                width={330}
                art={EVENT_ART}
                seed={1}
                appearDelay={0}
                files={[
                  {
                    name: 'Day 1 handbook (HTML)',
                    meta: 'Handbook · 31 KB',
                    href: '/modules/Day-1-UI-and-Web-Dev-Handbook.html',
                    art: EVENT_ART
                  },
                  {
                    name: 'UI Recreation Challenge',
                    meta: 'Interactive · Spec',
                    href: '/modules/Day-1-UI-and-Web-Dev-Handbook.html'
                  },
                  {
                    name: 'Portfolio Template',
                    meta: 'HTML/CSS Kit',
                    href: '/modules/Day-1-UI-and-Web-Dev-Handbook.html'
                  }
                ]}
              />
            </div>

            {/* Folder 2: Day 2 */}
            <div className="rv">
              <GlassFolder
                label="Day 2 · Chatbot to Agent"
                tone="dark"
                action="none"
                width={330}
                art={EVENT_ART}
                seed={42}
                appearDelay={140}
                files={[
                  {
                    name: 'Day 2 module (HTML)',
                    meta: 'Module 1 · 137 KB',
                    href: '/modules/Module-1-Introduction-to-AI-Agents.html',
                    art: EVENT_ART
                  },
                  {
                    name: 'Agent Abstraction',
                    meta: 'Module 2 · 104 KB',
                    href: '/modules/Module-2-Agent-Abstraction.html'
                  },
                  {
                    name: 'How Agents Work',
                    meta: 'Module 3 · 135 KB',
                    href: '/modules/Module-3-How-Agents-Work.html'
                  },
                  {
                    name: 'Agents in Action',
                    meta: 'Module 4 · 114 KB',
                    href: '/modules/Module-4-Agents-in-Action.html'
                  }
                ]}
              />
            </div>

            {/* Folder 3: Day 3 */}
            <div className="rv">
              <GlassFolder
                label="Day 3 · Conduct Your Agent"
                tone="dark"
                action="none"
                width={330}
                art={EVENT_ART}
                seed={99}
                appearDelay={280}
                files={[
                  {
                    name: 'Hackathon brief (HTML)',
                    meta: 'Brief · Document',
                    href: '/modules/hackathon-brief.html',
                    art: EVENT_ART
                  },
                  {
                    name: 'Course Wrap-up',
                    meta: 'Module 5 · 109 KB',
                    href: '/modules/Module-5-Course-Wrap-up.html'
                  },
                  {
                    name: 'Team Submission Rubric',
                    meta: 'Evaluation PDF',
                    href: '/modules/hackathon-brief.html'
                  }
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="wrap">Coders Club · AI Agent Orchestra</div>
      </footer>
    </>
  );
}
