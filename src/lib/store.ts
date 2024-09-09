import { create, StateCreator } from 'zustand'
import { persist, PersistOptions } from 'zustand/middleware'

interface StoreState {
  wsUrl: string
}

interface StoreActions {
  setWsUrl: (url: string) => void
}

type Store = StoreState & StoreActions

type StorePersist = (
  config: StateCreator<Store>,
  options: PersistOptions<Store>
) => StateCreator<Store>

const useStore = create<Store>(
  (persist as StorePersist)(
    (set) => ({
      wsUrl: '',
      setWsUrl: (url: string) => set({ wsUrl: url }),
    }),
    {
      name: 'media-dashboard-storage',
    }
  )
)

export { useStore }