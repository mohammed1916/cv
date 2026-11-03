import { hostname } from './algorithm'
import './HostLanesView.css'

// Pages are grouped into one lane per hostname, so an other-host link is visibly outside the crawl.
export default function HostLanesView({ run, step }) {
  const pages = [...new Set([...run.input.edges ? Object.keys(run.input.edges) : [], ...Object.values(run.input.edges).flat(), run.input.startUrl])]
  const hosts = [...new Set(pages.map(hostname))]
  const pathOf = url => url.slice(url.indexOf('/', url.indexOf('//') + 2)) || '/'
  const stateOf = url => {
    if (url === step.current) return 'is-current'
    if (step.visited.includes(url)) return 'is-visited'
    if (step.queue.includes(url)) return 'is-queued'
    return 'is-unseen'
  }
  return <div className="lanes-view">
    <p className="lanes-view__host-note">Crawling only {step.host}</p>
    <div className="lanes-view__lanes">
      {hosts.map(host => <section key={host} className={`lanes-view__lane${host === step.host ? ' is-crawled' : ' is-outside'}`} aria-label={`Host ${host}`}>
        <h4>{host}{host === step.host ? ' · crawled' : ' · not followed'}</h4>
        <ul>
          {pages.filter(url => hostname(url) === host).map(url => <li key={url} className={stateOf(url)} title={url}>
            <code>{pathOf(url)}</code>
            {url === step.current && <em>open</em>}
          </li>)}
        </ul>
      </section>)}
    </div>
    <section className="lanes-view__links" aria-label="Links from the current page">
      <p className="lanes-view__label">{step.current ? `links on ${pathOf(step.current)}` : 'links appear when a page opens'}</p>
      <ol>
        {step.links.map(({ link, status }) => <li key={link} className={`is-${status}`}>
          <code>{link}</code><span>{status === 'new' ? 'queued' : status === 'seen' ? 'seen' : 'other host'}</span>
        </li>)}
      </ol>
    </section>
    <output aria-label="Crawl readout">{`visited ${step.visited.length} · queue ${step.queue.length}`}</output>
  </div>
}
