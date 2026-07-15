import { state } from './state.js';

// ─── GOLD PURE FUNCTION (borrow-down) ───────────────────────
function spendGold(current, cost) {
  const toCp = ({ pp=0, gp=0, sp=0, cp=0 }) =>
    Math.floor(pp)*1000 + Math.floor(gp)*100 + Math.floor(sp)*10 + Math.floor(cp);
  if (toCp(cost) > toCp(current)) return null;

  let pp = +current.pp, gp = +current.gp, sp = +current.sp, cp = +current.cp;

  cp -= +(cost.cp || 0);
  if (cp < 0) { const b = Math.ceil(-cp/10); sp -= b; cp += b*10; }
  sp -= +(cost.sp || 0);
  if (sp < 0) { const b = Math.ceil(-sp/10); gp -= b; sp += b*10; }
  gp -= +(cost.gp || 0);
  if (gp < 0) { const b = Math.ceil(-gp/10); pp -= b; gp += b*10; }
  pp -= +(cost.pp || 0);

  return { pp, gp, sp, cp };
}

// ─── GOLD UI ────────────────────────────────────────────────
function renderGold() {
  document.getElementById('dispPP').textContent = state.gold.pp;
  document.getElementById('dispGP').textContent = state.gold.gp;
  document.getElementById('dispSP').textContent = state.gold.sp;
  document.getElementById('dispCP').textContent = state.gold.cp;
}

function coinInputs() {
  const v = id => Math.max(0, Math.floor(+document.getElementById(id).value || 0));
  return { pp: v('inPP'), gp: v('inGP'), sp: v('inSP'), cp: v('inCP') };
}
function clearCoinInputs() {
  ['inPP','inGP','inSP','inCP'].forEach(id => document.getElementById(id).value = '');
}

export { spendGold, renderGold, coinInputs, clearCoinInputs };
