<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Facility balances, prices and routing/simulation outcomes are derived in src/lib (credence.ts, routing.ts, simulation.ts), never hand-typed in pages — keeps every page consistent. Tests live in src/lib/__tests__ (run `bunx vitest run`).
