// Visitor preferences stored in a first-party cookie. Only the pricing choice is stored.
const PLANS_HIDDEN = 'cpviz_plans_hidden';

export function plansHiddenByVisitor() {
  try {
    return document.cookie.split('; ').includes(`${PLANS_HIDDEN}=1`);
  } catch {
    return false;
  }
}

export function hidePlansForever() {
  try {
    document.cookie = `${PLANS_HIDDEN}=1; max-age=31536000; path=/; SameSite=Lax`;
  } catch {
    // Cookies blocked: the pricing panel will open again next visit.
  }
}
