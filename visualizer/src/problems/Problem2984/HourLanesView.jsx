import RecordStateTable from '../../components/shared/RecordStateTable'
import { CALL_COLUMNS, OUTPUT_COLUMNS } from './algorithm'

const BAR_STEP = 22

function CityLane({ city, groups, activeGroup, activeCity }) {
  const hours = [...groups].sort((a, b) => a.hour - b.hour)
  return <figure data-city={city} style={{ margin: 0, padding: 10, border: `2px solid ${activeCity === city ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 8, background: 'var(--surface)', flex: '1 1 220px', minWidth: 0 }}>
    <figcaption style={{ fontWeight: 700, marginBottom: 6 }}>{city}</figcaption>
    <div role="img" aria-label={`${city} calls per hour: ${hours.map(group => `${group.hour}:00 has ${group.count}`).join(', ')}`} style={{ display: 'flex', alignItems: 'flex-end', gap: 8, overflowX: 'auto', minHeight: 70 }}>
      {hours.map(group => {
        const active = activeGroup?.city === city && activeGroup.hour === group.hour
        const peak = group.rank === 1
        const dropped = group.kept === false
        return <div key={group.hour} data-hour={group.hour} data-rank={group.rank ?? ''} data-kept={group.kept ?? ''} style={{ textAlign: 'center', flex: '0 0 48px', opacity: dropped ? 0.45 : 1 }}>
          <div style={{ fontSize: 12 }}>{peak ? `★ ${group.count}` : group.count}</div>
          <div style={{
            height: group.count * BAR_STEP, borderRadius: '4px 4px 0 0',
            background: peak ? 'var(--success)' : 'var(--surface3)',
            border: `2px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
          }} />
          <div style={{ fontSize: 12, fontWeight: active ? 700 : 400 }}>{String(group.hour).padStart(2, '0')}:00</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', minHeight: 14 }}>{group.rank ? `rank ${group.rank}` : ''}</div>
        </div>
      })}
    </div>
  </figure>
}

// Source rows, one hour-of-day bar chart per city, and the output as it forms.
export default function HourLanesView({ step }) {
  const cities = [...new Set(step.groups.map(group => group.city))]
  return <section aria-label="Calls grouped by city and hour" style={{ display: 'grid', gap: 12, color: 'var(--text)' }}>
    <RecordStateTable label="Calls, with the hour taken from call_time" columns={CALL_COLUMNS} rows={step.calls} activeRow={step.activeRow} />
    <div>
      <strong>Calls per hour of day, by city</strong>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
        {cities.length
          ? cities.map(city => <CityLane key={city} city={city} groups={step.groups.filter(group => group.city === city)} activeGroup={step.activeGroup} activeCity={step.activeCity} />)
          : <em style={{ color: 'var(--text-muted)' }}>No groups yet</em>}
      </div>
    </div>
    <RecordStateTable label={step.phase === 'order' || step.phase === 'done' ? 'Output, ordered' : 'Output, rows kept so far'} columns={OUTPUT_COLUMNS} rows={step.output} />
  </section>
}
