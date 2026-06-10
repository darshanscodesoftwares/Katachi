'use client'

import type { ColorValue } from '@katachi/schema'
import type { ReactNode } from 'react'

export function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-zinc-500">{label}</span>
      {children}
    </label>
  )
}

const inputClass =
  'w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-300'

export function TextField(props: {
  label: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
}) {
  return (
    <FieldRow label={props.label}>
      <input
        type="text"
        className={inputClass}
        value={props.value}
        placeholder={props.placeholder}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </FieldRow>
  )
}

export function TextAreaField(props: {
  label: string
  value: string
  rows?: number
  onChange: (value: string) => void
}) {
  return (
    <FieldRow label={props.label}>
      <textarea
        className={inputClass}
        rows={props.rows ?? 4}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </FieldRow>
  )
}

export function NumberField(props: {
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
}) {
  return (
    <FieldRow label={props.label}>
      <input
        type="number"
        className={inputClass}
        value={props.value}
        min={props.min}
        max={props.max}
        step={props.step}
        onChange={(e) => {
          const parsed = Number(e.target.value)
          if (!Number.isNaN(parsed)) props.onChange(parsed)
        }}
      />
    </FieldRow>
  )
}

export function SelectField(props: {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
}) {
  return (
    <FieldRow label={props.label}>
      <select
        className={inputClass}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      >
        {props.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldRow>
  )
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/

/** Hex swatch + free-text CSS color, e.g. theme palette entries. */
export function ColorInput(props: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <FieldRow label={props.label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${props.label} picker`}
          className="h-8 w-9 shrink-0 cursor-pointer rounded border border-zinc-300 bg-white p-0.5"
          value={HEX_RE.test(props.value) ? props.value : '#000000'}
          onChange={(e) => props.onChange(e.target.value)}
        />
        <input
          type="text"
          className={inputClass}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
        />
      </div>
    </FieldRow>
  )
}

const TOKEN_SWATCHES = ['primary', 'secondary', 'accent', 'surface', 'background', 'text'] as const

/**
 * ColorValue editor: raw CSS string, or a theme token ref via the swatch row
 * (token refs keep the node re-themable, §7).
 */
export function ColorValueField(props: {
  label: string
  value: ColorValue | undefined
  themeColors: Record<string, string>
  onChange: (value: ColorValue | undefined) => void
}) {
  const display =
    props.value === undefined ? '' : typeof props.value === 'string' ? props.value : `{${props.value.token}}`
  const activeToken =
    props.value !== undefined && typeof props.value !== 'string' ? props.value.token : null

  return (
    <FieldRow label={props.label}>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          {TOKEN_SWATCHES.map((key) => (
            <button
              key={key}
              type="button"
              title={`colors.${key}`}
              onClick={() => props.onChange({ token: `colors.${key}` })}
              className={`h-6 w-6 rounded-full border ${
                activeToken === `colors.${key}`
                  ? 'border-indigo-600 ring-2 ring-indigo-300'
                  : 'border-zinc-300'
              }`}
              style={{ background: props.themeColors[key] }}
            />
          ))}
          {props.value !== undefined ? (
            <button
              type="button"
              onClick={() => props.onChange(undefined)}
              className="ml-auto text-xs text-zinc-400 hover:text-zinc-600"
            >
              clear
            </button>
          ) : null}
        </div>
        <input
          type="text"
          className={inputClass}
          placeholder="inherit / #hex / css color"
          value={display}
          onChange={(e) => {
            const raw = e.target.value
            props.onChange(raw === '' ? undefined : raw)
          }}
        />
      </div>
    </FieldRow>
  )
}
