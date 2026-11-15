import { useRef, useState, useMemo } from 'react'
import * as XLSX from 'xlsx'
import type { CardData, FieldType } from './types'
import { CardFace } from './CardFace'

type Props = {
  baseCard: CardData
  onImport: (cards: CardData[]) => void
  onClose: () => void
}

type ParsedRow = string[]
type ColumnMap = { index: number; header: string; field: FieldType | null }

type ValidationIssue = {
  row: number
  field: FieldType | null
  level: 'error' | 'warning'
  message: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[+]?[\d\s().-]{6,}$/

const FIELD_COLUMNS: { key: FieldType; label: string; aliases: string[] }[] = [
  { key: 'firstName',  label: 'Prénom',       aliases: ['firstname', 'prenom', 'first_name', 'given_name', 'first name', 'first'] },
  { key: 'lastName',   label: 'Nom',          aliases: ['lastname', 'nom_de_famille', 'last_name', 'family_name', 'last name', 'last', 'surname', 'nom'] },
  { key: 'jobTitle',   label: 'Poste',        aliases: ['jobtitle', 'job_title', 'titre', 'fonction', 'poste', 'role', 'metier', 'position', 'title'] },
  { key: 'company',    label: 'Entreprise',   aliases: ['company', 'entreprise', 'societe', 'société', 'organization', 'organisation', 'org', 'firm'] },
  { key: 'department', label: 'Département',  aliases: ['department', 'departement', 'département', 'service', 'division', 'divizion', 'dept'] },
  { key: 'phone',      label: 'Téléphone',    aliases: ['phone', 'telephone', 'téléphone', 'tel', 'mobile', 'portable', 'phone_number', 'tel_number', 'num', 'gsm'] },
  { key: 'email',      label: 'Email',        aliases: ['email', 'mail', 'e_mail', 'courriel', 'e-mail', 'mail_address'] },
  { key: 'website',    label: 'Site web',     aliases: ['website', 'site', 'site_web', 'site web', 'url', 'web', 'siteweb', 'homepage'] },
  { key: 'address',    label: 'Adresse',      aliases: ['address', 'adresse', 'location', 'rue', 'street', 'adresse_postale', 'adr'] },
  { key: 'tagline',    label: 'Slogan',       aliases: ['tagline', 'slogan', 'accroche', 'motto', 'catchphrase', 'phrase'] },
  { key: 'slogan',     label: 'Accroche',     aliases: ['slogan2', 'accroche2', 'sub_title'] },
]

/* =========================================================================
   CSV PARSER — handles comma, semicolon, tab, with quoted fields
   ========================================================================= */
function detectDelimiter(text: string): string {
  const firstLine = text.split('\n')[0] || ''
  const counts = {
    ',': (firstLine.match(/,/g) || []).length,
    ';': (firstLine.match(/;/g) || []).length,
    '\t': (firstLine.match(/\t/g) || []).length,
  }
  const max = Math.max(counts[','], counts[';'], counts['\t'])
  if (max === 0) return ','
  if (max === counts[';']) return ';'
  if (max === counts['\t']) return '\t'
  return ','
}

function parseCsv(text: string): string[][] {
  const delimiter = detectDelimiter(text)
  const rows: string[][] = []
  let current: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ }
        else inQuotes = false
      } else { field += char }
    } else {
      if (char === '"') inQuotes = true
      else if (char === delimiter) { current.push(field); field = '' }
      else if (char === '\n') { current.push(field); rows.push(current); current = []; field = '' }
      else if (char === '\r') { /* skip */ }
      else field += char
    }
  }
  if (field.length > 0 || current.length > 0) { current.push(field); rows.push(current) }
  return rows.filter((r) => r.some((c) => c.trim() !== ''))
}

/* =========================================================================
   EXCEL PARSER — uses SheetJS to read .xlsx/.xls files as ArrayBuffer
   ========================================================================= */
function parseExcel(buffer: ArrayBuffer): string[][] {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) return []
  const sheet = workbook.Sheets[sheetName]
  const jsonRows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: '', blankrows: false })
  return jsonRows.map((row) => (Array.isArray(row) ? row.map((c) => String(c ?? '').trim()) : [String(row ?? '').trim()]))
}

/* =========================================================================
   COLUMN AUTO-MAPPING
   ========================================================================= */
function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function normalizeHeader(s: string): string {
  return stripAccents(s.trim().toLowerCase()).replace(/[\s_-]+/g, ' ')
}

function autoMapColumns(headers: string[]): ColumnMap[] {
  return headers.map((rawHeader, index) => {
    const header = normalizeHeader(rawHeader)
    let bestMatch: FieldType | null = null
    let bestScore = 0

    // Pass 1: exact matches (highest priority)
    for (const fc of FIELD_COLUMNS) {
      for (const alias of fc.aliases) {
        const normalizedAlias = normalizeHeader(alias)
        if (header === normalizedAlias && bestScore < 100) {
          bestMatch = fc.key
          bestScore = 100
        }
      }
    }

    // Pass 2: whole-word partial matches (medium priority)
    if (bestScore < 80) {
      const headerWords = header.split(' ')
      for (const fc of FIELD_COLUMNS) {
        for (const alias of fc.aliases) {
          const normalizedAlias = normalizeHeader(alias)
          const aliasWords = normalizedAlias.split(' ')
          const allWordsMatch = aliasWords.every((aw) => headerWords.includes(aw))
          if (allWordsMatch && aliasWords.length > 0 && bestScore < 80) {
            bestMatch = fc.key
            bestScore = 80
          }
        }
      }
    }

    // Pass 3: substring matches (lowest priority, only if no better match)
    if (bestScore < 50) {
      for (const fc of FIELD_COLUMNS) {
        for (const alias of fc.aliases) {
          const normalizedAlias = normalizeHeader(alias)
          if (normalizedAlias.length >= 4 && header.includes(normalizedAlias) && bestScore < 50) {
            bestMatch = fc.key
            bestScore = 50
          }
        }
      }
    }

    return { index, header: rawHeader || `Colonne ${index + 1}`, field: bestMatch }
  })
}

function rowsToObjects(rows: string[][], columnCount: number): ParsedRow[] {
  return rows.map((row) => Array.from({ length: columnCount }, (_, index) => (row[index] ?? '').trim()))
}

function findHeaderRow(parsed: string[][]): number {
  const scanLimit = Math.min(parsed.length, 10)
  let bestIndex = 0
  let bestScore = -1

  for (let index = 0; index < scanLimit; index++) {
    const score = autoMapColumns(parsed[index]).filter((column) => column.field !== null).length
    if (score > bestScore) {
      bestScore = score
      bestIndex = index
    }
  }

  return bestIndex
}

/* =========================================================================
   COMPONENT
   ========================================================================= */
type ParseState = 'idle' | 'parsing' | 'done' | 'error'

export function CsvImport({ baseCard, onImport, onClose }: Props) {
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [columns, setColumns] = useState<ColumnMap[]>([])
  const [fileName, setFileName] = useState('')
  const [parseState, setParseState] = useState<ParseState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [previewPage, setPreviewPage] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  const PREVIEW_PER_PAGE = 15

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setParseState('parsing')
    setErrorMsg('')
    setFileName(file.name)

    try {
      const isExcel = file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')
      let parsed: string[][]

      if (isExcel) {
        const buffer = await file.arrayBuffer()
        parsed = parseExcel(buffer)
      } else {
        const text = await file.text()
        parsed = parseCsv(text)
      }

      if (parsed.length < 2) {
        setParseState('error')
        setErrorMsg('Le fichier ne contient pas assez de données. Assurez-vous d\'avoir une ligne d\'en-tête et au moins une ligne de données.')
        setRows([])
        setColumns([])
        return
      }

      const headerRowIndex = findHeaderRow(parsed)
      const headers = parsed[headerRowIndex].map((h) => h.trim())
      const dataRows = parsed.slice(headerRowIndex + 1)
      if (headers.every((header) => !header)) {
        setParseState('error')
        setErrorMsg('Impossible de trouver une ligne d’en-têtes exploitable dans ce fichier.')
        setRows([])
        setColumns([])
        return
      }
      const mapped = autoMapColumns(headers)
      const parsedRows = rowsToObjects(dataRows, headers.length)

      const mappedCount = mapped.filter((m) => m.field !== null).length
      if (mappedCount === 0) {
        setParseState('error')
        setErrorMsg('Aucune colonne reconnue automatiquement. Utilisez les menus déroulants ci-dessous pour associer manuellement vos colonnes aux champs de la carte.')
        setColumns(mapped)
        setRows(parsedRows)
        setPreviewPage(0)
        return
      }

      setColumns(mapped)
      setRows(parsedRows)
      setPreviewPage(0)
      setParseState('done')
    } catch (err) {
      console.error('Import error:', err)
      setParseState('error')
      setErrorMsg('Impossible de lire le fichier. Vérifiez le format (CSV, XLSX ou XLS valide).')
      setRows([])
      setColumns([])
    }
  }

  const updateMapping = (index: number, field: FieldType | null) => {
    setColumns((prev) => prev.map((c) => (c.index === index ? { ...c, field } : c)))
  }

  const mappedFields = useMemo(() => {
    return columns.filter((c) => c.field !== null).map((c) => c.field as FieldType)
  }, [columns])

  const duplicateFields = useMemo(() => {
    const seen = new Set<FieldType>()
    const dups = new Set<FieldType>()
    for (const f of mappedFields) {
      if (seen.has(f)) dups.add(f)
      seen.add(f)
    }
    return Array.from(dups)
  }, [mappedFields])

  const validRows = useMemo(() => {
    return rows.filter((row) => {
      return columns.some((col) => col.field && (row[col.index] || '').trim() !== '')
    })
  }, [rows, columns])

  const validationIssues = useMemo(() => {
    const issues: ValidationIssue[] = []
    const mappedFieldToCol = new Map<FieldType, ColumnMap>()
    for (const col of columns) {
      if (col.field) mappedFieldToCol.set(col.field, col)
    }
    rows.forEach((row, rowIndex) => {
      const hasAnyData = columns.some((col) => col.field && (row[col.index] || '').trim() !== '')
      if (!hasAnyData) return

      for (const [field, col] of mappedFieldToCol) {
        const val = (row[col.index] ?? '').trim()
        if (!val) {
          if (field === 'firstName' || field === 'lastName') {
            issues.push({ row: rowIndex, field, level: 'warning', message: `Ligne ${rowIndex + 2}: ${FIELD_COLUMNS.find((fc) => fc.key === field)?.label} manquant` })
          }
          continue
        }
        if (field === 'email' && !EMAIL_RE.test(val)) {
          issues.push({ row: rowIndex, field, level: 'error', message: `Ligne ${rowIndex + 2}: email invalide « ${val} »` })
        }
        if (field === 'phone' && !PHONE_RE.test(val)) {
          issues.push({ row: rowIndex, field, level: 'warning', message: `Ligne ${rowIndex + 2}: téléphone douteux « ${val} » — vérifiez l'indicatif` })
        }
        if (field === 'website' && val && !val.startsWith('http') && !val.includes('.')) {
          issues.push({ row: rowIndex, field, level: 'warning', message: `Ligne ${rowIndex + 2}: site web incomplet « ${val} »` })
        }
      }
    })
    return issues
  }, [rows, columns])

  const errorCount = validationIssues.filter((i) => i.level === 'error').length
  const warningCount = validationIssues.filter((i) => i.level === 'warning').length

  const previewCard = useMemo(() => {
    if (validRows.length === 0) return null
    const row = validRows[0]
    const card: CardData = JSON.parse(JSON.stringify(baseCard))
    card.id = 'preview-card'
    const mappedFieldToCol = new Map<FieldType, ColumnMap>()
    for (const col of columns) {
      if (col.field) mappedFieldToCol.set(col.field, col)
    }
    for (const [field, col] of mappedFieldToCol) {
      const value = (row[col.index] ?? '').trim()
      card.fields[field] = value
      if (value && card.fieldStyles[field]) {
        card.fieldStyles[field]!.visible = true
      }
    }
    return card
  }, [validRows, columns, baseCard])

  const generate = () => {
    if (validRows.length === 0) return

    // Build the set of fields that the file provides. Only these will be
    // overwritten per-row; everything else keeps the template's value.
    const mappedFieldToCol = new Map<FieldType, ColumnMap>()
    for (const col of columns) {
      if (col.field) mappedFieldToCol.set(col.field, col)
    }

    const newCards: CardData[] = validRows.map((row) => {
      const card: CardData = JSON.parse(JSON.stringify(baseCard))
      card.id = crypto.randomUUID()

      // Overwrite only the fields that come from the file. Fields absent from
      // the file (e.g. company, website, address) keep whatever the template
      // card already has — so they stay consistent across all employees
      // without being hardcoded.
      for (const [field, col] of mappedFieldToCol) {
        const value = (row[col.index] ?? '').trim()
        card.fields[field] = value
        if (value && card.fieldStyles[field]) {
          card.fieldStyles[field]!.visible = true
        }
      }

      return card
    })
    onImport(newCards)
    onClose()
  }

  const reset = () => {
    setRows([])
    setColumns([])
    setFileName('')
    setParseState('idle')
    setErrorMsg('')
    setPreviewPage(0)
    if (fileRef.current) fileRef.current.value = ''
  }

  const previewRows = rows.slice(previewPage * PREVIEW_PER_PAGE, (previewPage + 1) * PREVIEW_PER_PAGE)
  const totalPages = Math.ceil(rows.length / PREVIEW_PER_PAGE)

  const showData = rows.length > 0 && columns.length > 0
  const hasData = showData && validRows.length > 0

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Import en masse (CSV / Excel)</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Importez une liste de contacts pour créer toutes les cartes d'un coup</p>
          </div>
          <button type="button" onClick={onClose} className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors flex items-center justify-center">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto panel-scroll p-6">
          {/* Upload zone */}
          {!showData && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.txt,.xlsx,.xls"
                className="hidden"
                onChange={handleFile}
              />
              <div
                className="w-full max-w-md border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 flex flex-col items-center gap-4 cursor-pointer transition-colors hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => fileRef.current?.click()}
              >
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl">
                  {parseState === 'parsing' ? (
                    <span className="animate-spin text-slate-400 dark:text-slate-500 text-xl">⟳</span>
                  ) : parseState === 'error' ? (
                    <span className="text-amber-500">⚠</span>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500">📁</span>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {parseState === 'parsing' ? 'Lecture du fichier…' : 'Cliquez pour choisir un fichier'}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Formats acceptés : CSV, XLSX, XLS</p>
                </div>
              </div>

              {parseState === 'error' && errorMsg && (
                <div className="w-full max-w-md rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-900/40 px-4 py-3 text-xs text-amber-800 dark:text-amber-400">
                  {errorMsg}
                </div>
              )}

              <div className="w-full max-w-md text-xs text-slate-400 dark:text-slate-500 space-y-2">
                <p className="font-medium text-slate-500 dark:text-slate-400">Format attendu :</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Première ligne = en-têtes de colonnes (prénom, nom, téléphone, email…)</li>
                  <li>Lignes suivantes = une personne par ligne</li>
                  <li>Les colonnes sont reconnues automatiquement (français et anglais)</li>
                  <li>Vous pouvez ajuster manuellement les correspondances après l'import</li>
                </ul>
              </div>
            </div>
          )}

          {/* Data view */}
          {showData && (
            <div className="flex flex-col gap-5">
              {/* File info bar */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-medium">{fileName}</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span>{rows.length} lignes détectées</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className={validRows.length === rows.length ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                    {validRows.length} valide{validRows.length > 1 ? 's' : ''}
                  </span>
                </div>
                <button type="button" onClick={reset} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 underline">
                  Changer de fichier
                </button>
              </div>

              {/* Validation warnings */}
              {duplicateFields.length > 0 && (
                <div className="rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-900/40 px-4 py-3 text-xs text-amber-800 dark:text-amber-400">
                  <span className="font-medium">Attention :</span> Plusieurs colonnes sont associées au même champ ({duplicateFields.map((f) => FIELD_COLUMNS.find((fc) => fc.key === f)?.label).join(', ')}). La dernière colonne associée sera utilisée.
                </div>
              )}
              {validRows.length === 0 && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900/40 px-4 py-3 text-xs text-red-800 dark:text-red-400">
                  Aucune ligne ne contient de données exploitables. Vérifiez les correspondances ci-dessous ou choisissez un autre fichier.
                </div>
              )}
              {parseState === 'error' && errorMsg && (
                <div className="rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-900/40 px-4 py-3 text-xs text-amber-800 dark:text-amber-400">
                  {errorMsg}
                </div>
              )}

              {/* Column mapping */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Correspondance des colonnes</h3>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{mappedFields.length} / {columns.length} associée{mappedFields.length > 1 ? 's' : ''}</span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Chaque ligne représente une colonne de votre fichier. Choisissez le champ correspondant à droite.</p>
                </div>
                <div className="p-3 max-h-80 overflow-y-auto panel-scroll space-y-2">
                  {columns.map((col) => (
                    <div key={col.index} className="grid grid-cols-[minmax(0,1fr)_180px] items-center gap-3 rounded-lg border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-slate-100 dark:bg-slate-700 text-[10px] font-semibold text-slate-500 dark:text-slate-400">{col.index + 1}</span>
                          <span className="truncate text-xs font-semibold text-slate-700 dark:text-slate-300" title={col.header}>{col.header}</span>
                        </div>
                        <p className="mt-1 truncate pl-7 text-[11px] text-slate-400 dark:text-slate-500" title={rows[0]?.[col.index] || 'Aucune valeur'}>
                          Exemple : {rows[0]?.[col.index] || 'Aucune valeur'}
                        </p>
                      </div>
                      <select
                        value={col.field ?? ''}
                        onChange={(e) => updateMapping(col.index, (e.target.value || null) as FieldType | null)}
                        className={`input w-full min-w-0 text-xs ${col.field ? 'border-slate-900 dark:border-indigo-500 bg-slate-50 dark:bg-slate-700' : ''}`}
                      >
                        <option value="">Ignorer</option>
                        {FIELD_COLUMNS.map((fc) => (
                          <option key={fc.key} value={fc.key}>{fc.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Validation alerts */}
              {(errorCount > 0 || warningCount > 0) && (
                <div className="flex flex-col gap-2">
                  {errorCount > 0 && (
                    <div className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900/40 px-4 py-3">
                      <p className="text-xs font-medium text-red-800 dark:text-red-400 mb-1">{errorCount} erreur(s) à corriger</p>
                      <ul className="text-[11px] text-red-700 dark:text-red-500 space-y-0.5 max-h-24 overflow-y-auto">
                        {validationIssues.filter((i) => i.level === 'error').slice(0, 10).map((iss, i) => (
                          <li key={i}>{iss.message}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {warningCount > 0 && (
                    <div className="rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-900/40 px-4 py-3">
                      <p className="text-xs font-medium text-amber-800 dark:text-amber-400 mb-1">{warningCount} avertissement(s)</p>
                      <ul className="text-[11px] text-amber-700 dark:text-amber-500 space-y-0.5 max-h-24 overflow-y-auto">
                        {validationIssues.filter((i) => i.level === 'warning').slice(0, 10).map((iss, i) => (
                          <li key={i}>{iss.message}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Visual preview */}
              {previewCard && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Aperçu visuel</h3>
                    <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">Mini-carte générée avec les données de la première ligne valide</p>
                  </div>
                  <div className="p-4 flex justify-center bg-slate-50 dark:bg-slate-800/50">
                    <div style={{ transform: 'scale(0.5)', transformOrigin: 'center', margin: '-60px -90px' }}>
                      <CardFace card={previewCard} face="front" />
                    </div>
                  </div>
                </div>
              )}

              {/* Preview table */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Aperçu des données</h3>
                    <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">Vérifiez les valeurs avant de générer les cartes.</p>
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewPage((p) => Math.max(0, p - 1))}
                        disabled={previewPage === 0}
                        className="px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-600 disabled:opacity-30 hover:border-slate-400 dark:hover:border-slate-500"
                      >
                        ‹
                      </button>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Page {previewPage + 1} / {totalPages}</span>
                      <button
                        type="button"
                        onClick={() => setPreviewPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={previewPage >= totalPages - 1}
                        className="px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-600 disabled:opacity-30 hover:border-slate-400 dark:hover:border-slate-500"
                      >
                        ›
                      </button>
                    </div>
                  )}
                </div>
                <div className="overflow-x-auto max-h-64 panel-scroll">
                  <table className="min-w-max w-full text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0">
                      <tr>
                        {columns.map((col) => (
                          <th key={col.index} className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            <span>{col.header}</span>
                            {col.field && (
                              <span className="ml-1 text-[9px] text-slate-400 dark:text-slate-500 font-normal">
                                ({FIELD_COLUMNS.find((fc) => fc.key === col.field)?.label})
                              </span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, i) => (
                        <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                          {columns.map((col) => {
                            const val = row[col.index] || ''
                            return (
                              <td key={col.index} className={`px-3 py-2 whitespace-nowrap ${val ? 'text-slate-700' : 'text-slate-300'}`}>
                                {val || '—'}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {rows.length > PREVIEW_PER_PAGE && (
                  <div className="px-4 py-2 text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800">
                    Affichage de {previewRows.length} lignes sur {rows.length}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {showData && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button type="button" onClick={reset} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
              Recommencer
            </button>
            <div className="flex items-center gap-3">
              {validRows.length !== rows.length && (
                <span className="text-xs text-amber-600 dark:text-amber-400">{rows.length - validRows.length} ligne(s) vide(s) ignorée(s)</span>
              )}
              <button
                type="button"
                onClick={generate}
                disabled={!hasData}
                className="px-5 py-2.5 rounded-lg bg-slate-900 dark:bg-indigo-600 text-white text-sm font-medium hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {hasData ? `Générer ${validRows.length} carte${validRows.length > 1 ? 's' : ''}` : 'Aucune donnée à importer'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
