import { useEffect, useState, useRef, useMemo } from 'react'
import type { CardData, FieldType, FieldStyle, FontFamily, TextAlign, BackgroundType, PatternType, GradientDirection, BorderStyle, DecorativeLine, QrConfig, LogoConfig, CardType, CardIcon, SavedPalette, IconCategory, SocialLinks, ProfilePhotoConfig } from './types'
import { FIELD_DEFS, FONT_FAMILIES, FONT_WEIGHT_LABELS, PALETTES, ARCHETYPES, cardFromArchetypePalette, CARD_TYPES, ICON_LIBRARY, TEMPLATES, getRecommendations, CARD_TYPE_FEATURES } from './types'

type Props = {
  card: CardData
  onChange: (patch: Partial<CardData>) => void
  onOpenGallery: () => void
  savedPalettes: SavedPalette[]
  onSavePalette: (name: string) => void
  onDeletePalette: (id: string) => void
  onPrintPreview: () => void
  focusTab?: Tab | null
}

export type Tab = 'template' | 'type' | 'identity' | 'fields' | 'background' | 'border' | 'effects' | 'icons' | 'logo' | 'photo' | 'social' | 'qr' | 'export'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'template',  label: 'Gabarit',      icon: '▦' },
  { id: 'type',      label: 'Type',         icon: '⚑' },
  { id: 'identity',  label: 'Informations', icon: '✎' },
  { id: 'fields',    label: 'Textes',       icon: 'Aa' },
  { id: 'background', label: 'Fond',        icon: '◐' },
  { id: 'border',    label: 'Bordure',      icon: '▢' },
  { id: 'effects',   label: 'Effets',       icon: '✦' },
  { id: 'icons',     label: 'Icônes',       icon: '★' },
  { id: 'logo',      label: 'Logo',         icon: '▣' },
  { id: 'photo',     label: 'Photo',        icon: '☻' },
  { id: 'social',    label: 'Réseaux',      icon: '⊙' },
  { id: 'qr',        label: 'QR Code',      icon: '◉' },
  { id: 'export',    label: 'Export',       icon: '⤓' },
]

export function ControlPanel({ card, onChange, onOpenGallery, savedPalettes, onSavePalette, onDeletePalette, onPrintPreview, focusTab }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('template')

  useEffect(() => {
    if (focusTab) setActiveTab(focusTab)
  }, [focusTab])
  const features = CARD_TYPE_FEATURES[card.cardType]
  const availableTabs = TABS.filter((tab) => {
    if (tab.id === 'logo') return features.showLogo
    if (tab.id === 'photo') return features.showProfilePhoto
    if (tab.id === 'social') return features.showSocialLinks
    if (tab.id === 'qr') return features.showQR
    return true
  })

  useEffect(() => {
    if (!availableTabs.some((tab) => tab.id === activeTab)) setActiveTab('template')
  }, [activeTab, availableTabs])

  return (
    <div className="flex flex-col gap-0">
      <RecommendationsBar card={card} />
      <div className="mb-4 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800 dark:border-sky-900/50 dark:bg-sky-900/20 dark:text-sky-300">
        <span className="font-semibold">Mode {CARD_TYPES.find((type) => type.id === card.cardType)?.label} :</span> les options non adaptées sont masquées pour garder une création simple et cohérente.
      </div>
      {/* Tab bar */}
      <div className="flex gap-1 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800 overflow-x-auto panel-scroll">
        {availableTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white dark:bg-indigo-600'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            <span className="mr-1 opacity-70">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'template'  && <TemplateTab card={card} onChange={onChange} onOpenGallery={onOpenGallery} savedPalettes={savedPalettes} onSavePalette={onSavePalette} onDeletePalette={onDeletePalette} />}
      {activeTab === 'type'      && <TypeTab card={card} onChange={(patch) => {
        if (patch.cardType) {
          const nextFeatures = CARD_TYPE_FEATURES[patch.cardType]
          onChange({
            ...patch,
            logo: nextFeatures.showLogo ? card.logo : { ...card.logo, enabled: false },
            profilePhoto: nextFeatures.showProfilePhoto ? card.profilePhoto : { ...card.profilePhoto, enabled: false },
            qr: nextFeatures.showQR ? card.qr : { ...card.qr, enabled: false },
            socialLinks: nextFeatures.showSocialLinks ? card.socialLinks : { linkedin: '', instagram: '', facebook: '', twitter: '', whatsapp: '', telegram: '', youtube: '', tiktok: '' },
          })
        } else onChange(patch)
      }} />}
      {activeTab === 'identity'  && <IdentityTab card={card} onChange={onChange} />}
      {activeTab === 'fields'    && <FieldsTab card={card} onChange={onChange} />}
      {activeTab === 'background' && <BackgroundTab card={card} onChange={onChange} />}
      {activeTab === 'border'    && <BorderTab card={card} onChange={onChange} />}
      {activeTab === 'effects'   && <EffectsTab card={card} onChange={onChange} />}
      {activeTab === 'icons'     && <IconsTab card={card} onChange={onChange} />}
      {activeTab === 'logo'      && <LogoTab card={card} onChange={onChange} />}
      {activeTab === 'photo'     && <PhotoTab card={card} onChange={onChange} />}
      {activeTab === 'social'    && <SocialTab card={card} onChange={onChange} />}
      {activeTab === 'qr'        && <QrTab card={card} onChange={onChange} />}
      {activeTab === 'export'    && <ExportTab card={card} onPrintPreview={onPrintPreview} />}
    </div>
  )
}

/* =========================================================================
   TAB: TEMPLATE (quick archetype + palette switcher)
   ========================================================================= */
function TemplateTab({ card, onChange, onOpenGallery, savedPalettes, onSavePalette, onDeletePalette }: {
  card: CardData
  onChange: (p: Partial<CardData>) => void
  onOpenGallery: () => void
  savedPalettes: SavedPalette[]
  onSavePalette: (name: string) => void
  onDeletePalette: (id: string) => void
}) {
  const [paletteName, setPaletteName] = useState('')
  return (
    <div className="flex flex-col gap-5">
      <Section title="Galerie complète" hint="100 modèles disponibles">
        <button
          type="button"
          onClick={onOpenGallery}
          className="w-full px-4 py-3 rounded-xl bg-slate-900 text-white dark:bg-indigo-600 text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
        >
          Ouvrir la galerie de {TEMPLATES.length} modèles
        </button>
      </Section>

      <Section title="Mise en page" hint="Style d'architecture de la carte">
        <div className="grid grid-cols-2 gap-2">
          {ARCHETYPES.map((arch) => (
            <button
              key={arch.id}
              type="button"
              onClick={() => {
                // Find current palette by matching bg color
                const currentPal = PALETTES.find((p) => p.bg1 === card.background.color1) ?? PALETTES[0]
                // Build new card from archetype + current palette
                const newCard = cardFromArchetypePalette(arch.id, currentPal.id)
                onChange({
                  archetype: arch.id,
                  fieldStyles: newCard.fieldStyles,
                  decorativeLine: newCard.decorativeLine,
                  effects: { ...card.effects, innerPadding: newCard.effects.innerPadding },
                })
              }}
              className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition-all ${
                card.archetype === arch.id
                  ? 'border-slate-900 bg-slate-50 text-slate-900 dark:border-indigo-500 dark:bg-slate-800 dark:text-slate-100'
                  : 'border-slate-200 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-500'
              }`}
            >
              <div className="font-semibold">{arch.name}</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{arch.category}</div>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Palette de couleurs" hint={`${PALETTES.length} palettes professionnelles`}>
        <div className="grid grid-cols-2 gap-2">
          {PALETTES.map((pal) => {
            const isActive = card.background.color1 === pal.bg1
            return (
              <button
                key={pal.id}
                type="button"
                onClick={() => {
                  // Apply palette to current card
                  const newFieldStyles = { ...card.fieldStyles }
                  if (newFieldStyles.firstName) newFieldStyles.firstName = { ...newFieldStyles.firstName, color: pal.text }
                  if (newFieldStyles.lastName) newFieldStyles.lastName = { ...newFieldStyles.lastName, color: pal.text }
                  if (newFieldStyles.jobTitle) newFieldStyles.jobTitle = { ...newFieldStyles.jobTitle, color: pal.muted }
                  if (newFieldStyles.company) newFieldStyles.company = { ...newFieldStyles.company, color: pal.accent }
                  if (newFieldStyles.phone) newFieldStyles.phone = { ...newFieldStyles.phone, color: pal.text }
                  if (newFieldStyles.email) newFieldStyles.email = { ...newFieldStyles.email, color: pal.text }
                  if (newFieldStyles.website) newFieldStyles.website = { ...newFieldStyles.website, color: pal.accent }
                  if (newFieldStyles.address) newFieldStyles.address = { ...newFieldStyles.address, color: pal.muted }
                  onChange({
                    background: { ...card.background, color1: pal.bg1, color2: pal.bg2, patternColor: pal.dark ? pal.border : pal.muted },
                    border: { ...card.border, color: pal.border },
                    fieldStyles: newFieldStyles,
                    qr: { ...card.qr, bgColor: pal.dark ? pal.bg2 : '#ffffff', fgColor: pal.dark ? pal.text : '#000000' },
                    decorativeLine: { ...card.decorativeLine, color: pal.accent },
                    paletteName: pal.name,
                  })
                }}
                className={`rounded-lg p-2 border-2 transition-all flex items-center gap-2 ${
                  isActive ? 'border-slate-900 dark:border-indigo-500' : 'border-slate-200 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-500'
                }`}
              >
                <div className="flex gap-0.5 shrink-0">
                  <div className="w-4 h-8 rounded" style={{ background: pal.bg1 }} />
                  <div className="w-4 h-8 rounded" style={{ background: pal.accent }} />
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{pal.name}</span>
              </button>
            )
          })}
        </div>
      </Section>

      <Section title="Palettes sauvegardées" hint="Vos palettes personnalisées réutilisables">
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Nom de la palette…"
            value={paletteName}
            onChange={(e) => setPaletteName(e.target.value)}
          />
          <button
            type="button"
            onClick={() => {
              if (paletteName.trim()) {
                onSavePalette(paletteName.trim())
                setPaletteName('')
              }
            }}
            className="px-3 py-2 rounded-lg bg-slate-900 text-white dark:bg-indigo-600 text-xs font-medium hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
          >
            Sauvegarder
          </button>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500">Sauvegarde les couleurs actuelles de la carte</p>
        {savedPalettes.length > 0 && (
          <div className="flex flex-col gap-2 mt-2">
            {savedPalettes.map((pal) => (
              <div key={pal.id} className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 p-2">
                <div className="flex gap-0.5 shrink-0">
                  <div className="w-4 h-7 rounded" style={{ background: pal.bg1 }} />
                  <div className="w-4 h-7 rounded" style={{ background: pal.accent }} />
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex-1 truncate">{pal.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    const newFieldStyles = { ...card.fieldStyles }
                    if (newFieldStyles.firstName) newFieldStyles.firstName = { ...newFieldStyles.firstName, color: pal.text }
                    if (newFieldStyles.lastName) newFieldStyles.lastName = { ...newFieldStyles.lastName, color: pal.text }
                    if (newFieldStyles.jobTitle) newFieldStyles.jobTitle = { ...newFieldStyles.jobTitle, color: pal.muted }
                    if (newFieldStyles.company) newFieldStyles.company = { ...newFieldStyles.company, color: pal.accent }
                    if (newFieldStyles.phone) newFieldStyles.phone = { ...newFieldStyles.phone, color: pal.text }
                    if (newFieldStyles.email) newFieldStyles.email = { ...newFieldStyles.email, color: pal.text }
                    if (newFieldStyles.website) newFieldStyles.website = { ...newFieldStyles.website, color: pal.accent }
                    onChange({
                      background: { ...card.background, color1: pal.bg1, color2: pal.bg2, patternColor: pal.dark ? pal.border : pal.muted },
                      border: { ...card.border, color: pal.border },
                      fieldStyles: newFieldStyles,
                      qr: { ...card.qr, bgColor: pal.dark ? pal.bg2 : '#ffffff', fgColor: pal.dark ? pal.text : '#000000' },
                      decorativeLine: { ...card.decorativeLine, color: pal.accent },
                      paletteName: pal.name,
                    })
                  }}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 px-1"
                >Appliquer</button>
                <button
                  type="button"
                  onClick={() => onDeletePalette(pal.id)}
                  className="text-xs text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 px-1"
                >×</button>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}

/* =========================================================================
   TAB: TYPE (card type selector)
   ========================================================================= */
function TypeTab({ card, onChange }: { card: CardData; onChange: (p: Partial<CardData>) => void }) {
  const features = CARD_TYPE_FEATURES[card.cardType]
  return (
    <div className="flex flex-col gap-5">
      <Section title="Type de carte" hint="Définit le contexte et les champs disponibles">
        <div className="grid grid-cols-2 gap-3">
          {CARD_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange({ cardType: t.id as CardType })}
              className={`rounded-xl p-4 border-2 text-left transition-all ${
                card.cardType === t.id
                  ? 'border-slate-900 bg-slate-50 dark:border-indigo-500 dark:bg-slate-800'
                  : 'border-slate-200 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-500'
              }`}
            >
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t.label}</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">{t.description}</div>
            </button>
          ))}
        </div>
      </Section>
      <Section title="Fonctionnalités disponibles" hint="Selon le type de carte sélectionné">
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Entreprise', active: features.showCompany },
            { label: 'Département', active: features.showDepartment },
            { label: 'Logo', active: features.showLogo },
            { label: 'Photo de profil', active: features.showProfilePhoto },
            { label: 'Réseaux sociaux', active: features.showSocialLinks },
            { label: 'QR Code', active: features.showQR },
            { label: 'Slogan', active: features.showTagline },
            { label: 'Accroche', active: features.showSlogan },
          ].map((f) => (
            <span
              key={f.label}
              className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${
                f.active
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
              }`}
            >
              {f.active ? '✓' : '○'} {f.label}
            </span>
          ))}
        </div>
      </Section>
      <Section title="Styles recommandés" hint="Archétypes adaptés à ce type de carte">
        <div className="flex flex-wrap gap-2">
          {features.recommendedArchetypes.map((archId) => {
            const arch = ARCHETYPES.find((a) => a.id === archId)
            if (!arch) return null
            return (
              <button
                key={archId}
                type="button"
                onClick={() => {
                  const currentPal = PALETTES.find((p) => p.bg1 === card.background.color1) ?? PALETTES[0]
                  const newCard = cardFromArchetypePalette(archId, currentPal.id, card.cardType)
                  onChange({
                    archetype: archId,
                    fieldStyles: newCard.fieldStyles,
                    decorativeLine: newCard.decorativeLine,
                    effects: { ...card.effects, innerPadding: newCard.effects.innerPadding },
                  })
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  card.archetype === archId
                    ? 'border-slate-900 bg-slate-50 dark:border-indigo-500 dark:bg-slate-800'
                    : 'border-slate-200 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-400'
                }`}
              >
                {arch.name}
              </button>
            )
          })}
        </div>
      </Section>
    </div>
  )
}

/* =========================================================================
   TAB: IDENTITY (field content)
   ========================================================================= */
function IdentityTab({ card, onChange }: { card: CardData; onChange: (p: Partial<CardData>) => void }) {
  const groups: Array<{ name: string; fields: FieldType[] }> = [
    { name: 'Identité', fields: ['firstName', 'lastName', 'jobTitle'] },
    { name: 'Entreprise', fields: ['company', 'department'] },
    { name: 'Contact', fields: ['phone', 'email', 'website', 'address'] },
    { name: 'Personnalisation', fields: ['tagline', 'slogan'] },
  ]

  const updateField = (field: FieldType, value: string) => {
    onChange({ fields: { ...card.fields, [field]: value } })
  }

  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => (
        <Section key={group.name} title={group.name} hint={group.name === 'Personnalisation' ? 'Champs optionnels' : undefined}>
          <div className="flex flex-col gap-3">
            {group.fields.map((fieldId) => {
              const def = FIELD_DEFS.find((f) => f.id === fieldId)!
              return (
                <Field key={fieldId} label={def.label}>
                  <input
                    className="input"
                    value={card.fields[fieldId]}
                    onChange={(e) => updateField(fieldId, e.target.value)}
                    placeholder={def.placeholder}
                  />
                </Field>
              )
            })}
          </div>
        </Section>
      ))}
    </div>
  )
}

/* =========================================================================
   TAB: FIELDS (per-field styling)
   ========================================================================= */
function FieldsTab({ card, onChange }: { card: CardData; onChange: (p: Partial<CardData>) => void }) {
  const [selectedField, setSelectedField] = useState<FieldType>('firstName')

  const updateFieldStyle = (field: FieldType, patch: Partial<FieldStyle>) => {
    const current = card.fieldStyles[field] || {}
    onChange({
      fieldStyles: {
        ...card.fieldStyles,
        [field]: { ...current, ...patch },
      },
    })
  }

  const fs = card.fieldStyles[selectedField] || {}

  return (
    <div className="flex flex-col gap-5">
      <Section title="Champ à personnaliser" hint="Sélectionnez puis ajustez chaque détail">
        <select
          value={selectedField}
          onChange={(e) => setSelectedField(e.target.value as FieldType)}
          className="input"
        >
          {FIELD_DEFS.map((f) => (
            <option key={f.id} value={f.id}>{f.label}</option>
          ))}
        </select>
      </Section>

      <Section title="Visibilité">
        <Toggle
          label="Afficher ce champ"
          active={fs.visible !== false}
          onChange={() => updateFieldStyle(selectedField, { visible: !(fs.visible ?? true) })}
        />
      </Section>

      <Section title="Police">
        <Field label="Famille">
          <select
            value={fs.fontFamily ?? 'Inter'}
            onChange={(e) => updateFieldStyle(selectedField, { fontFamily: e.target.value as FontFamily })}
            className="input"
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Graisse">
          <select
            value={fs.fontWeight ?? 400}
            onChange={(e) => updateFieldStyle(selectedField, { fontWeight: Number(e.target.value) })}
            className="input"
          >
            {FONT_WEIGHT_LABELS.map((w) => (
              <option key={w.value} value={w.value}>{w.label}</option>
            ))}
          </select>
        </Field>
      </Section>

      <Section title="Taille & espacement">
        <SliderRow label="Taille" value={fs.fontSize ?? 14} min={6} max={60} unit="px" onChange={(v) => updateFieldStyle(selectedField, { fontSize: v })} />
        <SliderRow label="Interlettrage" value={fs.letterSpacing ?? 0} min={-2} max={10} step={0.5} unit="px" onChange={(v) => updateFieldStyle(selectedField, { letterSpacing: v })} />
      </Section>

      <Section title="Couleur & opacité">
        <div className="grid grid-cols-2 gap-3">
          <ColorPicker label="Couleur" value={fs.color ?? '#0f172a'} onChange={(v) => updateFieldStyle(selectedField, { color: v })} />
        </div>
        <SliderRow label="Opacité" value={Math.round((fs.opacity ?? 1) * 100)} min={0} max={100} unit="%" onChange={(v) => updateFieldStyle(selectedField, { opacity: v / 100 })} />
      </Section>

      <Section title="Alignement & style">
        <Field label="Alignement">
          <div className="flex gap-2">
            {(['left', 'center', 'right'] as TextAlign[]).map((a) => (
              <ChoiceButton key={a} active={(fs.align ?? 'left') === a} onClick={() => updateFieldStyle(selectedField, { align: a })}>
                {a === 'left' ? '←' : a === 'center' ? '↔' : '→'}
              </ChoiceButton>
            ))}
          </div>
        </Field>
        <div className="flex gap-2 flex-wrap">
          <Toggle label="Italique" active={fs.italic ?? false} onChange={() => updateFieldStyle(selectedField, { italic: !(fs.italic ?? false) })} />
          <Toggle label="Souligné" active={fs.underline ?? false} onChange={() => updateFieldStyle(selectedField, { underline: !(fs.underline ?? false) })} />
          <Toggle label="Majuscules" active={fs.uppercase ?? false} onChange={() => updateFieldStyle(selectedField, { uppercase: !(fs.uppercase ?? false) })} />
        </div>
      </Section>

      <Section title="Position (défis millimétriques)" hint="Décalage et rotation par rapport à la position par défaut">
        <SliderRow label="Décalage X" value={fs.offsetX ?? 0} min={-40} max={40} step={0.5} unit="mm" onChange={(v) => updateFieldStyle(selectedField, { offsetX: v })} />
        <SliderRow label="Décalage Y" value={fs.offsetY ?? 0} min={-30} max={30} step={0.5} unit="mm" onChange={(v) => updateFieldStyle(selectedField, { offsetY: v })} />
        <SliderRow label="Rotation" value={fs.rotation ?? 0} min={-180} max={180} unit="°" onChange={(v) => updateFieldStyle(selectedField, { rotation: v })} />
      </Section>

      <Section title="Champs visibles" hint="Activez/désactivez rapidement">
        <div className="flex flex-wrap gap-2">
          {FIELD_DEFS.map((f) => {
            const isVisible = card.fieldStyles[f.id]?.visible !== false
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => updateFieldStyle(f.id, { visible: !isVisible })}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  isVisible
                    ? 'border-slate-900 bg-slate-50 text-slate-900 dark:border-indigo-500 dark:bg-slate-800 dark:text-slate-100'
                    : 'border-slate-200 text-slate-400 hover:border-slate-300 dark:border-slate-700 dark:text-slate-500 dark:hover:border-slate-600'
                }`}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      </Section>
    </div>
  )
}

/* =========================================================================
   TAB: BACKGROUND
   ========================================================================= */
function BackgroundTab({ card, onChange }: { card: CardData; onChange: (p: Partial<CardData>) => void }) {
  const bg = card.background
  const updateBg = (patch: Partial<typeof bg>) => onChange({ background: { ...bg, ...patch } })

  const bgTypes: { id: BackgroundType; label: string }[] = [
    { id: 'solid', label: 'Uni' },
    { id: 'gradient', label: 'Dégradé' },
    { id: 'pattern', label: 'Motif' },
    { id: 'image', label: 'Image' },
  ]

  const patterns: { id: PatternType; label: string }[] = [
    { id: 'dots', label: 'Points' },
    { id: 'grid', label: 'Grille' },
    { id: 'diagonal', label: 'Diagonal' },
    { id: 'chevron', label: 'Chevron' },
    { id: 'waves', label: 'Vagues' },
  ]

  const gradientDirs: { id: GradientDirection; label: string }[] = [
    { id: 'to-br', label: '↘' },
    { id: 'to-r', label: '→' },
    { id: 'to-b', label: '↓' },
    { id: 'to-bl', label: '↙' },
    { id: 'radial', label: '◎' },
  ]

  const fileRef = useRef<HTMLInputElement>(null)
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => updateBg({ image: reader.result as string })
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col gap-5">
      <Section title="Type de fond">
        <div className="grid grid-cols-4 gap-2">
          {bgTypes.map((t) => (
            <ChoiceButton key={t.id} active={bg.type === t.id} onClick={() => updateBg({ type: t.id })}>
              {t.label}
            </ChoiceButton>
          ))}
        </div>
      </Section>

      {bg.type === 'solid' && (
        <Section title="Couleur de fond">
          <ColorPicker label="Fond" value={bg.color1} onChange={(v) => updateBg({ color1: v })} />
        </Section>
      )}

      {bg.type === 'gradient' && (
        <>
          <Section title="Couleurs du dégradé">
            <div className="grid grid-cols-2 gap-3">
              <ColorPicker label="Début" value={bg.color1} onChange={(v) => updateBg({ color1: v })} />
              <ColorPicker label="Fin" value={bg.color2} onChange={(v) => updateBg({ color2: v })} />
            </div>
          </Section>
          <Section title="Direction">
            <div className="flex gap-2">
              {gradientDirs.map((d) => (
                <ChoiceButton key={d.id} active={bg.gradientDirection === d.id} onClick={() => updateBg({ gradientDirection: d.id })}>
                  {d.label}
                </ChoiceButton>
              ))}
            </div>
          </Section>
          <Section title="Intensité du dégradé">
            <SliderRow label="Intensité" value={bg.gradientIntensity ?? 100} min={0} max={100} unit="%" onChange={(v) => updateBg({ gradientIntensity: v })} />
          </Section>
        </>
      )}

      {bg.type === 'pattern' && (
        <>
          <Section title="Couleur de fond">
            <ColorPicker label="Fond" value={bg.color1} onChange={(v) => updateBg({ color1: v })} />
          </Section>
          <Section title="Motif">
            <div className="grid grid-cols-3 gap-2">
              {patterns.map((p) => (
                <ChoiceButton key={p.id} active={bg.pattern === p.id} onClick={() => updateBg({ pattern: p.id })}>
                  {p.label}
                </ChoiceButton>
              ))}
            </div>
          </Section>
          <Section title="Couleur & opacité du motif">
            <ColorPicker label="Couleur" value={bg.patternColor} onChange={(v) => updateBg({ patternColor: v })} />
            <SliderRow label="Opacité du motif" value={Math.round(bg.patternOpacity * 100)} min={0} max={100} unit="%" onChange={(v) => updateBg({ patternOpacity: v / 100 })} />
          </Section>
        </>
      )}

      {bg.type === 'image' && (
        <>
          <Section title="Image de fond">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-900 text-white dark:bg-indigo-600 text-sm hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
            >
              {bg.image ? 'Changer l\'image' : 'Importer une image'}
            </button>
            {bg.image && (
              <div className="mt-2 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden" style={{ height: 80 }}>
                <img src={bg.image} alt="Aperçu" className="w-full h-full object-cover" />
              </div>
            )}
            {bg.image && (
              <button type="button" onClick={() => updateBg({ image: null })} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mt-1 text-left">
                Retirer l'image
              </button>
            )}
          </Section>
          <Section title="Couleur de fond (sous l'image)">
            <ColorPicker label="Fond" value={bg.color1} onChange={(v) => updateBg({ color1: v })} />
          </Section>
          <SliderRow label="Opacité du fond" value={Math.round(bg.imageOpacity * 100)} min={0} max={100} unit="%" onChange={(v) => updateBg({ imageOpacity: v / 100 })} />
        </>
      )}
    </div>
  )
}

/* =========================================================================
   TAB: BORDER
   ========================================================================= */
function BorderTab({ card, onChange }: { card: CardData; onChange: (p: Partial<CardData>) => void }) {
  const b = card.border
  const update = (patch: Partial<typeof b>) => onChange({ border: { ...b, ...patch } })

  const borderStyles: { id: BorderStyle; label: string }[] = [
    { id: 'none', label: 'Aucune' },
    { id: 'solid', label: 'Plein' },
    { id: 'dashed', label: 'Tirets' },
    { id: 'dotted', label: 'Pointillés' },
    { id: 'double', label: 'Double' },
  ]

  return (
    <div className="flex flex-col gap-5">
      <Section title="Style de bordure">
        <div className="grid grid-cols-3 gap-2">
          {borderStyles.map((s) => (
            <ChoiceButton key={s.id} active={b.style === s.id} onClick={() => update({ style: s.id })}>
              {s.label}
            </ChoiceButton>
          ))}
        </div>
      </Section>

      {b.style !== 'none' && (
        <>
          <Section title="Couleur">
            <ColorPicker label="Bordure" value={b.color} onChange={(v) => update({ color: v })} />
          </Section>
          <Section title="Épaisseur & coins">
            <SliderRow label="Épaisseur" value={b.width} min={1} max={10} unit="px" onChange={(v) => update({ width: v })} />
          </Section>
        </>
      )}

      <Section title="Coins arrondis">
        <SliderRow label="Rayon" value={b.radius} min={0} max={60} unit="px" onChange={(v) => update({ radius: v })} />
      </Section>
    </div>
  )
}

/* =========================================================================
   TAB: EFFECTS
   ========================================================================= */
function EffectsTab({ card, onChange }: { card: CardData; onChange: (p: Partial<CardData>) => void }) {
  const e = card.effects
  const update = (patch: Partial<typeof e>) => onChange({ effects: { ...e, ...patch } })

  const dl = card.decorativeLine
  const updateDl = (patch: Partial<typeof dl>) => onChange({ decorativeLine: { ...dl, ...patch } })

  const linePositions: { id: DecorativeLine['position']; label: string }[] = [
    { id: 'none', label: 'Aucune' },
    { id: 'top', label: 'Haut' },
    { id: 'bottom', label: 'Bas' },
    { id: 'under-name', label: 'Sous le nom' },
    { id: 'under-title', label: 'Sous le titre' },
  ]

  return (
    <div className="flex flex-col gap-5">
      <Section title="Ombre portée">
        <Toggle label="Activer l'ombre" active={e.shadow} onChange={() => update({ shadow: !e.shadow })} />
        {e.shadow && (
          <>
            <ColorPicker label="Couleur de l'ombre" value={e.shadowColor.startsWith('#') ? e.shadowColor : '#000000'} onChange={(v) => update({ shadowColor: v })} />
            <SliderRow label="Flou" value={e.shadowBlur} min={0} max={50} unit="px" onChange={(v) => update({ shadowBlur: v })} />
            <SliderRow label="Décalage Y" value={e.shadowOffsetY} min={-20} max={20} unit="px" onChange={(v) => update({ shadowOffsetY: v })} />
          </>
        )}
      </Section>

      <Section title="Marge intérieure" hint="Espace entre le contenu et le bord">
        <SliderRow label="Padding" value={e.innerPadding} min={0} max={50} unit="px" onChange={(v) => update({ innerPadding: v })} />
      </Section>

      <Section title="Opacité de la carte">
        <SliderRow label="Opacité" value={Math.round(e.cardOpacity * 100)} min={10} max={100} unit="%" onChange={(v) => update({ cardOpacity: v / 100 })} />
      </Section>

      <Section title="Ligne décorative">
        <Toggle label="Activer" active={dl.enabled} onChange={() => updateDl({ enabled: !dl.enabled })} />
        {dl.enabled && (
          <>
            <Field label="Position">
              <select value={dl.position} onChange={(e2) => updateDl({ position: e2.target.value as DecorativeLine['position'] })} className="input">
                {linePositions.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </Field>
            <ColorPicker label="Couleur" value={dl.color} onChange={(v) => updateDl({ color: v })} />
            <SliderRow label="Épaisseur" value={dl.width} min={1} max={10} unit="px" onChange={(v) => updateDl({ width: v })} />
            <Field label="Style">
              <select value={dl.style} onChange={(e2) => updateDl({ style: e2.target.value as BorderStyle })} className="input">
                <option value="solid">Plein</option>
                <option value="dashed">Tirets</option>
                <option value="dotted">Pointillés</option>
                <option value="double">Double</option>
              </select>
            </Field>
          </>
        )}
      </Section>
    </div>
  )
}

/* =========================================================================
   TAB: ICONS (decorative icon library)
   ========================================================================= */
function IconsTab({ card, onChange }: { card: CardData; onChange: (p: Partial<CardData>) => void }) {
  const updateIcons = (icons: CardIcon[]) => onChange({ icons })

  const addIcon = (iconChar: string) => {
    const newIcon: CardIcon = {
      id: crypto.randomUUID(),
      icon: iconChar,
      color: card.fieldStyles.company?.color ?? '#0ea5e9',
      size: 24,
      x: 50,
      y: 15,
      showOnBack: true,
    }
    updateIcons([...card.icons, newIcon])
  }

  const updateIcon = (id: string, patch: Partial<CardIcon>) => {
    updateIcons(card.icons.map((ic) => (ic.id === id ? { ...ic, ...patch } : ic)))
  }

  const removeIcon = (id: string) => {
    updateIcons(card.icons.filter((ic) => ic.id !== id))
  }

  const selectedIcon = card.icons[card.icons.length - 1]

  return (
    <div className="flex flex-col gap-5">
      <Section title="Bibliothèque d'icônes" hint={`${ICON_LIBRARY.length} icônes — cliquez pour ajouter`}>
        <IconCategoryFilter onSelect={(icon) => addIcon(icon)} />
      </Section>

      {card.icons.length > 0 && (
        <Section title="Icônes sur la carte" hint="Cliquez pour supprimer">
          <div className="flex flex-wrap gap-2">
            {card.icons.map((ic) => (
              <button
                key={ic.id}
                type="button"
                onClick={() => removeIcon(ic.id)}
                className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-red-400 dark:hover:border-red-500 hover:text-red-500 dark:hover:text-red-400 transition-all flex items-center justify-center text-lg"
                title="Supprimer"
              >
                {ic.icon}
              </button>
            ))}
          </div>
        </Section>
      )}

      {selectedIcon && (
        <Section title="Dernière icône ajoutée" hint="Ajustez position, taille et couleur">
          <ColorPicker label="Couleur" value={selectedIcon.color} onChange={(v) => updateIcon(selectedIcon.id, { color: v })} />
          <SliderRow label="Taille" value={selectedIcon.size} min={10} max={80} unit="px" onChange={(v) => updateIcon(selectedIcon.id, { size: v })} />
          <SliderRow label="Position X" value={Math.round(selectedIcon.x)} min={0} max={100} unit="%" onChange={(v) => updateIcon(selectedIcon.id, { x: v })} />
          <SliderRow label="Position Y" value={Math.round(selectedIcon.y)} min={0} max={100} unit="%" onChange={(v) => updateIcon(selectedIcon.id, { y: v })} />
          <Toggle label="Afficher sur le verso" active={selectedIcon.showOnBack ?? true} onChange={() => updateIcon(selectedIcon.id, { showOnBack: !(selectedIcon.showOnBack ?? true) })} />
        </Section>
      )}
    </div>
  )
}

/* =========================================================================
   TAB: LOGO
   ========================================================================= */
function LogoTab({ card, onChange }: { card: CardData; onChange: (p: Partial<CardData>) => void }) {
  const l = card.logo
  const update = (patch: Partial<typeof l>) => onChange({ logo: { ...l, ...patch } })
  const fileRef = useRef<HTMLInputElement>(null)

  const positions: { id: LogoConfig['position']; label: string }[] = [
    { id: 'top-left', label: 'Haut gauche' },
    { id: 'top-right', label: 'Haut droite' },
    { id: 'center', label: 'Centre' },
    { id: 'bottom-left', label: 'Bas gauche' },
    { id: 'bottom-right', label: 'Bas droite' },
    { id: 'custom', label: 'Position libre' },
  ]

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => update({ image: reader.result as string, enabled: true })
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col gap-5">
      <Section title="Logo" hint="Importez votre logo (PNG, JPG, SVG)">
        <Toggle label="Afficher le logo" active={l.enabled} onChange={() => update({ enabled: !l.enabled })} />
        {l.enabled && (
          <>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
            <div className="flex items-center gap-3">
              {l.image ? (
                <div className="w-16 h-16 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden shrink-0">
                  <img src={l.image} alt="Logo" className="w-full h-full object-contain p-1" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs shrink-0">
                  Aucun
                </div>
              )}
              <div className="flex flex-col gap-2 flex-1">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="px-3 py-2 rounded-lg bg-slate-900 text-white dark:bg-indigo-600 text-sm hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                >
                  {l.image ? 'Changer' : 'Importer'}
                </button>
                {l.image && (
                  <button type="button" onClick={() => update({ image: null })} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 text-left">
                    Retirer
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </Section>

      {l.enabled && l.image && (
        <>
          <Section title="Taille & opacité">
            <SliderRow label="Taille" value={l.size} min={20} max={150} unit="px" onChange={(v) => update({ size: v })} />
            <SliderRow label="Opacité" value={Math.round(l.opacity * 100)} min={10} max={100} unit="%" onChange={(v) => update({ opacity: v / 100 })} />
          </Section>
          <Section title="Position">
            <select value={l.position} onChange={(e) => update({ position: e.target.value as LogoConfig['position'] })} className="input">
              {positions.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            {l.position === 'custom' && (
              <div className="mt-2">
                <SliderRow label="Position X" value={Math.round(l.x)} min={0} max={100} unit="%" onChange={(v) => update({ x: v })} />
                <SliderRow label="Position Y" value={Math.round(l.y)} min={0} max={100} unit="%" onChange={(v) => update({ y: v })} />
              </div>
            )}
          </Section>
          <Section title="Forme">
            <Toggle label="Logo rond" active={l.rounded} onChange={() => update({ rounded: !l.rounded })} />
          </Section>
        </>
      )}
    </div>
  )
}

/* =========================================================================
   TAB: PROFILE PHOTO
   ========================================================================= */
function PhotoTab({ card, onChange }: { card: CardData; onChange: (p: Partial<CardData>) => void }) {
  const p = card.profilePhoto
  const update = (patch: Partial<typeof p>) => onChange({ profilePhoto: { ...p, ...patch } })
  const fileRef = useRef<HTMLInputElement>(null)

  const shapes: { id: ProfilePhotoConfig['shape']; label: string }[] = [
    { id: 'circle', label: 'Cercle' },
    { id: 'rounded', label: 'Arrondi' },
    { id: 'square', label: 'Carré' },
  ]

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => update({ image: reader.result as string, enabled: true })
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col gap-5">
      <Section title="Photo de profil" hint="Ajoutez votre photo pour un rendu plus personnel">
        <Toggle label="Afficher la photo" active={p.enabled} onChange={() => update({ enabled: !p.enabled })} />
        {p.enabled && (
          <>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
            <div className="flex items-center gap-3">
              {p.image ? (
                <div className="w-16 h-16 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden shrink-0">
                  <img src={p.image} alt="Photo" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs shrink-0">
                  Aucune
                </div>
              )}
              <div className="flex flex-col gap-2 flex-1">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="px-3 py-2 rounded-lg bg-slate-900 text-white dark:bg-indigo-600 text-sm hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                >
                  {p.image ? 'Changer' : 'Importer'}
                </button>
                {p.image && (
                  <button type="button" onClick={() => update({ image: null })} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 text-left">
                    Retirer
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </Section>

      {p.enabled && p.image && (
        <>
          <Section title="Taille & opacité">
            <SliderRow label="Taille" value={p.size} min={30} max={200} unit="px" onChange={(v) => update({ size: v })} />
            <SliderRow label="Opacité" value={Math.round(p.opacity * 100)} min={10} max={100} unit="%" onChange={(v) => update({ opacity: v / 100 })} />
          </Section>
          <Section title="Forme">
            <div className="grid grid-cols-3 gap-2">
              {shapes.map((s) => (
                <ChoiceButton key={s.id} active={p.shape === s.id} onClick={() => update({ shape: s.id })}>
                  {s.label}
                </ChoiceButton>
              ))}
            </div>
          </Section>
          <Section title="Position libre" hint="Placement en pourcentage sur la carte">
            <SliderRow label="Position X" value={Math.round(p.x)} min={0} max={100} unit="%" onChange={(v) => update({ x: v })} />
            <SliderRow label="Position Y" value={Math.round(p.y)} min={0} max={100} unit="%" onChange={(v) => update({ y: v })} />
          </Section>
        </>
      )}
    </div>
  )
}

/* =========================================================================
   TAB: SOCIAL LINKS
   ========================================================================= */
function SocialTab({ card, onChange }: { card: CardData; onChange: (p: Partial<CardData>) => void }) {
  const s = card.socialLinks
  const update = (patch: Partial<SocialLinks>) => onChange({ socialLinks: { ...s, ...patch } })

  const platforms: { key: keyof SocialLinks; label: string; placeholder: string }[] = [
    { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/votre-profil' },
    { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/votre-compte' },
    { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/votre-page' },
    { key: 'twitter', label: 'Twitter / X', placeholder: 'https://x.com/votre-compte' },
    { key: 'whatsapp', label: 'WhatsApp', placeholder: 'https://wa.me/33612345678' },
    { key: 'telegram', label: 'Telegram', placeholder: 'https://t.me/votre-compte' },
    { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@votre-chaine' },
    { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@votre-compte' },
  ]

  return (
    <div className="flex flex-col gap-5">
      <Section title="Réseaux sociaux" hint="Affichés sur le verso de la carte avec icônes">
        <div className="flex flex-col gap-3">
          {platforms.map((p) => (
            <Field key={p.key} label={p.label}>
              <input
                className="input"
                value={s[p.key] ?? ''}
                onChange={(e) => update({ [p.key]: e.target.value } as Partial<SocialLinks>)}
                placeholder={p.placeholder}
              />
            </Field>
          ))}
        </div>
      </Section>
      <Section title="Aperçu" hint="Les liens apparaissent sur le verso">
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 flex flex-wrap gap-2">
          {platforms.filter((p) => (s[p.key] ?? '').trim() !== '').length === 0 ? (
            <span className="text-xs text-slate-400 dark:text-slate-500">Aucun réseau social renseigné</span>
          ) : (
            platforms.filter((p) => (s[p.key] ?? '').trim() !== '').map((p) => (
              <span key={p.key} className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400">
                {p.label}
              </span>
            ))
          )}
        </div>
      </Section>
      <Section title="Inclusion dans le QR code vCard" hint="Les liens sont ajoutés au contact vCard scanné">
        <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
          Lorsque le QR code est en mode vCard, tous les liens renseignés ici sont automatiquement inclus dans le contact téléphonique de la personne qui scanne votre carte.
        </p>
      </Section>
    </div>
  )
}

/* =========================================================================
   TAB: QR CODE
   ========================================================================= */
function QrTab({ card, onChange }: { card: CardData; onChange: (p: Partial<CardData>) => void }) {
  const q = card.qr
  const update = (patch: Partial<typeof q>) => onChange({ qr: { ...q, ...patch } })

  const positions: { id: QrConfig['position']; label: string }[] = [
    { id: 'bottom-right', label: 'Bas droite' },
    { id: 'bottom-left', label: 'Bas gauche' },
    { id: 'top-right', label: 'Haut droite' },
    { id: 'top-left', label: 'Haut gauche' },
  ]

  const sources: { id: QrConfig['source']; label: string }[] = [
    { id: 'vcard', label: 'vCard (contact)' },
    { id: 'phone', label: 'Téléphone' },
    { id: 'email', label: 'Email' },
    { id: 'website', label: 'Site web' },
    { id: 'custom', label: 'Personnalisé' },
  ]

  return (
    <div className="flex flex-col gap-5">
      <Section title="QR Code" hint="Généré à partir de vos coordonnées">
        <Toggle label="Activer le QR code" active={q.enabled} onChange={() => update({ enabled: !q.enabled })} />
      </Section>

      {q.enabled && (
        <>
          <Section title="Source" hint={q.source === 'vcard' ? 'Le QR contient toutes vos coordonnées (nom, téléphone, email, entreprise, site, réseaux)' : undefined}>
            <div className="grid grid-cols-2 gap-2">
              {sources.map((s) => (
                <ChoiceButton key={s.id} active={q.source === s.id} onClick={() => update({ source: s.id })}>
                  {s.label}
                </ChoiceButton>
              ))}
            </div>
            {q.source === 'custom' && (
              <input
                className="input mt-2"
                value={q.customValue}
                onChange={(e) => update({ customValue: e.target.value })}
                placeholder="URL ou texte personnalisé"
              />
            )}
          </Section>

          <Section title="Taille & position">
            <SliderRow label="Taille" value={q.size} min={40} max={150} unit="px" onChange={(v) => update({ size: v })} />
            <Field label="Position">
              <select value={q.position} onChange={(e) => update({ position: e.target.value as QrConfig['position'] })} className="input">
                {positions.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </Field>
          </Section>

          <Section title="Couleurs">
            <div className="grid grid-cols-2 gap-3">
              <ColorPicker label="Avant-plan" value={q.fgColor} onChange={(v) => update({ fgColor: v })} />
              <ColorPicker label="Arrière-plan" value={q.bgColor} onChange={(v) => update({ bgColor: v })} />
            </div>
          </Section>

          <Section title="Style">
            <Toggle label="Coins arrondis" active={q.rounded} onChange={() => update({ rounded: !q.rounded })} />
          </Section>

          <p className="text-xs text-slate-400 dark:text-slate-500">Le QR code s'affiche sur le verso de la carte.</p>
        </>
      )}
    </div>
  )
}

/* =========================================================================
   TAB: EXPORT (placeholder — handled in App)
   ========================================================================= */
function ExportTab({ card, onPrintPreview }: { card: CardData; onPrintPreview: () => void }) {
  return (
    <div className="flex flex-col gap-5">
      <Section title="Export" hint="Utilisez les boutons en haut de la page">
        <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
          L'export en PNG se fait via le bouton « Exporter PNG » en haut de la page.
          Le format PNG inclut le recto et le verso côte à côte en haute résolution.
        </p>
      </Section>
      <Section title="Aperçu avant impression" hint="Recto-verso prêt à imprimer">
        <button
          type="button"
          onClick={onPrintPreview}
          className="w-full px-3 py-2.5 rounded-lg bg-slate-900 text-white dark:bg-indigo-600 text-sm hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
        >
          Aperçu recto-verso
        </button>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Ouvre toutes les cartes en aperçu impression recto-verso</p>
      </Section>
      <Section title="Format de la carte">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Format actuel : {card.cardSize.width} × {card.cardSize.height} mm
        </div>
      </Section>
    </div>
  )
}

/* =========================================================================
   SHARED UI COMPONENTS
   ========================================================================= */
function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        {hint && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{hint}</p>}
      </div>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</span>
      {children}
    </label>
  )
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col items-center gap-1.5 cursor-pointer">
      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</span>
      <div className="relative w-full h-12 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
        />
        <div className="absolute inset-0 pointer-events-none" style={{ background: value }} />
      </div>
      <span className="text-[10px] uppercase text-slate-400 dark:text-slate-500 tracking-wide">{value}</span>
    </label>
  )
}

function Toggle({ label, active, onChange }: { label: string; active: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center justify-between w-full py-1 group"
    >
      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</span>
      <div className={`w-9 h-5 rounded-full transition-colors ${active ? 'bg-slate-900 dark:bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
        <div className={`w-4 h-4 rounded-full bg-white dark:bg-slate-900 shadow transition-transform mt-0.5 ${active ? 'translate-x-4.5 ml-0.5' : 'ml-0.5'}`} style={{ transform: active ? 'translateX(18px)' : 'translateX(2px)' }} />
      </div>
    </button>
  )
}

function SliderRow({
  label, value, min, max, unit, onChange, step,
}: {
  label: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void; step?: number
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-slate-600 dark:text-slate-400">{label}</span>
        <span className="text-slate-500 dark:text-slate-400 tabular-nums">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step ?? 1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}

function ChoiceButton({
  active, onClick, disabled, children,
}: {
  active: boolean; onClick: () => void; disabled?: boolean; children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 py-2 rounded-lg text-sm border transition-all ${
        active
          ? 'border-slate-900 bg-slate-900 text-white dark:border-indigo-500 dark:bg-indigo-600'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-500'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )
}

function IconCategoryFilter({ onSelect }: { onSelect: (icon: string) => void }) {
  const [category, setCategory] = useState<IconCategory | 'Tous'>('Tous')
  const categories: (IconCategory | 'Tous')[] = ['Tous', 'Contact', 'Social', 'Business', 'Industry', 'Decorative', 'Arrows', 'Shapes']
  const filtered = useMemo(() => {
    if (category === 'Tous') return ICON_LIBRARY
    return ICON_LIBRARY.filter((ic) => ic.category === category)
  }, [category])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${
              category === cat ? 'bg-slate-900 text-white dark:bg-indigo-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-6 gap-1.5 max-h-48 overflow-y-auto panel-scroll">
        {filtered.map((ic) => (
          <button
            key={ic.id}
            type="button"
            title={ic.label}
            onClick={() => onSelect(ic.icon)}
            className="aspect-square rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-900 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center text-base"
          >
            {ic.icon.trim()}
          </button>
        ))}
      </div>
    </div>
  )
}

function RecommendationsBar({ card }: { card: CardData }) {
  const recs = useMemo(() => getRecommendations(card), [card])
  if (recs.length === 0) return null

  const iconFor = (level: string) => {
    if (level === 'warning') return '⚠'
    if (level === 'tip') return '✦'
    return 'ℹ'
  }
  const colorFor = (level: string) => {
    if (level === 'warning') return 'border-amber-300 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400'
    if (level === 'tip') return 'border-sky-300 dark:border-sky-900/40 bg-sky-50 dark:bg-sky-900/30 text-sky-800 dark:text-sky-400'
    return 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
  }

  return (
    <div className="mb-5 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Recommandations de design</span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500">{recs.length} conseil(s)</span>
      </div>
      <div className="p-3 flex flex-col gap-1.5 max-h-40 overflow-y-auto panel-scroll">
        {recs.map((rec, i) => (
          <div key={i} className={`text-xs px-3 py-2 rounded-lg border ${colorFor(rec.level)} flex items-start gap-2`}>
            <span className="flex-shrink-0">{iconFor(rec.level)}</span>
            <span>{rec.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
