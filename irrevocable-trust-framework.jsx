import { useState } from "react";

// ---------------------------------------------------------------
// Irrevocable Trust Decision Framework
// A guided, invert-first flow: purpose → vehicle → cost test →
// trustee → situs → tax status → recommended structure.
// Purposes include income tax savings via §1202 QSBS stacking —
// later steps adapt when that purpose is selected.
// Signature element: "The Ledger" — every choice is recorded as a
// drafting entry, like a trust instrument being assembled.
// ---------------------------------------------------------------

const INK = "#1C2430";
const PAPER = "#F7F6F2";
const OXBLOOD = "#7A2E2E";
const SAGE = "#5C6B5E";
const LINE = "#D9D5CC";

const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
  .itf-display { font-family: 'Fraunces', Georgia, serif; }
  .itf-body { font-family: 'IBM Plex Sans', -apple-system, sans-serif; }
  .itf-mono { font-family: 'IBM Plex Mono', monospace; }
  .itf-fade { animation: itfFade .35s ease both; }
  @keyframes itfFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  @media (prefers-reduced-motion: reduce) { .itf-fade { animation: none; } }
`;

// ----------------------- decision content -----------------------
// Options may carry a `qsbs` override object ({ detail, ledger, tag,
// warn }) applied when the QSBS-stacking purpose is selected, and a
// `stop` payload that ends the flow with a verdict screen.

const PURPOSES = [
  {
    id: "estate",
    label: "Remove assets from the taxable estate",
    ledger: "Purpose: estate tax reduction (freeze & remove)",
    note: "Gifting appreciation out of the estate. Completed-gift design.",
  },
  {
    id: "income",
    label: "Cut income tax on a company exit (QSBS stacking)",
    ledger: "Purpose: income tax savings — §1202 QSBS stacking",
    note: "Each non-grantor trust gets its own §1202 exclusion — roughly $2.4M of federal tax per full $10M cap. Gift early; never after a deal is on the table.",
  },
  {
    id: "protection",
    label: "Shield assets from creditors / lawsuits",
    ledger: "Purpose: asset protection",
    note: "Spendthrift + discretionary design. Situs matters enormously.",
  },
  {
    id: "control",
    label: "Control distributions across generations",
    ledger: "Purpose: multigenerational control (dynasty)",
    note: "Spendthrift, long-duration, discretionary pot trust.",
  },
  {
    id: "special",
    label: "Preserve public benefits (special needs)",
    ledger: "Purpose: special needs / benefits preservation",
    note: "Third-party SNT. Never distribute outright.",
  },
  {
    id: "charity",
    label: "Charitable intent + tax strategy",
    ledger: "Purpose: charitable split-interest",
    note: "CRT or CLT depending on who takes income first.",
  },
  {
    id: "none",
    label: "None of these, honestly",
    ledger: "Purpose: unclear — irrevocability not justified",
    note: null,
    stop: {
      title: "You don't need an irrevocable trust.",
      body: "If none of the six purposes applies, irrevocability buys nothing and costs flexibility forever. A revocable living trust, umbrella insurance, and an LLC wrapper likely cover the actual need — at a fraction of the lifetime cost.",
    },
  },
];

const VEHICLES = {
  estate: [
    {
      id: "slat",
      label: "Married; want indirect access via spouse",
      ledger: "Vehicle: SLAT (spousal lifetime access trust)",
      detail:
        "Gift to a trust for your spouse — assets leave the estate but the household keeps indirect access. Watch the reciprocal trust doctrine if both spouses create one.",
    },
    {
      id: "idgt",
      label: "Rapidly appreciating business or asset to freeze",
      ledger: "Vehicle: IDGT sale / GRAT (estate freeze)",
      detail:
        "Sell or gift the appreciating asset to a grantor trust; future growth accrues outside the estate. GRATs suit volatile assets with near-zero gift-tax cost.",
    },
    {
      id: "ilit",
      label: "Large life insurance policy",
      ledger: "Vehicle: ILIT (life insurance trust)",
      detail:
        "Keeps the death benefit out of the taxable estate. Cheap to run relative to benefit — one of the few small trusts that earns its keep.",
    },
    {
      id: "gift",
      label: "General gifting to descendants",
      ledger: "Vehicle: dynasty gift trust (single pot)",
      detail:
        "One broadly drafted pot trust for all descendants. Resist the urge to create one trust per child per purpose.",
    },
  ],
  income: [
    {
      id: "stack",
      label: "Founder / early employee; expected gain well beyond my own cap",
      ledger: "Vehicle: parallel non-grantor gift trusts — one cap-sized slice each",
      detail:
        "Gift QSBS into separate non-grantor trusts — each is its own taxpayer with its own §1202 exclusion (greater of $10M, or $15M for stock acquired after 7/4/2025, or 10× basis). Your holding period tacks to the trust. Vary beneficiaries and terms so §643(f) can't collapse the trusts into one.",
    },
    {
      id: "slant",
      label: "Married; want household access while the shares stack",
      ledger: "Vehicle: SLANT — spousal access, kept non-grantor by adverse-party consent",
      detail:
        "A SLAT drafted to stay non-grantor: the spouse is a beneficiary, but distributions to the spouse require an adverse party's consent. The household keeps a path to the money; the trust keeps its own §1202 cap.",
    },
    {
      id: "notqsbs",
      label: "The sale is already lined up — or the stock may not be QSBS at all",
      ledger: "Vehicle: none — stacking window closed / stock not QSBS",
      detail:
        "Gifts made once a deal is practically certain invite an assignment-of-income attack, and non-QSBS stock has nothing to stack. Verify §1202 status first: original-issue C-corp stock, gross-asset test met at issuance, active qualified business.",
      stop: {
        title: "The stacking window is closed.",
        body: "Once a sale is practically certain, gifting shares invites an assignment-of-income challenge — the gain is already yours. And stock that never qualified under §1202 has nothing to stack. If the deal is truly done, look at charitable remainder trusts, charitable gifts of stock, or simply paying the tax cleanly. A structure bolted on after the fact is an audit exhibit, not a plan.",
      },
    },
  ],
  protection: [
    {
      id: "dapt",
      label: "Protecting my own assets (self-settled)",
      ledger: "Vehicle: DAPT — NV/SD situs (caution for CA residents)",
      detail:
        "Self-settled asset protection trusts are respected in NV/SD but California courts are hostile to them for CA residents. Treat as a speed bump, not a wall — and layer with LLCs and insurance.",
    },
    {
      id: "thirdparty",
      label: "Protecting an inheritance for beneficiaries",
      ledger: "Vehicle: third-party fully discretionary trust",
      detail:
        "The gold standard. A fully discretionary third-party trust with spendthrift clause is nearly creditor-proof for beneficiaries.",
    },
  ],
  control: [
    {
      id: "dynasty",
      label: "Continue",
      ledger: "Vehicle: discretionary dynasty pot trust",
      detail:
        "One pot, trustee judgment, long duration. Rules written for humans you haven't met yet should be principles, not schedules.",
    },
  ],
  special: [
    {
      id: "snt",
      label: "Continue",
      ledger: "Vehicle: third-party special needs trust",
      detail:
        "Preserves SSI/Medicaid eligibility. Third-party SNT (no payback clause) strongly preferred over first-party where possible.",
    },
  ],
  charity: [
    {
      id: "crt",
      label: "Family takes income now, charity gets remainder",
      ledger: "Vehicle: CRT (charitable remainder trust)",
      detail:
        "Sell appreciated assets inside, defer gain, take an income stream, deduct the remainder value.",
    },
    {
      id: "clt",
      label: "Charity takes income now, family gets remainder",
      ledger: "Vehicle: CLT (charitable lead trust)",
      detail:
        "Front-loads charitable payments; remainder passes to family at a discounted transfer-tax value.",
    },
  ],
};

const SIZES = [
  { id: "s1", label: "Under $500k", tag: "≈ 1–2%+ annual cost drag", warn: true,
    ledger: "Funding: <$500k — FAILS the cost test",
    qsbs: { ledger: "Funding: <$500k expected at exit — your own §1202 cap covers this; stacking adds nothing",
      tag: "your personal cap already covers this", warn: true } },
  { id: "s2", label: "$500k – $2M", tag: "≈ 0.3–1% annual cost drag", warn: false,
    ledger: "Funding: $500k–$2M — marginal; consolidate, don't fragment",
    qsbs: { ledger: "Funding: $500k–$2M expected — one overflow trust at most; don't fragment",
      tag: "≈ 24¢ federal saved per $1 above your cap", warn: false } },
  { id: "s3", label: "$2M – $10M", tag: "≈ 0.1–0.4% annual cost drag", warn: false,
    ledger: "Funding: $2M–$10M — passes the cost test",
    qsbs: { ledger: "Funding: $2M–$10M expected — fits within a single trust's cap",
      tag: "the stacking sweet spot", warn: false } },
  { id: "s4", label: "Over $10M", tag: "Admin cost immaterial", warn: false,
    ledger: "Funding: $10M+ — passes; complexity now buys real value",
    qsbs: { ledger: "Funding: $10M+ expected — split into cap-sized slices across differing trusts",
      tag: "one trust per cap slice — mind §643(f)", warn: false } },
];

const TRUSTEES = [
  {
    id: "family",
    label: "Family member as trustee",
    ledger: "Trustee: family member — HEMS standard required",
    detail:
      "Cheap and trusted, but distributions must be limited to an ascertainable standard (HEMS) to avoid estate inclusion and creditor exposure. Less flexibility, near-zero fee.",
    qsbs: {
      ledger: "Trustee: family — §674 grantor-trust risk; keep family out of distribution decisions",
      detail:
        "Here this is a trap: distribution powers held by related or subordinate parties can trigger grantor-trust status under §674 — one trigger and the trust's gain lands back on your return, inside your single §1202 cap. Family may hold administrative roles only.",
      tag: "grantor-trust risk",
      warn: true,
    },
  },
  {
    id: "independent",
    label: "Independent professional trustee",
    ledger: "Trustee: independent professional — full discretion available",
    detail:
      "Enables fully discretionary distributions (best protection & flexibility). Costs real money every year — this is the recurring employee you're hiring.",
    qsbs: {
      ledger: "Trustee: independent professional — §674(c) preserves non-grantor status",
      detail:
        "Effectively required. Distribution discretion held by an independent trustee (§674(c): no more than half related or subordinate) keeps the trust non-grantor and the stack intact. The fee is the price of the exclusion.",
      tag: "keeps the stack intact",
      warn: false,
    },
  },
  {
    id: "hybrid",
    label: "Split roles (family + independent distribution trustee)",
    ledger: "Trustee: bifurcated — family admin, independent for discretion",
    detail:
      "Family handles administration cheaply; an independent distribution trustee holds the discretionary powers. Often the best cost/flexibility trade.",
    qsbs: {
      ledger: "Trustee: bifurcated — family admin only; independent trustee holds all distribution powers",
      detail:
        "Workable if the line stays bright: family administers, but every distribution decision sits with the independent trustee. Blur that line and §674 blurs the stack.",
      tag: "discretion must be independent",
      warn: false,
    },
  },
];

const SITUS = [
  {
    id: "ca",
    label: "Keep it in California",
    ledger: "Situs: California — middling decanting, CA tax on trust income",
    detail:
      "Simple, local. But CA taxes non-grantor trust income and ranks mid-pack on decanting flexibility.",
    qsbs: {
      ledger: "Situs: California — no §1202 conformity; state taxes the gain in full",
      detail:
        "California never conformed to §1202 — it taxes the full gain at up to 13.3% even when the federal tax is zero. A California-situs trust volunteers for the state's share.",
      tag: "up to 13.3% state tax stays",
      warn: true,
    },
  },
  {
    id: "nvsd",
    label: "Nevada / South Dakota situs",
    ledger: "Situs: NV/SD — top decanting statutes, no state income tax, dynasty-friendly",
    detail:
      "You don't need to live there. Best-ranked decanting laws, no state income tax on trust income, and centuries-long duration. Requires an in-state trustee.",
    qsbs: {
      ledger: "Situs: NV/SD — no state tax on the gain; keep California fiduciaries out",
      detail:
        "No state income tax — and kept clear of California fiduciaries, no CA reach into the trust's retained gain. The federal exclusion stays whole and the state layer can disappear. Mind CA throwback if accumulated income is later distributed to CA-resident beneficiaries.",
      tag: "state tax ≈ 0 if kept clean",
      warn: false,
    },
  },
];

const TAXSTATUS = [
  {
    id: "grantor",
    label: "Grantor trust (I pay the trust's income tax)",
    ledger: "Tax status: grantor — tax burn is an extra tax-free gift; include swap power",
    detail:
      "You paying the trust's taxes lets it compound gross — an additional transfer the IRS doesn't count. The swap power also lets you pull low-basis assets back before death for the step-up.",
    qsbs: {
      ledger: "Tax status: grantor — DEFEATS stacking; the trust shares your §1202 cap",
      detail:
        "Fatal here. A grantor trust is you for income tax — its QSBS gain reports on your return and burns your single §1202 cap. No swap power, no grantor toggle, no grantor triggers of any kind.",
      tag: "collapses the stack",
      warn: true,
    },
  },
  {
    id: "nongrantor",
    label: "Non-grantor (trust pays its own tax)",
    ledger: "Tax status: non-grantor — pairs with NV/SD situs to escape CA income tax",
    detail:
      "The trust is its own taxpayer. Combined with NV/SD situs, can remove trust income from California taxation entirely (mind the throwback rules).",
    qsbs: {
      ledger: "Tax status: non-grantor — separate taxpayer, own §1202 cap",
      detail:
        "The stack itself. Each non-grantor trust is a separate taxpayer with its own §1202 exclusion per issuer. Pairs with NV/SD situs to drop the state layer too.",
      tag: "required for stacking",
      warn: false,
    },
  },
];

const FLEX_STACK = [
  "Trust protector with power to remove/replace trustees and amend administrative terms",
  "Broad limited powers of appointment so the next generation can redirect",
  "Express decanting authorization + decanting-friendly situs",
  "Discretionary distribution language over enumerated purposes",
  "Grantor-trust toggle and substitution (swap) power where applicable",
];

const QSBS_FLEX = [
  "Trust protector (independent — not related or subordinate) to remove/replace trustees and amend administrative terms",
  "Broad limited powers of appointment so the next generation can redirect",
  "Express decanting authorization + decanting-friendly situs",
  "Fully discretionary distributions, held exclusively by the independent trustee (§674(c))",
  "No grantor-trust powers: no swap power, no toggle, no spousal distributions without adverse-party consent — one trigger collapses the stack",
];

const MUNGER_WARNINGS = [
  "Every additional trust is a permanent employee. Count the salaries before hiring.",
  "Ask who profits from each layer of complexity — whose bread I eat, his song I sing.",
  "Rules for people you haven't met should be principles, not schedules.",
  "Invert: draft against the 2046 regret, not the 2026 tax code.",
];

const QSBS_WARNINGS = [
  "Verify the stock is actually QSBS before drafting anything: original-issue C-corp shares, gross assets within the limit at issuance, active qualified business. No §1202, no stack.",
  "Gift while the deal is hypothetical. Once a sale is practically certain, assignment-of-income doctrine puts the gain back on your return.",
  "Clone trusts collapse: §643(f) aggregates trusts with substantially the same grantor and primary beneficiaries. Different children, different terms, real non-tax purposes.",
  "Every additional trust is a permanent employee — but here a full cap is worth ≈ $2.4M of federal tax, plus the California savings. Count both columns.",
];

// ----------------------- steps definition -----------------------

const STEPS = [
  { key: "purpose", eyebrow: "I · Purpose", q: "What must this trust achieve that a revocable trust cannot?", options: PURPOSES },
  { key: "vehicle", eyebrow: "II · Vehicle", q: "Which situation fits best?", options: null },
  { key: "size", eyebrow: "III · Cost test", q: "How much will fund this trust?",
    sub: "Assume $4k–$8k/yr in CPA + trustee + admin, forever.",
    qsbsSub: "Measure by expected value at exit, not today's 409A. Cap per trust: the greater of $10M ($15M for stock acquired after 7/4/2025) or 10× basis, per issuer.",
    options: SIZES },
  { key: "trustee", eyebrow: "IV · Trustee", q: "Who serves as trustee?", options: TRUSTEES },
  { key: "situs", eyebrow: "V · Situs", q: "Where does the trust live?", options: SITUS },
  { key: "tax", eyebrow: "VI · Tax status", q: "Who pays the trust's income tax?", options: TAXSTATUS },
];

export default function IrrevocableTrustFramework() {
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [ledger, setLedger] = useState([]);
  const [stopped, setStopped] = useState(null);
  const [done, setDone] = useState(false);
  const [ledgerOpen, setLedgerOpen] = useState(false);

  const step = STEPS[stepIdx];
  const isQsbs = answers.purpose?.id === "income";

  const optionsFor = (s) => {
    const base = s.key === "vehicle" ? VEHICLES[answers.purpose?.id] || [] : s.options;
    if (isQsbs) return base.map((o) => (o.qsbs ? { ...o, ...o.qsbs } : o));
    return base;
  };

  const choose = (opt) => {
    setLedger((l) => [...l, opt.ledger]);
    if (opt.stop) { setStopped(opt); return; }
    setAnswers((a) => ({ ...a, [step.key]: opt }));
    if (stepIdx === STEPS.length - 1) setDone(true);
    else setStepIdx(stepIdx + 1);
  };

  const back = () => {
    if (stopped) { setStopped(null); setLedger((l) => l.slice(0, -1)); return; }
    if (done) { setDone(false); setLedger((l) => l.slice(0, -1)); return; }
    if (stepIdx === 0) return;
    const prevKey = STEPS[stepIdx - 1].key;
    setAnswers((a) => { const n = { ...a }; delete n[prevKey]; return n; });
    setLedger((l) => l.slice(0, -1));
    setStepIdx(stepIdx - 1);
  };

  const restart = () => {
    setStepIdx(0); setAnswers({}); setLedger([]); setStopped(null); setDone(false);
  };

  const sizeWarn = answers.size?.warn;
  const stepSub = step.key === "size" && isQsbs ? step.qsbsSub : step.sub;

  return (
    <div className="itf-body min-h-screen" style={{ background: PAPER, color: INK }}>
      <style>{fontStyles}</style>

      {/* Masthead */}
      <header className="px-5 pt-8 pb-5 border-b" style={{ borderColor: LINE }}>
        <p className="itf-mono text-xs tracking-widest uppercase" style={{ color: SAGE }}>
          Decision framework · drafting stage
        </p>
        <h1 className="itf-display text-3xl font-semibold leading-tight mt-2">
          The Irrevocable Trust,<br />Decided Before It's Drafted
        </h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: "#4A5361" }}>
          Six questions, answered in order. Each answer becomes a line in the ledger —
          the skeleton you hand to trust counsel.
        </p>
      </header>

      <main className="px-5 py-6 max-w-xl mx-auto">
        {/* STOP outcome */}
        {stopped && (
          <section className="itf-fade">
            <p className="itf-mono text-xs uppercase tracking-widest" style={{ color: OXBLOOD }}>
              Verdict — stop here
            </p>
            <h2 className="itf-display text-2xl font-semibold mt-2">
              {stopped.stop.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed">
              {stopped.stop.body}
            </p>
            <div className="mt-6 flex gap-3">
              <button onClick={back} className="px-4 py-2.5 text-sm rounded-md border" style={{ borderColor: INK }}>
                ← Back
              </button>
              <button onClick={restart} className="px-4 py-2.5 text-sm rounded-md text-white" style={{ background: INK }}>
                Start over
              </button>
            </div>
          </section>
        )}

        {/* Question steps */}
        {!stopped && !done && (
          <section className="itf-fade" key={step.key}>
            <div className="flex items-baseline justify-between">
              <p className="itf-mono text-xs uppercase tracking-widest" style={{ color: SAGE }}>
                {step.eyebrow}
              </p>
              <p className="itf-mono text-xs" style={{ color: "#9AA0A8" }}>
                {stepIdx + 1} / {STEPS.length}
              </p>
            </div>
            <h2 className="itf-display text-2xl font-semibold mt-2 leading-snug">{step.q}</h2>
            {stepSub && (
              <p className="mt-2 text-sm" style={{ color: OXBLOOD }}>{stepSub}</p>
            )}
            {step.key === "vehicle" && answers.purpose?.note && (
              <p className="mt-2 text-sm" style={{ color: "#4A5361" }}>{answers.purpose.note}</p>
            )}

            <div className="mt-5 flex flex-col gap-3">
              {optionsFor(step).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => choose(opt)}
                  className="text-left rounded-lg border px-4 py-3.5 transition-colors"
                  style={{ borderColor: LINE, background: "#FFFFFF" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = INK)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = LINE)}
                >
                  <span className="block text-[15px] font-medium">{opt.label}</span>
                  {opt.detail && (
                    <span className="block mt-1 text-[13px] leading-relaxed" style={{ color: "#5A6270" }}>
                      {opt.detail}
                    </span>
                  )}
                  {opt.tag && (
                    <span
                      className="itf-mono inline-block mt-2 text-[11px] px-2 py-0.5 rounded"
                      style={{
                        background: opt.warn ? "#F6E8E8" : "#EDF0EC",
                        color: opt.warn ? OXBLOOD : SAGE,
                      }}
                    >
                      {opt.tag}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {stepIdx > 0 && (
              <button onClick={back} className="mt-5 text-sm underline underline-offset-4" style={{ color: SAGE }}>
                ← Back one step
              </button>
            )}
          </section>
        )}

        {/* Final recommendation */}
        {done && (
          <section className="itf-fade">
            <p className="itf-mono text-xs uppercase tracking-widest" style={{ color: SAGE }}>
              Verdict · structure summary
            </p>
            <h2 className="itf-display text-2xl font-semibold mt-2">
              {answers.vehicle?.ledger.replace("Vehicle: ", "")}
            </h2>

            {sizeWarn && (
              <div className="mt-4 rounded-lg px-4 py-3 text-sm" style={{ background: "#F6E8E8", color: OXBLOOD }}>
                <strong>Cost-test failure.</strong>{" "}
                {isQsbs
                  ? "At this size your own §1202 cap almost certainly absorbs the gain — the trust adds cost to a tax bill that was already zero. Stack only genuine overflow above your personal cap."
                  : "At this funding level, admin drag likely exceeds 1%/yr — a guaranteed negative return before the trust does anything. Consolidate into an existing pot trust, fund it larger, or don't do it."}
              </div>
            )}

            {isQsbs && answers.tax?.id === "grantor" && (
              <div className="mt-4 rounded-lg px-4 py-3 text-sm" style={{ background: "#F6E8E8", color: OXBLOOD }}>
                <strong>Structural contradiction.</strong> A grantor trust shares your §1202
                cap — this design stacks nothing. Change the tax status to non-grantor, or
                accept that the purpose has failed.
              </div>
            )}

            <div className="mt-5">
              <p className="itf-mono text-xs uppercase tracking-widest" style={{ color: SAGE }}>
                The flexibility stack — draft all five
              </p>
              <ul className="mt-2 flex flex-col gap-2">
                {(isQsbs ? QSBS_FLEX : FLEX_STACK).map((f, i) => (
                  <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                    <span className="itf-mono" style={{ color: OXBLOOD }}>§{i + 1}</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 rounded-lg border px-4 py-4" style={{ borderColor: LINE, background: "#FFFFFF" }}>
              <p className="itf-mono text-xs uppercase tracking-widest" style={{ color: SAGE }}>
                Standing warnings
              </p>
              <ul className="mt-2 flex flex-col gap-2">
                {(isQsbs ? QSBS_WARNINGS : MUNGER_WARNINGS).map((w, i) => (
                  <li key={i} className="text-[13px] leading-relaxed" style={{ color: "#4A5361" }}>
                    — {w}
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-5 text-xs leading-relaxed" style={{ color: "#8A9098" }}>
              Framework for organizing the engagement — not legal or tax advice. Drafting
              belongs with trust counsel; run the tax mechanics past the client's CPA.
            </p>

            <div className="mt-5 flex gap-3">
              <button onClick={back} className="px-4 py-2.5 text-sm rounded-md border" style={{ borderColor: INK }}>
                ← Back
              </button>
              <button onClick={restart} className="px-4 py-2.5 text-sm rounded-md text-white" style={{ background: INK }}>
                Run again
              </button>
            </div>
          </section>
        )}
      </main>

      {/* The Ledger — signature element */}
      <div className="fixed bottom-0 left-0 right-0 border-t" style={{ background: INK, borderColor: "#2C3542" }}>
        <button
          onClick={() => setLedgerOpen(!ledgerOpen)}
          className="w-full flex items-center justify-between px-5 py-3"
        >
          <span className="itf-mono text-xs uppercase tracking-widest" style={{ color: "#C9CDD4" }}>
            The Ledger — {ledger.length} {ledger.length === 1 ? "entry" : "entries"}
          </span>
          <span className="itf-mono text-xs" style={{ color: "#8A9098" }}>
            {ledgerOpen ? "close ▾" : "open ▴"}
          </span>
        </button>
        {ledgerOpen && (
          <div className="px-5 pb-5 max-h-64 overflow-y-auto">
            {ledger.length === 0 ? (
              <p className="itf-mono text-xs" style={{ color: "#6A7280" }}>
                No entries yet. Each decision is recorded here.
              </p>
            ) : (
              <ol className="flex flex-col gap-2">
                {ledger.map((entry, i) => (
                  <li key={i} className="itf-mono text-xs leading-relaxed flex gap-2.5" style={{ color: "#DDE1E6" }}>
                    <span style={{ color: OXBLOOD }}>{String(i + 1).padStart(2, "0")}</span>
                    <span>{entry}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </div>

      <div className="h-16" />
    </div>
  );
}
