import { HARDNESS_TOOLS, MOHS, REFERENCE, specimenById } from "@sciolyguide/rocks-minerals";

const name = (id: string | null) => (id ? (specimenById(id)?.name ?? id) : "—");

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card min-w-0 space-y-3 p-5">
      <h2 className="text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

/** Study reference: classification tables and scales (original summaries). */
export function ReferenceTables() {
  const th = "px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500";
  const td = "px-3 py-2 align-top";
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Section title="Mohs hardness scale">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className={th}>H</th>
                <th className={th}>Index mineral</th>
                <th className={th}>Everyday test</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {MOHS.map((m) => (
                <tr key={m.h}>
                  <td className={`${td} font-mono font-semibold tabular-nums`}>{m.h}</td>
                  <td className={td}>{m.mineral}</td>
                  <td className={`${td} text-zinc-600 dark:text-zinc-400`}>
                    {HARDNESS_TOOLS.filter((t) => Math.floor(t.h) === m.h)
                      .map((t) => `${t.tool} ≈ ${t.h}`)
                      .join("; ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-zinc-500">The scale is relative: each mineral scratches the ones below it, but the steps aren&apos;t equal in size.</p>
      </Section>

      <Section title="Igneous rocks: texture × composition">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className={th}>Texture</th>
                {REFERENCE.igneous.columns.map((c) => (
                  <th key={c} className={th}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {REFERENCE.igneous.rows.map((r) => (
                <tr key={r.texture}>
                  <td className={`${td} font-medium`}>{r.texture}</td>
                  {r.rocks.map((id, i) => (
                    <td key={i} className={`${td} ${id ? "" : "text-zinc-300 dark:text-zinc-700"}`}>
                      {name(id)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-zinc-500">
          Felsic → ultramafic: lighter and silica-rich → darker and rich in Mg and Fe. {REFERENCE.igneous.note}
        </p>
      </Section>

      <Section title="Sedimentary rocks">
        <ul className="space-y-3 text-sm">
          {REFERENCE.sedimentary.map((g) => (
            <li key={g.group}>
              <p className="font-medium">{g.group}</p>
              <p>{g.rocks.map(name).join(" · ")}</p>
              <p className="text-xs text-zinc-500">{g.note}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Metamorphic rocks">
        <ul className="space-y-3 text-sm">
          {REFERENCE.metamorphic.map((g) => (
            <li key={g.group}>
              <p className="font-medium">{g.group}</p>
              <p>{g.rocks.map(name).join(g.group.includes("→") ? " → " : " · ")}</p>
            </li>
          ))}
        </ul>
        <p className="text-xs text-zinc-500">Shale at increasing grade: slate → phyllite → schist → gneiss. Limestone → marble; quartz sandstone → quartzite.</p>
      </Section>

      <Section title="Bowen's reaction series">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Discontinuous</p>
            <ol className="mt-1 space-y-1">
              {REFERENCE.bowen.discontinuous.map((m) => (
                <li key={m}>↓ {m}</li>
              ))}
            </ol>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Continuous</p>
            <ol className="mt-1 space-y-1">
              {REFERENCE.bowen.continuous.map((m) => (
                <li key={m}>↓ {m}</li>
              ))}
            </ol>
          </div>
        </div>
        <p className="text-sm">Then, last to crystallize: {REFERENCE.bowen.last.join(" → ")}.</p>
        <p className="text-xs text-zinc-500">{REFERENCE.bowen.note}</p>
      </Section>

      <Section title="Grain size (Wentworth scale)">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {REFERENCE.grainSizes.map((g) => (
              <tr key={g.name}>
                <td className={`${td} font-medium`}>{g.name}</td>
                <td className={`${td} font-mono tabular-nums`}>{g.size}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Luster terms">
        <dl className="grid gap-x-4 gap-y-1.5 text-sm sm:grid-cols-[8rem_1fr]">
          {REFERENCE.lusters.map((l) => (
            <div key={l.term} className="contents">
              <dt className="font-medium">{l.term}</dt>
              <dd className="text-zinc-600 dark:text-zinc-400">{l.meaning}</dd>
            </div>
          ))}
        </dl>
      </Section>
    </div>
  );
}
