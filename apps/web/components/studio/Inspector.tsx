'use client'

import { backgroundPresets, sectionRegistry, type ContentField } from '@katachi/renderer'
import type { Section } from '@katachi/schema'
import { useState } from 'react'
import { ColorValueField, SelectField, TextAreaField, TextField } from './fields'
import { getActivePage, useStudio } from './store'

const TABS = ['content', 'typography', 'fill', 'layout'] as const
type Tab = (typeof TABS)[number]

export function Inspector() {
  const [tab, setTab] = useState<Tab>('content')
  const config = useStudio((s) => s.config)
  const activePageId = useStudio((s) => s.activePageId)
  const selectedSectionId = useStudio((s) => s.selectedSectionId)
  if (!config) return null

  const page = getActivePage(config, activePageId)
  const section = page?.sections.find((s) => s.id === selectedSectionId)

  return (
    <aside className="flex w-72 shrink-0 flex-col border-l border-zinc-200 bg-white">
      <div className="flex border-b border-zinc-200">
        {TABS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 py-2 text-[11px] font-semibold capitalize ${
              tab === id ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-zinc-500'
            }`}
          >
            {id === 'typography' ? 'Type' : id}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {!section ? (
          <p className="mt-8 text-center text-sm text-zinc-400">Select a section to edit it.</p>
        ) : (
          <SectionPanels key={`${section.id}:${tab}`} section={section} tab={tab} themeColors={config.theme.colors} />
        )}
      </div>
    </aside>
  )
}

function SectionPanels({
  section,
  tab,
  themeColors,
}: {
  section: Section
  tab: Tab
  themeColors: Record<string, string>
}) {
  switch (tab) {
    case 'content':
      return <ContentPanel section={section} />
    case 'typography':
      return <TypographyPanel section={section} themeColors={themeColors} />
    case 'fill':
      return <FillPanel section={section} themeColors={themeColors} />
    case 'layout':
      return <LayoutPanel section={section} />
  }
}

// ---------- Content (registry-driven, §15.3) ----------

function ContentPanel({ section }: { section: Section }) {
  const definition = sectionRegistry[section.type]
  const updateSection = useStudio((s) => s.updateSection)
  if (!definition) {
    return <p className="text-sm text-zinc-400">Unknown section type “{section.type}”.</p>
  }

  const setProp = (key: string, value: unknown) =>
    updateSection(section.id, (s) => {
      s.props[key] = value
    })

  return (
    <div className="flex flex-col gap-3">
      {definition.contentFields.map((field) => (
        <ContentFieldInput key={field.key} field={field} section={section} setProp={setProp} />
      ))}
    </div>
  )
}

function ContentFieldInput({
  field,
  section,
  setProp,
}: {
  field: ContentField
  section: Section
  setProp: (key: string, value: unknown) => void
}) {
  if (field.kind === 'list') {
    return <ListFieldEditor field={field} section={section} />
  }
  const raw = section.props[field.key]
  const value = typeof raw === 'string' ? raw : ''
  return field.kind === 'text' ? (
    <TextField label={field.label} value={value} onChange={(v) => setProp(field.key, v)} />
  ) : (
    <TextAreaField label={field.label} value={value} onChange={(v) => setProp(field.key, v)} />
  )
}

type ListContentField = Extract<ContentField, { kind: 'list' }>

function ListFieldEditor({ field, section }: { field: ListContentField; section: Section }) {
  const updateSection = useStudio((s) => s.updateSection)
  const raw = section.props[field.key]
  const listField = field
  const items = Array.isArray(raw) ? (raw as Array<Record<string, unknown>>) : []
  const mutateItems = (mutate: (items: Array<Record<string, unknown>>) => void) =>
    updateSection(section.id, (s) => {
      if (!Array.isArray(s.props[listField.key])) s.props[listField.key] = []
      mutate(s.props[listField.key] as Array<Record<string, unknown>>)
    })

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-zinc-500">{listField.label}</span>
      {items.map((item, index) => (
        <div key={(item.id as string) || index} className="rounded-lg border border-zinc-200 p-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="truncate text-xs font-semibold text-zinc-600">
              {String(item[listField.itemLabelKey] ?? `Item ${index + 1}`)}
            </span>
            <button
              type="button"
              onClick={() => mutateItems((list) => list.splice(index, 1))}
              className="text-xs text-zinc-400 hover:text-red-600"
            >
              remove
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {listField.itemFields.map((itemField) => {
              const itemValue =
                typeof item[itemField.key] === 'string' ? (item[itemField.key] as string) : ''
              const onChange = (v: string) =>
                mutateItems((list) => {
                  const target = list[index]
                  if (target) target[itemField.key] = v
                })
              return itemField.kind === 'text' ? (
                <TextField key={itemField.key} label={itemField.label} value={itemValue} onChange={onChange} />
              ) : (
                <TextAreaField key={itemField.key} label={itemField.label} value={itemValue} rows={3} onChange={onChange} />
              )
            })}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => mutateItems((list) => list.push(listField.createItem()))}
        className="rounded-md border border-dashed border-zinc-300 py-1.5 text-xs font-medium text-zinc-500 hover:border-indigo-400 hover:text-indigo-600"
      >
        + Add
      </button>
    </div>
  )
}

// ---------- Typography / Fill / Layout (StyleOverrides subset, Phase 1) ----------

function useStyleSetter(sectionId: string) {
  const updateSection = useStudio((s) => s.updateSection)
  return function setStyle(mutate: (style: NonNullable<Section['style']>) => void) {
    updateSection(sectionId, (s) => {
      s.style ??= {}
      mutate(s.style)
    })
  }
}

function TypographyPanel({ section, themeColors }: { section: Section; themeColors: Record<string, string> }) {
  const setStyle = useStyleSetter(section.id)
  const style = section.style ?? {}

  return (
    <div className="flex flex-col gap-3">
      <SelectField
        label="Font family"
        value={style.fontFamily ?? ''}
        options={[
          { value: '', label: 'Inherit (body)' },
          { value: 'heading', label: 'Heading' },
          { value: 'body', label: 'Body' },
          { value: 'mono', label: 'Mono' },
        ]}
        onChange={(v) =>
          setStyle((s) => {
            if (v === '') delete s.fontFamily
            else s.fontFamily = v as 'heading' | 'body' | 'mono'
          })
        }
      />
      <TextField
        label="Font size (CSS)"
        value={style.fontSize ?? ''}
        placeholder="inherit, e.g. 18px or var(--text-lg)"
        onChange={(v) =>
          setStyle((s) => {
            if (v === '') delete s.fontSize
            else s.fontSize = v
          })
        }
      />
      <SelectField
        label="Font weight"
        value={style.fontWeight !== undefined ? String(style.fontWeight) : ''}
        options={[
          { value: '', label: 'Inherit' },
          ...['400', '500', '600', '700', '800'].map((w) => ({ value: w, label: w })),
        ]}
        onChange={(v) =>
          setStyle((s) => {
            if (v === '') delete s.fontWeight
            else s.fontWeight = Number(v)
          })
        }
      />
      <SelectField
        label="Text align"
        value={style.textAlign ?? ''}
        options={[
          { value: '', label: 'Inherit' },
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ]}
        onChange={(v) =>
          setStyle((s) => {
            if (v === '') delete s.textAlign
            else s.textAlign = v as 'left' | 'center' | 'right'
          })
        }
      />
      <ColorValueField
        label="Text color"
        value={style.color}
        themeColors={themeColors}
        onChange={(v) =>
          setStyle((s) => {
            if (v === undefined) delete s.color
            else s.color = v
          })
        }
      />
    </div>
  )
}

function FillPanel({ section, themeColors }: { section: Section; themeColors: Record<string, string> }) {
  const setStyle = useStyleSetter(section.id)
  const updateSection = useStudio((s) => s.updateSection)
  const style = section.style ?? {}

  const activePreset = (section.background?.length ?? 0) > 0 ? undefined : 'none'

  return (
    <div className="flex flex-col gap-3">
      <ColorValueField
        label="Background color"
        value={style.background}
        themeColors={themeColors}
        onChange={(v) =>
          setStyle((s) => {
            if (v === undefined) delete s.background
            else s.background = v
          })
        }
      />
      <SelectField
        label="Background preset (§10)"
        value={activePreset ?? ''}
        options={[
          { value: 'none', label: 'None' },
          ...backgroundPresets.map((preset) => ({ value: preset.id, label: preset.label })),
        ]}
        onChange={(id) =>
          updateSection(section.id, (s) => {
            if (id === 'none') delete s.background
            else {
              const preset = backgroundPresets.find((p) => p.id === id)
              if (preset) s.background = preset.create()
            }
          })
        }
      />
      {(section.background?.length ?? 0) > 0 ? (
        <p className="text-xs text-zinc-400">
          {section.background!.length} background layer(s) applied. Layer stacking UI lands in
          Phase 3.
        </p>
      ) : null}
    </div>
  )
}

function LayoutPanel({ section }: { section: Section }) {
  const setStyle = useStyleSetter(section.id)
  const style = section.style ?? {}
  const padding = style.padding ?? {}

  const sideSetter = (side: 'top' | 'right' | 'bottom' | 'left') => (v: string) =>
    setStyle((s) => {
      s.padding ??= {}
      if (v === '') delete s.padding[side]
      else s.padding[side] = v
    })

  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-medium text-zinc-500">Padding (CSS per side)</span>
      <div className="grid grid-cols-2 gap-2">
        <TextField label="Top" value={padding.top ?? ''} placeholder="auto" onChange={sideSetter('top')} />
        <TextField label="Right" value={padding.right ?? ''} placeholder="auto" onChange={sideSetter('right')} />
        <TextField label="Bottom" value={padding.bottom ?? ''} placeholder="auto" onChange={sideSetter('bottom')} />
        <TextField label="Left" value={padding.left ?? ''} placeholder="auto" onChange={sideSetter('left')} />
      </div>
      <TextField
        label="Min height (CSS)"
        value={style.minHeight ?? ''}
        placeholder="e.g. 60vh"
        onChange={(v) =>
          setStyle((s) => {
            if (v === '') delete s.minHeight
            else s.minHeight = v
          })
        }
      />
      <TextField
        label="Gap (CSS)"
        value={style.gap ?? ''}
        placeholder="e.g. var(--space-3)"
        onChange={(v) =>
          setStyle((s) => {
            if (v === '') delete s.gap
            else s.gap = v
          })
        }
      />
      <SelectField
        label="Align"
        value={style.align ?? ''}
        options={[
          { value: '', label: 'Default' },
          { value: 'start', label: 'Start' },
          { value: 'center', label: 'Center' },
          { value: 'end', label: 'End' },
        ]}
        onChange={(v) =>
          setStyle((s) => {
            if (v === '') delete s.align
            else s.align = v as 'start' | 'center' | 'end'
          })
        }
      />
    </div>
  )
}
