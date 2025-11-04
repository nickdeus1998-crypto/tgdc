"use client"
import React, { useEffect, useState } from 'react'

type Project = {
  id?: number
  name: string
  status: string
  location: string
  description: string
  badgeColor: string
  badgeTextColor: string
  badgeBorderColor: string
  isOpen?: boolean
}

type Partner = {
  id?: number
  name: string
  url: string
  initial: string
  category: string
  badgeColor: string
  badgeTextColor: string
  badgeBorderColor: string
}

const defaultProject: Project = {
  name: '',
  status: 'Planned',
  location: '',
  description: '',
  badgeColor: 'bg-emerald-50',
  badgeTextColor: 'text-emerald-700',
  badgeBorderColor: 'border-emerald-100',
  isOpen: false,
}

const defaultPartner: Partner = {
  name: '',
  url: '',
  initial: '',
  category: 'Fund support',
  badgeColor: 'bg-blue-50',
  badgeTextColor: 'text-blue-700',
  badgeBorderColor: 'border-blue-100',
}

const SustainabilityAdmin: React.FC = () => {
  const [tab, setTab] = useState<'projects'|'partners'>('projects')
  const [projects, setProjects] = useState<Project[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string>('')

  const loadAll = async () => {
    setLoading(true)
    setErr('')
    try {
      const [prjRes, ptRes] = await Promise.all([
        fetch('/api/sustainability/projects'),
        fetch('/api/sustainability/partners'),
      ])
      const [prj, pt] = await Promise.all([
        prjRes.ok ? prjRes.json() : Promise.resolve([]),
        ptRes.ok ? ptRes.json() : Promise.resolve([]),
      ])
      setProjects(prj || [])
      setPartners(pt || [])
    } catch (e) {
      setErr('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  const saveProject = async (data: Project) => {
    setLoading(true)
    setErr('')
    try {
      if (data.id) {
        const res = await fetch(`/api/sustainability/projects/${data.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        if (!res.ok) throw new Error('update failed')
      } else {
        const res = await fetch('/api/sustainability/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        if (!res.ok) throw new Error('create failed')
      }
      await loadAll()
      setEditingProject(null)
    } catch (e) {
      setErr('Failed to save project')
    } finally {
      setLoading(false)
    }
  }

  const deleteProject = async (id?: number) => {
    if (!id) return
    if (!confirm('Delete this project?')) return
    setLoading(true)
    setErr('')
    try {
      const res = await fetch(`/api/sustainability/projects/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('delete failed')
      await loadAll()
    } catch (e) {
      setErr('Failed to delete project')
    } finally {
      setLoading(false)
    }
  }

  const savePartner = async (data: Partner) => {
    setLoading(true)
    setErr('')
    try {
      if (data.id) {
        const res = await fetch(`/api/sustainability/partners/${data.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        if (!res.ok) throw new Error('update failed')
      } else {
        const res = await fetch('/api/sustainability/partners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        if (!res.ok) throw new Error('create failed')
      }
      await loadAll()
      setEditingPartner(null)
    } catch (e) {
      setErr('Failed to save partner')
    } finally {
      setLoading(false)
    }
  }

  const deletePartner = async (id?: number) => {
    if (!id) return
    if (!confirm('Delete this partner?')) return
    setLoading(true)
    setErr('')
    try {
      const res = await fetch(`/api/sustainability/partners/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('delete failed')
      await loadAll()
    } catch (e) {
      setErr('Failed to delete partner')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {err && <div className="mb-4 text-sm text-red-600">{err}</div>}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex gap-2">
            {(['projects','partners'] as const).map(k => (
              <button key={k} onClick={()=>setTab(k)} className={`px-3 py-1.5 rounded text-sm ${tab===k ? 'bg-gradient-to-r from-[#326101] to-[#639427] text-white' : 'border border-gray-200'}`}>{k[0].toUpperCase()+k.slice(1)}</button>
            ))}
            <div className="ml-auto text-sm text-gray-500">{loading ? 'Loading…' : ''}</div>
          </div>
        </div>

        {tab==='projects' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Projects</h3>
                <button onClick={()=>setEditingProject({...defaultProject})} className="px-3 py-1.5 text-sm rounded bg-[#326101] text-white hover:bg-[#2a5200]">New Project</button>
              </div>
              <div className="divide-y divide-gray-100">
                {projects.map(p => (
                  <div key={p.id} className="py-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-gray-900">{p.name}</div>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full ${p.badgeColor} ${p.badgeTextColor} border ${p.badgeBorderColor}`}>{p.status}</span>
                      </div>
                      <div className="text-xs text-gray-500">{p.location}</div>
                      <div className="text-sm text-gray-700 mt-1">{p.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={()=>setEditingProject(p)} className="px-2 py-1 text-xs rounded border">Edit</button>
                      <button onClick={()=>deleteProject(p.id)} className="px-2 py-1 text-xs rounded border border-red-300 text-red-600">Delete</button>
                    </div>
                  </div>
                ))}
                {projects.length===0 && <div className="text-sm text-gray-500 py-6 text-center">No projects yet.</div>}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Project Editor</h4>
              {!editingProject ? (
                <div className="text-sm text-gray-500">Select a project or create a new one.</div>
              ) : (
                <form onSubmit={(e)=>{e.preventDefault(); saveProject(editingProject)}} className="space-y-3">
                  <input value={editingProject.name} onChange={e=>setEditingProject({...editingProject, name:e.target.value})} placeholder="Name" className="w-full px-3 py-2 border rounded" />
                  <input value={editingProject.location} onChange={e=>setEditingProject({...editingProject, location:e.target.value})} placeholder="Location" className="w-full px-3 py-2 border rounded" />
                  <input value={editingProject.status} onChange={e=>setEditingProject({...editingProject, status:e.target.value})} placeholder="Status" className="w-full px-3 py-2 border rounded" />
                  <textarea value={editingProject.description} onChange={e=>setEditingProject({...editingProject, description:e.target.value})} placeholder="Description" className="w-full px-3 py-2 border rounded" rows={4} />
                  <div className="grid grid-cols-3 gap-2">
                    <input value={editingProject.badgeColor} onChange={e=>setEditingProject({...editingProject, badgeColor:e.target.value})} placeholder="Badge color" className="px-2 py-1 border rounded" />
                    <input value={editingProject.badgeTextColor} onChange={e=>setEditingProject({...editingProject, badgeTextColor:e.target.value})} placeholder="Text color" className="px-2 py-1 border rounded" />
                    <input value={editingProject.badgeBorderColor} onChange={e=>setEditingProject({...editingProject, badgeBorderColor:e.target.value})} placeholder="Border color" className="px-2 py-1 border rounded" />
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={!!editingProject.isOpen} onChange={e=>setEditingProject({...editingProject, isOpen: e.target.checked})} /> Open by default</label>
                  <div className="flex items-center gap-2">
                    <button type="submit" className="px-3 py-1.5 rounded bg-[#326101] text-white">Save</button>
                    <button type="button" className="px-3 py-1.5 rounded border" onClick={()=>setEditingProject(null)}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {tab==='partners' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Stakeholders</h3>
                <button onClick={()=>setEditingPartner({...defaultPartner})} className="px-3 py-1.5 text-sm rounded bg-[#326101] text-white hover:bg-[#2a5200]">New Partner</button>
              </div>
              <div className="divide-y divide-gray-100">
                {partners.map(s => (
                  <div key={s.id} className="py-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-gray-900">{s.name}</div>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full ${s.badgeColor} ${s.badgeTextColor} border ${s.badgeBorderColor}`}>{s.category}</span>
                      </div>
                      <div className="text-xs text-gray-500"><a className="text-[#326101] hover:underline" href={s.url} target="_blank" rel="noreferrer">{s.url}</a></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={()=>setEditingPartner(s)} className="px-2 py-1 text-xs rounded border">Edit</button>
                      <button onClick={()=>deletePartner(s.id)} className="px-2 py-1 text-xs rounded border border-red-300 text-red-600">Delete</button>
                    </div>
                  </div>
                ))}
                {partners.length===0 && <div className="text-sm text-gray-500 py-6 text-center">No partners yet.</div>}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Partner Editor</h4>
              {!editingPartner ? (
                <div className="text-sm text-gray-500">Select a partner or create a new one.</div>
              ) : (
                <form onSubmit={(e)=>{e.preventDefault(); savePartner(editingPartner)}} className="space-y-3">
                  <input value={editingPartner.name} onChange={e=>setEditingPartner({...editingPartner, name:e.target.value})} placeholder="Name" className="w-full px-3 py-2 border rounded" />
                  <input value={editingPartner.url} onChange={e=>setEditingPartner({...editingPartner, url:e.target.value})} placeholder="URL" className="w-full px-3 py-2 border rounded" />
                  <input value={editingPartner.initial} onChange={e=>setEditingPartner({...editingPartner, initial:e.target.value})} placeholder="Initial (logo letter)" className="w-full px-3 py-2 border rounded" />
                  <select value={editingPartner.category} onChange={e=>setEditingPartner({...editingPartner, category:e.target.value})} className="w-full px-3 py-2 border rounded">
                    <option>Fund support</option>
                    <option>Technical support</option>
                    <option>Capacity building</option>
                  </select>
                  <div className="grid grid-cols-3 gap-2">
                    <input value={editingPartner.badgeColor} onChange={e=>setEditingPartner({...editingPartner, badgeColor:e.target.value})} placeholder="Badge color" className="px-2 py-1 border rounded" />
                    <input value={editingPartner.badgeTextColor} onChange={e=>setEditingPartner({...editingPartner, badgeTextColor:e.target.value})} placeholder="Text color" className="px-2 py-1 border rounded" />
                    <input value={editingPartner.badgeBorderColor} onChange={e=>setEditingPartner({...editingPartner, badgeBorderColor:e.target.value})} placeholder="Border color" className="px-2 py-1 border rounded" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="submit" className="px-3 py-1.5 rounded bg-[#326101] text-white">Save</button>
                    <button type="button" className="px-3 py-1.5 rounded border" onClick={()=>setEditingPartner(null)}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SustainabilityAdmin

