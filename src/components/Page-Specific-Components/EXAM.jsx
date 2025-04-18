import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const sections = [
  {
    id: "introduction",
    title: "1. Introduction to Software Engineering",
    content: (
      <div className="space-y-4 text-left">
        <p>
          <strong>Software engineering</strong> applies systematic, disciplined,
          and quantifiable approaches to software creation and maintenance.
          Unlike manufactured products, software evolves continuously, demanding
          robust processes and a quality focus.
        </p>
        <h4 className="font-semibold mt-4">1.1 Evolving Role of Software</h4>
        <ul className="list-disc pl-5">
          <li>
            <strong>From Hardware Controllers to Rich Ecosystems:</strong> Early
            software primarily drove hardware operations. Today’s software spans
            embedded devices, enterprise systems, mobile apps, and cloud
            platforms.
          </li>
          <li>
            <strong>Pervasiveness:</strong> Software underpins banking,
            healthcare, transportation, and entertainment—making reliability and
            security paramount.
          </li>
          <li>
            <strong>Shift toward Services & AI:</strong> Modern software
            integrates microservices, APIs, and machine learning, enabling
            adaptive, data-driven applications.
          </li>
        </ul>
        <h4 className="font-semibold mt-4">1.2 Software Characteristics</h4>
        <ul className="list-disc pl-5">
          <li>
            <strong>Intangibility:</strong> Code and data cannot be physically
            touched, complicating visualization and measurement.
          </li>
          <li>
            <strong>Changeability:</strong> Requirements evolve; software must
            adapt without degrading quality.
          </li>
          <li>
            <strong>Complexity:</strong> Interactions among modules, users, and
            third-party components create intricate dependencies.
          </li>
        </ul>
        <h4 className="font-semibold mt-4">
          1.3 Custom vs. Component-Based Construction
        </h4>
        <ul className="list-disc pl-5">
          <li>
            <strong>Custom (Bespoke):</strong> Tailored solutions built from
            scratch—ideal for unique requirements but higher cost.
          </li>
          <li>
            <strong>Component-Based:</strong> Assemblies of reusable libraries
            or services accelerate development and leverage proven
            functionality.
          </li>
        </ul>
        <h4 className="font-semibold mt-4">1.4 Common Software Myths</h4>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="border px-2 py-1">Myth</th>
              <th className="border px-2 py-1">Reality</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-2 py-1">
                Adding more developers to a late project accelerates it.
              </td>
              <td className="border px-2 py-1">
                More people increase communication overhead; Brook’s Law
                applies.
              </td>
            </tr>
            <tr>
              <td className="border px-2 py-1">
                Requirements can evolve freely at minimal cost.
              </td>
              <td className="border px-2 py-1">
                Late changes often ripple through design, code, and tests,
                raising costs exponentially.
              </td>
            </tr>
            <tr>
              <td className="border px-2 py-1">
                Documentation slows teams down.
              </td>
              <td className="border px-2 py-1">
                Well-structured documentation reduces ambiguity, rework, and
                onboarding effort.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: "framework",
    title: "2. The Software Process Framework",
    content: (
      <div className="space-y-4 text-left">
        <p>
          Defines the discipline to manage complexity, foster communication, and
          ensure quality.
        </p>
        <h4 className="font-semibold mt-4">2.1 Core Activities</h4>
        <ol className="list-decimal pl-5">
          <li>
            <strong>Communication:</strong> Gather requirements via interviews,
            surveys, and workshops; maintain stakeholder alignment.
          </li>
          <li>
            <strong>Planning:</strong> Define scope, schedules, resource
            allocation, risk assessments, and milestones.
          </li>
          <li>
            <strong>Modeling:</strong> Create artifacts—use case diagrams, class
            diagrams, data flow diagrams—that capture structure and behavior.
          </li>
          <li>
            <strong>Construction:</strong> Implementation through coding
            standards, pair programming, and continuous integration.
          </li>
          <li>
            <strong>Deployment:</strong> Release, monitor performance, collect
            user feedback, and provide support.
          </li>
        </ol>
        <h4 className="font-semibold mt-4">2.2 Umbrella Activities</h4>
        <ul className="list-disc pl-5">
          <li>
            <strong>Configuration Management:</strong> Version control, build
            scripts, and release management.
          </li>
          <li>
            <strong>Quality Assurance:</strong> Code reviews, static analysis,
            and test automation.
          </li>
          <li>
            <strong>Risk Management:</strong> Identify, analyze, and mitigate
            technical and project risks.
          </li>
          <li>
            <strong>Measurement & Metrics:</strong> Track defect density,
            velocity, test coverage, and customer satisfaction.
          </li>
          <li>
            <strong>Documentation:</strong> Maintain SRS, design docs, user
            manuals, and archive decisions.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "models",
    title: "3. Core Software Process Models",
    content: (
      <div className="space-y-4 text-left">
        <h4 className="font-semibold">3.1 Waterfall Model</h4>
        <p>
          <strong>Phases:</strong> Requirements → Design → Implementation →
          Testing → Deployment → Maintenance
        </p>
        <p>
          <strong>When to Use:</strong> Stable requirements, regulatory
          constraints.
        </p>
        <p>
          <strong>Pros:</strong> Structured, easy to manage milestones.
        </p>
        <p>
          <strong>Cons:</strong> Late feedback, expensive to change.
        </p>
        <h4 className="font-semibold mt-4">3.2 Incremental & RAD Models</h4>
        <ul className="list-disc pl-5">
          <li>
            <strong>Incremental:</strong> Delivers core functionality first;
            successive increments add features.
          </li>
          <li>
            <strong>RAD:</strong> Emphasizes rapid prototyping and reuse, with
            tight time frames per module (less then3 months).
          </li>
        </ul>
        <p>
          <strong>Pros:</strong> Early value delivery, reduced risk.
        </p>
        <p>
          <strong>Cons:</strong> Requires modularization and committed
          stakeholders.
        </p>
        <h4 className="font-semibold mt-4">3.3 Prototyping & Spiral Models</h4>
        <ul className="list-disc pl-5">
          <li>
            <strong>Prototyping:</strong> Build throwaway or evolutionary
            prototypes to clarify requirements.
          </li>
          <li>
            <strong>Spiral:</strong> Iterative cycles include risk analysis,
            prototype, planning, and evaluation.
          </li>
        </ul>
        <p>
          <strong>Pros:</strong> Risk-driven, iterative refinement.
        </p>
        <p>
          <strong>Cons:</strong> Can be costly without strong risk control.
        </p>
        <h4 className="font-semibold mt-4">3.4 Concurrent Development Model</h4>
        <p>
          <strong>Concept:</strong> Activities (analysis, design, coding,
          testing) proceed in parallel, transitioning through states.
        </p>
        <p>
          <strong>Pros:</strong> Reflects real-world multi-team efforts.
        </p>
        <p>
          <strong>Cons:</strong> Complex event-driven management.
        </p>
      </div>
    ),
  },
  {
    id: "agile",
    title: "4. Agile Methodologies",
    content: (
      <div className="space-y-4 text-left">
        <p>
          An adaptive mindset prioritizing individuals, collaboration, and
          customer value.
        </p>
        <h4 className="font-semibold mt-4">4.1 Agile Manifesto & Principles</h4>
        <ul className="list-disc pl-5">
          <li>
            <strong>Individuals & Interactions</strong> over processes and
            tools.
          </li>
          <li>
            <strong>Working Software</strong> over comprehensive documentation.
          </li>
          <li>
            <strong>Customer Collaboration</strong> over contract negotiation.
          </li>
          <li>
            <strong>Responding to Change</strong> over following a plan.
          </li>
        </ul>
        <h4 className="font-semibold mt-4">4.2 Agile Lifecycle</h4>
        <ol className="list-decimal pl-5">
          <li>
            Backlog Creation & Grooming: Capture user stories, assign
            priorities.
          </li>
          <li>
            Iteration Planning: Estimate (story points), commit to a sprint.
          </li>
          <li>Daily Stand-ups: Time-boxed syncs to surface impediments.</li>
          <li>
            Continuous Delivery & Integration: Automated pipelines deploy
            increments frequently.
          </li>
          <li>
            Review & Retrospective: Demonstrate working software; reflect on
            process improvements.
          </li>
        </ol>
        <h4 className="font-semibold mt-4">4.3 Scaling Agile</h4>
        <ul className="list-disc pl-5">
          <li>LeSS (Large-Scale Scrum)</li>
          <li>SAFe</li>
          <li>Spotify Model</li>
        </ul>
      </div>
    ),
  },
  {
    id: "xpScrum",
    title: "5. Extreme Programming (XP) & Scrum",
    content: (
      <div className="space-y-4 text-left">
        <h4 className="font-semibold">5.1 Extreme Programming (XP)</h4>
        <p>
          <strong>Core Values:</strong> Communication, Simplicity, Feedback,
          Courage, Respect.
        </p>
        <ul className="list-disc pl-5">
          <li>Pair Programming: Shared code ownership and real-time review.</li>
          <li>TDD: Tests first; code second.</li>
          <li>Continuous Integration & Refactoring: Keep codebase healthy.</li>
          <li>Small Releases: Weekly or bi-weekly production deployments.</li>
        </ul>
        <h4 className="font-semibold mt-4">5.2 Scrum</h4>
        <p>
          <strong>Roles:</strong> Product Owner, Scrum Master, Development Team.
        </p>
        <ul className="list-disc pl-5">
          <li>Product Backlog: Ordered feature list.</li>
          <li>Sprint Backlog: Team’s commitment for a sprint.</li>
          <li>Increment: Shippable product at sprint end.</li>
        </ul>
        <p className="mt-2">
          <strong>Events:</strong> Sprint Planning, Daily Scrum, Sprint Review,
          Sprint Retrospective.
        </p>
        <p>
          <strong>Metrics:</strong> Velocity, burndown charts, cumulative flow
          diagrams.
        </p>
      </div>
    ),
  },
  {
    id: "requirements",
    title: "6. Requirements Engineering",
    content: (
      <div className="space-y-4 text-left">
        <p>
          Ensures the final product aligns with stakeholder needs through
          systematic capture, analysis, and management.
        </p>
        <h4 className="font-semibold mt-4">6.1 Activities</h4>
        <ol className="list-decimal pl-5">
          <li>
            Inception: Establish project scope, constraints, and stakeholder
            roles.
          </li>
          <li>
            Elicitation: Techniques include interviews, focus groups, surveys,
            observation, and workshops.
          </li>
          <li>
            Analysis & Modeling: Document use cases, user stories, data models
            (ER diagrams), and state diagrams.
          </li>
          <li>
            Negotiation & Prioritization: Resolve conflicts; MoSCoW helps set
            scope.
          </li>
          <li>
            Specification: Produce clear SRS with functional and non-functional
            requirements, acceptance criteria, and traceability.
          </li>
          <li>
            Validation: Reviews, inspections, and prototyping validate
            correctness and completeness.
          </li>
          <li>
            Management: Use traceability matrices, change control boards, and
            versioned requirement baselines.
          </li>
        </ol>
        <h4 className="font-semibold mt-4">6.2 Requirement Types</h4>
        <ul className="list-disc pl-5">
          <li>
            <strong>Functional:</strong> Describe behaviors, e.g., "The system
            shall send confirmation emails."
          </li>
          <li>
            <strong>Non-Functional:</strong> Quality attributes—performance,
            security, usability, reliability.
          </li>
        </ul>
        <h4 className="font-semibold mt-4">6.3 Best Practices</h4>
        <ul className="list-disc pl-5">
          <li>Maintain a glossary for domain terms.</li>
          <li>Use atomic requirements (one idea per statement).</li>
          <li>Ensure testability: each requirement must map to a test case.</li>
          <li>
            Trace requirements end-to-end: from inception through maintenance.
          </li>
        </ul>
      </div>
    ),
  },
];

export default function SoftwareEngineeringOnePager() {
  const [index, setIndex] = useState(0);
  const total = sections.length;
  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-white p-8">
      <AnimatePresence exitBeforeEnter>
        <motion.div
          key={sections[index].id}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 overflow-y-auto p-6 max-w-4xl mx-auto"
        >
          <h1 className="text-3xl font-bold mb-4">{sections[index].title}</h1>
          {sections[index].content}
        </motion.div>
      </AnimatePresence>
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-gray-100 rounded-full hover:bg-gray-200"
      >
        <ChevronLeft />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-gray-100 rounded-full hover:bg-gray-200"
      >
        <ChevronRight />
      </button>
    </div>
  );
}
