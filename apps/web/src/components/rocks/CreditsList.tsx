import { SPECIMENS, WIKI_LICENSE, photosFor, wikiFor } from "@sciolyguide/rocks-minerals";

/** Attribution for every specimen photo and Wikipedia summary used in the app. */
export function CreditsList() {
  return (
    <>
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Photo and text credits</h1>
        <p className="max-w-3xl text-zinc-600 dark:text-zinc-400">
          Specimen photos come from Wikimedia Commons under the licenses listed, resized for this app. Specimen summaries are excerpts from
          Wikipedia, available under{" "}
          <a className="underline" href={WIKI_LICENSE.url} target="_blank" rel="noreferrer">
            {WIKI_LICENSE.label}
          </a>
          . Thank you to every photographer and editor.
        </p>
      </header>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-zinc-500">
              <th className="px-4 py-2">Specimen</th>
              <th className="px-4 py-2">Photos</th>
              <th className="px-4 py-2">Text</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 align-top dark:divide-zinc-800">
            {SPECIMENS.map((s) => {
              const w = wikiFor(s.id);
              return (
                <tr key={s.id}>
                  <td className="whitespace-nowrap px-4 py-2 font-medium">{s.name}</td>
                  <td className="px-4 py-2">
                    <ul className="space-y-0.5">
                      {photosFor(s.id).map((p) => (
                        <li key={p.key}>
                          <a className="underline" href={p.source} target="_blank" rel="noreferrer">
                            Photo
                          </a>{" "}
                          by {p.author},{" "}
                          {p.licenseUrl ? (
                            <a className="underline" href={p.licenseUrl} target="_blank" rel="noreferrer">
                              {p.license}
                            </a>
                          ) : (
                            p.license
                          )}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2">
                    {w && (
                      <a className="underline" href={w.url} target="_blank" rel="noreferrer">
                        Wikipedia: {w.title}
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
