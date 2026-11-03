// Movie rental: unrented copies per movie and rented copies globally, both kept in sorted order.
const byPriceShop = (a, b) => a[0] - b[0] || a[1] - b[1]
const byPriceShopMovie = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]

function insertSorted(list, item, compare) {
  let lo = 0, hi = list.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (compare(list[mid], item) < 0) lo = mid + 1
    else hi = mid
  }
  list.splice(lo, 0, item)
}

function removeSorted(list, item, compare) {
  let lo = 0, hi = list.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (compare(list[mid], item) < 0) lo = mid + 1
    else hi = mid
  }
  if (lo < list.length && compare(list[lo], item) === 0) list.splice(lo, 1)
}

export class MovieRentingSystem {
  constructor(n, entries) {
    this.price = new Map()
    this.unrented = new Map()
    this.rented = []
    for (const [shop, movie, p] of entries) {
      this.price.set(`${shop},${movie}`, p)
      if (!this.unrented.has(movie)) this.unrented.set(movie, [])
      insertSorted(this.unrented.get(movie), [p, shop], byPriceShop)
    }
  }

  search(movie) {
    return (this.unrented.get(movie) || []).slice(0, 5).map(([, shop]) => shop)
  }

  rent(shop, movie) {
    const p = this.price.get(`${shop},${movie}`)
    removeSorted(this.unrented.get(movie), [p, shop], byPriceShop)
    insertSorted(this.rented, [p, shop, movie], byPriceShopMovie)
  }

  drop(shop, movie) {
    const p = this.price.get(`${shop},${movie}`)
    removeSorted(this.rented, [p, shop, movie], byPriceShopMovie)
    insertSorted(this.unrented.get(movie), [p, shop], byPriceShop)
  }

  report() {
    return this.rented.slice(0, 5).map(([, shop, movie]) => [shop, movie])
  }
}
