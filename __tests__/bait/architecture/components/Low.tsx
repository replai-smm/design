import { High } from './High'
import { Good } from './Good'

type LowTone = 'red' | 'error'
export const Low = ({ tone }: { tone: LowTone }) => (
  <span className="rounded-full" data-tone={tone}>
    ◀ <svg viewBox="0 0 16 16" />
    <High />
    <Good />
    <p className="rounded-surface bg-success-fill">план выполнен</p>
    <div className="flex min-h-0 overflow-y-auto">лента</div>
    <pre className={cx('m-0', wide && 'overflow-auto')}>код</pre>
    <div className={cx('relative min-h-0', 'overflow-y-auto')}>своя лента</div>
  </span>
)
