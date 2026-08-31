// ─── CRAFTING REFERENCE — PAGE (lane crafting-ui — task 720) ────
// Статична референция (harvesting + експериментална алхимия) зад ⚒ в header
// реда. БЕЗ Firestore, БЕЗ Sortable, БЕЗ редакция — данните идват от
// modules/crafting-data.js.
//
// Разделението на труда във фундамента (710): РУТИРАНЕТО е готово, СЪДЪРЖАНИЕТО
// не е. renderCraftingRoute() е самият route (router.js го вика последен, за да
// бие base-detail) и затова е реален още тук; renderCrafting() — chips-овете,
// списъкът, акордеонът и info изгледът — е stub, който lane crafting-ui (720)
// попълва в ТОЗИ файл.

// Показва/крие „страницата" според hash-а. Викa се САМО от router.js
// (dispatchRoute) и от openCrafting().
function renderCraftingRoute() {
  const page = document.getElementById('craftingPage');
  if (!page) return;

  if (location.hash === '#crafting') {
    document.querySelector('.tab-nav')?.classList.add('hidden');
    document.querySelectorAll('.tab').forEach(t => t.classList.add('hidden'));
    document.getElementById('baseDetail')?.classList.add('hidden');
    page.classList.remove('hidden');
    renderCrafting();
    return;
  }

  page.classList.add('hidden');
}

// STUB — lane crafting-ui (720): chips по CRAFTING_TABLES, филтрираната
// таблица / info изгледът, акордеонът през state.expandedCraftIdx.
function renderCrafting() {}

// ⚒ в header реда. Сетването на hash-а сама по себе си би стигнала (hashchange
// вика dispatchRoute), но рендерът се вика и директно — патърнът на
// openBaseDetail: в jsdom hashchange е асинхронен и ненадежден.
function openCrafting() {
  location.hash = '#crafting';
  renderCraftingRoute();
}

export { renderCraftingRoute, renderCrafting, openCrafting };
