import React from 'react';
import { Plus, Check, Zap } from 'lucide-react';
export default function HeroCard({hero, tracked, onSelect, onToggleTrack}) {
  return <article className="hero-card">
    <button className="hero-image-button" onClick={()=>onSelect(hero)} aria-label={`View ${hero.name}`}><img loading="lazy" src={hero.images?.md} alt={hero.name}/></button>
    <div className="hero-card-content"><div className="hero-card-heading"><div><h3>{hero.name}</h3><p>{hero.biography?.publisher || 'Independent'}</p></div><span className="power-chip"><Zap size={13}/>{hero.powerstats?.power ?? '?'}</span></div>
    <div className="hero-actions"><button className="btn btn-secondary" onClick={()=>onSelect(hero)}>View dossier</button><button className={`btn btn-icon ${tracked?'btn-active':''}`} onClick={()=>onToggleTrack(hero.id)} aria-label={tracked?'Remove from tracked':'Track hero'} title={tracked?'Untrack hero':'Track hero'}>{tracked?<Check size={17}/>:<Plus size={17}/>}</button></div></div>
  </article>;
}
