# irrevocable-trust-framework

A guided decision framework for irrevocable trusts: purpose → vehicle → cost test → trustee → situs → tax status. Purposes covered include estate tax reduction, income tax savings via §1202 QSBS stacking, asset protection, dynasty control, special needs, and charitable split-interest trusts.

**Live site:** https://bsuvorov.github.io/irrevocable-trust-framework/

## Files

- `irrevocable-trust-framework.jsx` — the React component (source of truth)
- `index.html` + `app.js` + `app.css` — the deployed site, served by GitHub Pages. `app.js`/`app.css` are prebuilt (React bundled in, Tailwind precompiled) so the page has no runtime CDN dependencies.

## Rebuilding after editing the JSX

```
npm install   # once
npm run build # regenerates app.js and app.css — commit them
```

This repo and website do not represent legal, tax or financial advice. I had difficult time memorizing and rationalizing through irrevocable trust framework.
