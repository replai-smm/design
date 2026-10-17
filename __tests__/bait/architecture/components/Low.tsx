import { High } from './High'
import { Good } from './Good'

type LowTone = 'red' | 'error'
export const Low = ({ tone }: { tone: LowTone }) => (
  <span className="rounded-full" data-tone={tone}>
    ◀ <svg viewBox="0 0 16 16" />
    <High />
    <Good />
    <p className="rounded-surface bg-success-fill">план выполнен</p>
  </span>
)
