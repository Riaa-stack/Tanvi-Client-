import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { syllabusApi } from '@/api/syllabus.api'
import { subjectsApi } from '@/api/subjects.api'
import { queryKeys } from '@/config/queryClient'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/forms/FormField'
import { Save, Plus, Trash2, GripVertical, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { Unit } from '@/types/models'

// Temporary unique ID generator for UI before backend sync
const uid = () => Math.random().toString(36).substr(2, 9)

export default function SyllabusEditorPage() {
  const { subjectId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: subject } = useQuery({
    queryKey: queryKeys.subjects.detail(subjectId!),
    queryFn: () => subjectsApi.detail(subjectId!).then(r => r.data.data),
    enabled: !!subjectId,
  })

  const { data: syllabus } = useQuery({
    queryKey: queryKeys.subjects.syllabus(subjectId!),
    queryFn: () => syllabusApi.get(subjectId!).then(r => r.data.data),
    enabled: !!subjectId,
  })

  const [units, setUnits] = useState<any[]>([])
  
  useEffect(() => {
    if (syllabus?.units) {
      // Deep clone to safely edit locally
      setUnits(JSON.parse(JSON.stringify(syllabus.units)))
    }
  }, [syllabus])

  const saveMutation = useMutation({
    mutationFn: (newUnits: any[]) => syllabusApi.replace(subjectId!, newUnits),
    onSuccess: () => {
      toast.success('Syllabus updated successfully')
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects.syllabus(subjectId!) })
    },
    onError: () => toast.error('Failed to save syllabus')
  })

  const addUnit = () => {
    const nextNumber = units.length > 0 ? Math.max(...units.map(u => u.unit_number)) + 1 : 1
    setUnits([...units, { id: `temp-${uid()}`, unit_number: nextNumber, title: 'New Unit', topics: [] }])
  }

  const deleteUnit = (unitIdx: number) => {
    const newUnits = [...units]
    newUnits.splice(unitIdx, 1)
    setUnits(newUnits)
  }

  const updateUnitTitle = (unitIdx: number, title: string) => {
    const newUnits = [...units]
    newUnits[unitIdx].title = title
    setUnits(newUnits)
  }

  const addTopic = (unitIdx: number, name: string) => {
    if (!name.trim()) return
    const newUnits = [...units]
    if (!newUnits[unitIdx].topics) newUnits[unitIdx].topics = []
    newUnits[unitIdx].topics.push({ id: `temp-${uid()}`, name, is_important: false })
    setUnits(newUnits)
  }

  const toggleTopicImportance = (unitIdx: number, topicIdx: number) => {
    const newUnits = [...units]
    newUnits[unitIdx].topics[topicIdx].is_important = !newUnits[unitIdx].topics[topicIdx].is_important
    setUnits(newUnits)
  }

  const deleteTopic = (unitIdx: number, topicIdx: number) => {
    const newUnits = [...units]
    newUnits[unitIdx].topics.splice(topicIdx, 1)
    setUnits(newUnits)
  }

  return (
    <div className="h-[calc(100vh-var(--header-height)-3rem)] flex flex-col">
      <PageHeader 
        title="Syllabus Editor" 
        subtitle={subject?.name}
        breadcrumbs={[
          { label: 'Subjects', href: '/admin/subjects' },
          { label: 'Syllabus Editor' }
        ]}
        actions={
          <Button className="gap-2" onClick={() => saveMutation.mutate(units)} isLoading={saveMutation.isPending}>
            <Save size={16} /> Save Full Syllabus
          </Button>
        }
      />

      <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-base overflow-y-auto bg-surface-sunken">
          <div className="p-4 bg-surface-card border-b border-default sticky top-0 z-10 flex justify-between items-center">
            <h3 className="font-bold">Editor</h3>
            <Button size="sm" onClick={addUnit} variant="secondary" className="gap-2"><Plus size={14}/> Add Unit</Button>
          </div>
          <div className="p-4 space-y-4">
            {units.map((unit, uIdx) => (
              <div key={unit.id || uIdx} className="bg-surface-card border border-default rounded-md p-4">
                <div className="flex gap-4 items-start mb-4">
                  <div className="mt-2 text-muted cursor-move"><GripVertical size={16} /></div>
                  <div className="flex-1">
                    <FormField label={`Unit ${unit.unit_number} Title`}>
                      <div className="flex gap-2">
                        <input 
                          value={unit.title} 
                          onChange={(e) => updateUnitTitle(uIdx, e.target.value)}
                          className="h-[var(--input-height)] flex-1 px-3 rounded-[var(--input-radius)] border border-default bg-[var(--input-bg)] focus-ring"
                        />
                        <Button variant="ghost" className="text-danger hover:bg-danger-bg hover:text-danger" onClick={() => deleteUnit(uIdx)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </FormField>
                  </div>
                </div>

                <div className="pl-8 space-y-2">
                  <h4 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">Topics</h4>
                  {unit.topics?.map((topic: any, tIdx: number) => (
                    <div key={topic.id || tIdx} className="flex items-center gap-2 bg-surface-page border border-default rounded px-3 py-1.5">
                      <span className="flex-1 text-sm">{topic.name}</span>
                      <button onClick={() => toggleTopicImportance(uIdx, tIdx)} className={`p-1 rounded hover:bg-surface-sunken ${topic.is_important ? 'text-warning' : 'text-muted'}`}>
                        <Star size={14} fill={topic.is_important ? "currentColor" : "none"} />
                      </button>
                      <button onClick={() => deleteTopic(uIdx, tIdx)} className="p-1 rounded hover:bg-surface-sunken text-danger">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  
                  <div className="pt-2">
                    <input 
                      type="text" 
                      placeholder="Type topic and press Enter..." 
                      className="h-8 w-full px-3 text-sm rounded border border-default bg-[var(--input-bg)] focus-ring"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addTopic(uIdx, (e.target as HTMLInputElement).value)
                          ;(e.target as HTMLInputElement).value = ''
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-base overflow-y-auto">
          <div className="p-4 border-b border-default sticky top-0 bg-surface-card z-10">
            <h3 className="font-bold">Live Tree Preview</h3>
          </div>
          <div className="p-6">
            <ul className="space-y-4 border-l-2 border-border-default ml-2 pl-4">
              {units.map((unit) => (
                <li key={unit.id} className="relative">
                  <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-brand-primary"></div>
                  <h4 className="font-bold text-primary mb-2">Unit {unit.unit_number}: {unit.title}</h4>
                  <ul className="space-y-1 pl-4 border-l-2 border-border-default ml-2 mb-4">
                    {unit.topics?.map((topic: any) => (
                      <li key={topic.id} className="relative text-sm text-secondary py-1 flex items-center gap-2">
                        <div className="absolute -left-[21px] top-[10px] w-2 h-2 rounded-full bg-surface-strong border border-default"></div>
                        {topic.name}
                        {topic.is_important && <Star size={12} className="text-warning" fill="currentColor" />}
                      </li>
                    ))}
                    {(!unit.topics || unit.topics.length === 0) && (
                      <li className="text-sm text-muted italic ml-4">No topics</li>
                    )}
                  </ul>
                </li>
              ))}
              {units.length === 0 && (
                <div className="text-secondary italic">Empty syllabus</div>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}