import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function PortalSearch({ placeholder, links }) {
  const [query, setQuery] = useState('')
  const matches = links.filter(item => item.label.toLocaleLowerCase('vi').includes(query.trim().toLocaleLowerCase('vi')))
  return <div className="portal-search"><i className="bi bi-search" aria-hidden="true" />
    <input aria-label={placeholder} placeholder={placeholder} value={query} maxLength={200} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Escape') setQuery('') }} />
    {query.trim() && <div className="portal-search-results">{matches.length ? matches.map(item => <Link key={item.to} to={item.to} onClick={() => setQuery('')}>{item.label}</Link>) : <p>Không tìm thấy mục phù hợp.</p>}</div>}
  </div>
}
