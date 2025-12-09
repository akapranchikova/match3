import Alpine from "alpinejs"

type AlpineStore = {
  init: (...args: any[]) => any
}

export const createStore = <T extends AlpineStore>(name: string, store: T) => {
  Alpine.store(name, {
    ...store,
  } satisfies T)

  return Alpine.store(name) as T
}
