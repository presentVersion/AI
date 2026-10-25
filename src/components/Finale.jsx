import React from 'react';
import Flipbook from './Flipbook';
import FlyingButton from './FlyingButton';
import GlassFolder from './glass-folder-cards';
import Dialog from './Dialog';
import { useRegistrationAccess } from '../hooks/useRegistrationAccess';
import { useSound } from '../hooks/useSound';

const EVENT_ART = {
  style: 'marble',
  colors: ['#070517', '#1d1250', '#5b3df0', '#2fd6e8', '#3ee8b5', '#8b5cf6', '#eef0ff'],
  scale: 0.7,
  warp: 3.2,
  angle: -0.5,
  gloss: 0.5,
  veins: 0.5
};

const REG_URL = 'https://forms.gle/REPLACE-WITH-YOUR-FORM-ID';

export default function Finale() {
  const { isRegistered, register, reset } = useRegistrationAccess();
  const [flightState, setFlightState] = React.useState(isRegistered ? 'availed' : 'idle');
  const { playUiConfirm } = useSound();

  React.useEffect(() => {
    if (isRegistered && flightState === 'idle') {
      setFlightState('availed');
    }
  }, [isRegistered]);

  return (
    <div id="finale">
      {/* Brochure Section */}
      <section id="brochure">
        <div className="wrap">
          <p className="eyebrow rv">The 3-day score</p>
          <h2 className="rv">Participant guide & event score</h2>
          <p className="sub rv">
            Watch the score take flight in 3D with flowing orchestra pages, then take your seat to explore the complete 10-page participant guide.
          </p>

          <div style={{ margin: '30px 0 20px' }}>
            <Dialog
              speaker="The Conductor"
              text="Take your seat."
              displayedText="Take your seat."
            />
          </div>

          <div className="rv">
            <Flipbook />
          </div>
        </div>
      </section>

      {/* Event Details Facts */}
      <section id="details">
        <div className="wrap">
          <p className="eyebrow rv">Event details</p>
          <h2 className="rv">Three days, three movements.</h2>
          <p className="sub rv">
            Each day builds on the one before, from learning the tools, to understanding agents, to conducting one of your own.
          </p>

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
                  onLaunch={() => {
                    playUiConfirm();
                    setFlightState('flying');
                  }}
                  onFlightComplete={() => {
                    playUiConfirm();
                    setFlightState('availed');
                    register();
                    try {
                      window.open(REG_URL, '_blank', 'noopener,noreferrer');
                    } catch (e) {
                      console.warn('Popup blocked:', e);
                    }
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
                onClick={() => {
                  playUiConfirm();
                  register();
                  setFlightState('availed');
                }}
              >
                Register now
              </a>
            </div>

            {flightState === 'flying' && (
              <div className="flight-status-indicator flying" role="status" aria-live="polite">
                <span className="flight-pulse" />
                <span>Flight sequence in progress — registration form avails upon touchdown...</span>
              </div>
            )}

            {flightState === 'availed' && (
              <div className="registration-availed-card" role="region" aria-label="Registration Form Availed">
                <div className="reg-success-header">
                  <span className="reg-badge">
                    <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Registration Form Availed
                  </span>
                  <span className="reg-time">Day 1 · Day 2 · Day 3 Access</span>
                </div>
                <h3>AI Agent Orchestra Registration</h3>
                <p>Your flight has landed and registration access has been unlocked. Complete the form to secure your seat.</p>
                <a
                  href={REG_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn pri big reg-direct-btn"
                  onClick={() => {
                    playUiConfirm();
                    register();
                  }}
                >
                  Open Google Registration Form
                  <svg className="i" style={{ width: 18, height: 18, marginLeft: 8 }} viewBox="0 0 24 24">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                  </svg>
                </a>
              </div>
            )}

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
              onClick={() => {
                playUiConfirm();
                if (isRegistered) {
                  reset();
                  setFlightState('idle');
                } else {
                  register();
                  setFlightState('availed');
                }
              }}
            >
              {isRegistered ? 'Simulate Unregistered' : 'Quick Unlock (Simulate Registration)'}
            </button>
          </div>

          <div className="folders-grid" data-slot="glass-folders">
            <div className="rv">
              <GlassFolder
                label="Day 1 · Prompt to Portfolio"
                tone="dark"
                action="none"
                width={330}
                art={EVENT_ART}
                seed={1}
                appearDelay={0}
                onOpenChange={() => playUiConfirm()}
                onFileSelect={() => playUiConfirm()}
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

            <div className="rv">
              <GlassFolder
                label="Day 2 · Chatbot to Agent"
                tone="dark"
                action="none"
                width={330}
                art={EVENT_ART}
                seed={42}
                appearDelay={140}
                onOpenChange={() => playUiConfirm()}
                onFileSelect={() => playUiConfirm()}
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

            <div className="rv">
              <GlassFolder
                label="Day 3 · Conduct Your Agent"
                tone="dark"
                action="none"
                width={330}
                art={EVENT_ART}
                seed={99}
                appearDelay={280}
                onOpenChange={() => playUiConfirm()}
                onFileSelect={() => playUiConfirm()}
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

      <footer>
        <div className="wrap">Coders Club · AI Agent Orchestra</div>
      </footer>
    </div>
  );
}
