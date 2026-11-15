import type { CSSProperties } from 'react'
import type { CardData, FieldType, FieldStyle, FontFamily, ArchetypeId, DecorativeLine, LogoConfig, QrConfig, CardIcon, ProfilePhotoConfig, SocialLinks } from './types'
import { FONT_FAMILIES, MM_TO_PX, CARD_W, CARD_H, buildVCard, CARD_TYPE_FEATURES } from './types'
import { useQrCode } from './useQrCode'

export { CARD_W, CARD_H }
export type Face = 'front' | 'back'

/* =========================================================================
   UTILITY: resolve a field's full style (defaults + overrides)
   ========================================================================= */
function resolveFieldStyle(card: CardData, fieldId: FieldType, defaults: Partial<FieldStyle>): FieldStyle {
  const overrides = card.fieldStyles[fieldId] || {}
  return {
    fontFamily: overrides.fontFamily ?? defaults.fontFamily ?? 'Inter',
    fontSize: overrides.fontSize ?? defaults.fontSize ?? 14,
    fontWeight: overrides.fontWeight ?? defaults.fontWeight ?? 400,
    italic: overrides.italic ?? defaults.italic ?? false,
    underline: overrides.underline ?? defaults.underline ?? false,
    uppercase: overrides.uppercase ?? defaults.uppercase ?? false,
    letterSpacing: overrides.letterSpacing ?? defaults.letterSpacing ?? 0,
    color: overrides.color ?? defaults.color ?? '#0f172a',
    opacity: overrides.opacity ?? defaults.opacity ?? 1,
    align: overrides.align ?? defaults.align ?? 'left',
    visible: overrides.visible ?? defaults.visible ?? true,
    offsetX: overrides.offsetX ?? defaults.offsetX ?? 0,
    offsetY: overrides.offsetY ?? defaults.offsetY ?? 0,
    rotation: overrides.rotation ?? defaults.rotation ?? 0,
  }
}

function fontStack(font: FontFamily): string {
  return FONT_FAMILIES.find((f) => f.id === font)?.stack ?? "'Inter', system-ui, sans-serif"
}

function fieldToCss(fs: FieldStyle): CSSProperties {
  const transforms: string[] = []
  if (fs.offsetX || fs.offsetY) transforms.push(`translate(${fs.offsetX * MM_TO_PX}px, ${fs.offsetY * MM_TO_PX}px)`)
  if (fs.rotation) transforms.push(`rotate(${fs.rotation}deg)`)
  return {
    fontFamily: fontStack(fs.fontFamily),
    fontSize: fs.fontSize,
    fontWeight: fs.fontWeight,
    fontStyle: fs.italic ? 'italic' : 'normal',
    textDecoration: fs.underline ? 'underline' : 'none',
    textTransform: fs.uppercase ? 'uppercase' : 'none',
    letterSpacing: `${fs.letterSpacing}px`,
    color: fs.color,
    opacity: fs.opacity,
    textAlign: fs.align,
    transform: transforms.length > 0 ? transforms.join(' ') : undefined,
    lineHeight: 1.25,
  }
}

/* =========================================================================
   BACKGROUND RENDERER
   ========================================================================= */
function BackgroundStyle({ card }: { card: CardData }): CSSProperties {
  const bg = card.background
  if (bg.type === 'solid') return { background: bg.color1 }
  if (bg.type === 'gradient') {
    const intensity = bg.gradientIntensity / 100
    const c1 = bg.color1
    const c2 = bg.color2
    if (bg.gradientDirection === 'radial') {
      return { background: `radial-gradient(circle at 50% 50%, ${c1}, ${c2})` }
    }
    const midStop = `${50 + (intensity - 0.5) * 40}%`
    const dirMap: Record<string, string> = {
      'to-br': '135deg',
      'to-r': '90deg',
      'to-b': '180deg',
      'to-bl': '225deg',
    }
    return { background: `linear-gradient(${dirMap[bg.gradientDirection] ?? '135deg'}, ${c1} ${midStop}, ${c2})` }
  }
  if (bg.type === 'image' && bg.image) {
    return {
      backgroundImage: `url(${bg.image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }
  return { background: bg.color1 }
}

function PatternOverlay({ card }: { card: CardData }) {
  if (card.background.type !== 'pattern') return null
  const { pattern, patternColor, patternOpacity } = card.background
  let bgImage = ''
  const c = patternColor

  if (pattern === 'dots') {
    bgImage = `radial-gradient(${c} 1px, transparent 1px)`
  } else if (pattern === 'grid') {
    bgImage = `linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`
  } else if (pattern === 'diagonal') {
    bgImage = `repeating-linear-gradient(45deg, ${c}, ${c} 1px, transparent 1px, transparent 8px)`
  } else if (pattern === 'chevron') {
    bgImage = `repeating-linear-gradient(45deg, ${c}, ${c} 2px, transparent 2px, transparent 10px), repeating-linear-gradient(-45deg, ${c}, ${c} 2px, transparent 2px, transparent 10px)`
  } else if (pattern === 'waves') {
    bgImage = `repeating-radial-gradient(circle at 0 100%, transparent 0, transparent 10px, ${c} 10px, ${c} 11px)`
  }

  const size = pattern === 'dots' ? '12px 12px' : pattern === 'grid' ? '12px 12px' : undefined

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: bgImage,
        backgroundSize: size,
        opacity: patternOpacity,
        pointerEvents: 'none',
      }}
    />
  )
}

function ImageOverlay({ card }: { card: CardData }) {
  if (card.background.type !== 'image' || !card.background.image) return null
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: card.background.color1,
        opacity: card.background.imageOpacity,
        pointerEvents: 'none',
      }}
    />
  )
}

/* =========================================================================
   DECORATIVE LINE
   ========================================================================= */
function DecorLine({ card, face }: { card: CardData; face: 'front' | 'back' }) {
  const dl: DecorativeLine = card.decorativeLine
  if (!dl.enabled || dl.position === 'none') return null
  if (face === 'back') return null

  const lineStyle: CSSProperties = {
    borderColor: dl.color,
    borderTopWidth: dl.style === 'none' ? 0 : dl.width,
    borderStyle: dl.style,
  }

  if (dl.position === 'top') {
    return <div style={{ position: 'absolute', top: 0, left: 0, right: 0, ...lineStyle }} />
  }
  if (dl.position === 'bottom') {
    return <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, ...lineStyle }} />
  }
  return null
}

/* =========================================================================
   LOGO
   ========================================================================= */
function Logo({ config, card }: { config: LogoConfig; card: CardData }) {
  if (!CARD_TYPE_FEATURES[card.cardType].showLogo || !config.enabled || !config.image) return null
  const posCss: CSSProperties = {}
  const s = config.size
  if (config.position === 'custom') {
    posCss.left = `${config.x}%`
    posCss.top = `${config.y}%`
    posCss.transform = 'translate(-50%, -50%)'
  } else if (config.position === 'top-right') { posCss.top = 16; posCss.right = 16 }
  else if (config.position === 'top-left') { posCss.top = 16; posCss.left = 16 }
  else if (config.position === 'bottom-right') { posCss.bottom = 16; posCss.right = 16 }
  else if (config.position === 'bottom-left') { posCss.bottom = 16; posCss.left = 16 }
  else if (config.position === 'center') { posCss.top = '50%'; posCss.left = '50%'; posCss.transform = 'translate(-50%, -50%)' }

  return (
    <div style={{ position: 'absolute', ...posCss, zIndex: 5 }}>
      <img
        src={config.image}
        alt="Logo"
        style={{
          width: s,
          height: s,
          objectFit: 'contain',
          opacity: config.opacity,
          borderRadius: config.rounded ? '50%' : 0,
        }}
      />
    </div>
  )
}

function ProfilePhoto({ config, card }: { config: ProfilePhotoConfig; card: CardData }) {
  if (!CARD_TYPE_FEATURES[card.cardType].showProfilePhoto || !config.enabled || !config.image) return null
  const borderRadius = config.shape === 'circle' ? '50%' : config.shape === 'rounded' ? '12px' : 0
  return (
    <div style={{ position: 'absolute', left: `${config.x}%`, top: `${config.y}%`, transform: 'translate(-50%, -50%)', zIndex: 4 }}>
      <img
        src={config.image}
        alt="Photo"
        style={{
          width: config.size,
          height: config.size,
          objectFit: 'cover',
          opacity: config.opacity,
          borderRadius,
        }}
      />
    </div>
  )
}

function SocialIcons({ links, card, face }: { links: SocialLinks; card: CardData; face: 'front' | 'back' }) {
  if (!CARD_TYPE_FEATURES[card.cardType].showSocialLinks) return null
  const entries = Object.entries(links).filter(([, v]) => v.trim() !== '')
  if (entries.length === 0) return null
  if (face !== 'back') return null
  const iconMap: Record<string, string> = {
    linkedin: 'in', instagram: '◎', facebook: 'f', twitter: '𝕏',
    whatsapp: '✆', telegram: '✈', youtube: '▷', tiktok: '♪',
  }
  const labelMap: Record<string, string> = {
    linkedin: 'LinkedIn', instagram: 'Instagram', facebook: 'Facebook',
    twitter: 'Twitter', whatsapp: 'WhatsApp', telegram: 'Telegram',
    youtube: 'YouTube', tiktok: 'TikTok',
  }
  const accent = card.fieldStyles.company?.color ?? '#0ea5e9'
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
      {entries.map(([platform, url]) => (
        <a
          key={platform}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 10,
            color: accent,
            textDecoration: 'none',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 12 }}>{iconMap[platform] ?? '●'}</span>
          <span>{labelMap[platform] ?? platform}</span>
        </a>
      ))}
    </div>
  )
}

/* =========================================================================
   QR CODE
   ========================================================================= */
function QrBlock({ card, face }: { card: CardData; face: 'front' | 'back' }) {
  const qrCfg: QrConfig = card.qr
  if (!CARD_TYPE_FEATURES[card.cardType].showQR || !qrCfg.enabled) return null
  if (face !== 'back') return null

  let qrValue: string | null = null
  if (qrCfg.source === 'vcard') qrValue = buildVCard(card)
  else if (qrCfg.source === 'phone' && card.fields.phone) qrValue = `tel:${card.fields.phone.replace(/\s+/g, '')}`
  else if (qrCfg.source === 'email' && card.fields.email) qrValue = `mailto:${card.fields.email}`
  else if (qrCfg.source === 'website' && card.fields.website) qrValue = card.fields.website.startsWith('http') ? card.fields.website : `https://${card.fields.website}`
  else if (qrCfg.source === 'custom' && qrCfg.customValue) qrValue = qrCfg.customValue

  const qr = useQrCode(qrValue, qrCfg.fgColor, qrCfg.bgColor)
  if (!qr) return null

  const posCss: CSSProperties = {}
  if (qrCfg.position === 'bottom-right') { posCss.bottom = 16; posCss.right = 16 }
  else if (qrCfg.position === 'bottom-left') { posCss.bottom = 16; posCss.left = 16 }
  else if (qrCfg.position === 'top-right') { posCss.top = 16; posCss.right = 16 }
  else if (qrCfg.position === 'top-left') { posCss.top = 16; posCss.left = 16 }

  return (
    <div style={{ position: 'absolute', ...posCss, zIndex: 5 }}>
      <img
        src={qr}
        alt="QR code"
        style={{
          width: qrCfg.size,
          height: qrCfg.size,
          borderRadius: qrCfg.rounded ? 12 : 0,
        }}
      />
    </div>
  )
}

/* =========================================================================
   FIELD TEXT COMPONENT
   ========================================================================= */
function FieldText({ card, fieldId, defaults, style: extraStyle }: {
  card: CardData
  fieldId: FieldType
  defaults?: Partial<FieldStyle>
  style?: CSSProperties
}) {
  const features = CARD_TYPE_FEATURES[card.cardType]
  if (fieldId === 'company' && !features.showCompany) return null
  if (fieldId === 'department' && !features.showDepartment) return null
  if (fieldId === 'tagline' && !features.showTagline) return null
  if (fieldId === 'slogan' && !features.showSlogan) return null
  const fs = resolveFieldStyle(card, fieldId, defaults ?? {})
  if (!fs.visible) return null
  const value = card.fields[fieldId]
  if (!value) return null
  return (
    <div style={{ ...fieldToCss(fs), ...extraStyle }}>
      {value}
    </div>
  )
}

/* =========================================================================
   DECORATIVE ICONS
   ========================================================================= */
function CardIcons({ card, face }: { card: CardData; face: 'front' | 'back' }) {
  if (!card.icons || card.icons.length === 0) return null
  const visibleIcons = card.icons.filter((ic) => face === 'back' ? ic.showOnBack : true)
  if (visibleIcons.length === 0) return null
  return (
    <>
      {visibleIcons.map((ic: CardIcon) => (
        <div
          key={ic.id}
          style={{
            position: 'absolute',
            left: `${ic.x}%`,
            top: `${ic.y}%`,
            fontSize: ic.size,
            color: ic.color,
            pointerEvents: 'none',
            zIndex: 3,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {ic.icon}
        </div>
      ))}
    </>
  )
}

/* =========================================================================
   MAIN CARD FACE
   ========================================================================= */
export function CardFace({ card, face }: { card: CardData; face: Face }) {
  const bgStyle = BackgroundStyle({ card })
  const padding = card.effects.innerPadding

  const baseStyle: CSSProperties = {
    width: CARD_W,
    height: CARD_H,
    ...bgStyle,
    border: card.border.style === 'none' ? 'none' : `${card.border.width}px ${card.border.style} ${card.border.color}`,
    borderRadius: card.border.radius,
    overflow: 'hidden',
    boxSizing: 'border-box',
    position: 'relative',
  }

  const innerContentStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    padding: padding,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 2,
  }

  return (
    <div style={baseStyle}>
      <PatternOverlay card={card} />
      <ImageOverlay card={card} />
      <DecorLine card={card} face={face} />
      <CardIcons card={card} face={face} />
      <ProfilePhoto config={card.profilePhoto} card={card} />
      <div style={innerContentStyle}>
        {renderArchetypeContent(card, face)}
      </div>
      <Logo config={card.logo} card={card} />
      <QrBlock card={card} face={face} />
    </div>
  )
}

/* =========================================================================
   ARCHETYPE CONTENT RENDERERS — 30 distinct layouts
   ========================================================================= */
function renderArchetypeContent(card: CardData, face: Face) {
  const arch: ArchetypeId = card.archetype

  if (face === 'back') {
    return <BackFace card={card} />
  }

  switch (arch) {
    case 'classic-left':       return <ClassicLeft card={card} />
    case 'classic-center':     return <ClassicCenter card={card} />
    case 'modern-split':       return <ModernSplit card={card} />
    case 'modern-minimal':     return <ModernMinimal card={card} />
    case 'bold-block':         return <BoldBlock card={card} />
    case 'bold-banner':        return <BoldBanner card={card} />
    case 'elegant-serif':      return <ElegantSerif card={card} />
    case 'corporate-clean':    return <CorporateClean card={card} />
    case 'creative-angled':    return <CreativeAngled card={card} />
    case 'tech-dark':          return <TechDark card={card} />
    case 'circle-photo':       return <CirclePhoto card={card} />
    case 'diagonal-split':     return <DiagonalSplit card={card} />
    case 'vertical-band':      return <VerticalBand card={card} />
    case 'bottom-band':        return <BottomBand card={card} />
    case 'top-accent-bar':     return <TopAccentBar card={card} />
    case 'full-photo-bg':      return <FullPhotoBg card={card} />
    case 'luxury-gold':        return <LuxuryGold card={card} />
    case 'geometric-hexagon':  return <GeometricHexagon card={card} />
    case 'watercolor-organic': return <WatercolorOrganic card={card} />
    case 'asymmetric-offset':  return <AsymmetricOffset card={card} />
    case 'two-column':         return <TwoColumn card={card} />
    case 'stacked-cards':      return <StackedCards card={card} />
    case 'spotlight-center':   return <SpotlightCenter card={card} />
    case 'side-accent-strip':  return <SideAccentStrip card={card} />
    case 'minimal-dots':       return <MinimalDots card={card} />
    case 'gradient-mesh':      return <GradientMesh card={card} />
    case 'frame-border':       return <FrameBorder card={card} />
    case 'monogram-letter':    return <MonogramLetter card={card} />
    case 'horizontal-stripe':  return <HorizontalStripe card={card} />
    case 'badge-seal':         return <BadgeSeal card={card} />
    default:                   return <ClassicLeft card={card} />
  }
}

/* ---------- BACK FACE (shared) ---------- */
function BackFace({ card }: { card: CardData }) {
  const fs = resolveFieldStyle(card, 'phone', { fontFamily: 'Inter', fontSize: 13, fontWeight: 400, color: card.fieldStyles.phone?.color ?? '#0f172a', align: 'left', visible: true, italic: false, uppercase: false, letterSpacing: 0, opacity: 1, offsetX: 0, offsetY: 0, rotation: 0 })
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
      {card.fields.department && (
        <div style={{ ...fieldToCss({ ...fs, fontWeight: 600 }) }}>
          {card.fields.department}
        </div>
      )}
      {card.fields.phone && (
        <div style={{ ...fieldToCss(fs) }}>
          {card.fields.phone}
        </div>
      )}
      {card.fields.email && (
        <div style={{ ...fieldToCss({ ...fs, color: card.fieldStyles.email?.color ?? fs.color }) }}>
          {card.fields.email}
        </div>
      )}
      {card.fields.website && (
        <div style={{ ...fieldToCss({ ...fs, color: card.fieldStyles.website?.color ?? fs.color, fontSize: 12 }) }}>
          {card.fields.website}
        </div>
      )}
      {card.fields.address && (
        <div style={{ ...fieldToCss({ ...fs, color: card.fieldStyles.address?.color ?? fs.color, fontSize: 10, opacity: 0.8 }) }}>
          {card.fields.address}
        </div>
      )}
      <SocialIcons links={card.socialLinks} card={card} face="back" />
    </div>
  )
}

/* =========================================================================
   SHARED HELPERS
   ========================================================================= */
function ContactStack({ card, align = 'left' }: { card: CardData; align?: 'left' | 'center' }) {
  const alignItems = align === 'center' ? 'center' : 'flex-start'
  return (
    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 3, alignItems }}>
      <FieldText card={card} fieldId="department" defaults={card.fieldStyles.department} />
      <FieldText card={card} fieldId="phone" defaults={card.fieldStyles.phone} />
      <FieldText card={card} fieldId="email" defaults={card.fieldStyles.email} />
      <FieldText card={card} fieldId="website" defaults={card.fieldStyles.website} />
      <FieldText card={card} fieldId="address" defaults={card.fieldStyles.address} />
    </div>
  )
}

function NameRow({ card, style }: { card: CardData; style?: CSSProperties }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', ...style }}>
      <FieldText card={card} fieldId="firstName" defaults={card.fieldStyles.firstName} />
      <FieldText card={card} fieldId="lastName" defaults={card.fieldStyles.lastName} />
    </div>
  )
}

function DecorDivider({ card, pos, width = 60 }: { card: CardData; pos: DecorativeLine['position']; width?: number }) {
  if (!card.decorativeLine.enabled || card.decorativeLine.position !== pos) return null
  return (
    <div style={{ width, height: card.decorativeLine.width, background: card.decorativeLine.color, marginTop: 8, marginBottom: 4 }} />
  )
}

/* =========================================================================
   1. CLASSIC LEFT
   ========================================================================= */
function ClassicLeft({ card }: { card: CardData }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
      <NameRow card={card} />
      <DecorDivider card={card} pos="under-name" />
      <FieldText card={card} fieldId="jobTitle" defaults={card.fieldStyles.jobTitle} style={{ marginTop: 2 }} />
      <FieldText card={card} fieldId="company" defaults={card.fieldStyles.company} style={{ marginTop: 6 }} />
      <ContactStack card={card} />
    </div>
  )
}

/* =========================================================================
   2. CLASSIC CENTER
   ========================================================================= */
function ClassicCenter({ card }: { card: CardData }) {
  const c: CSSProperties = { alignItems: 'center', textAlign: 'center' as const }
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, ...c }}>
      <FieldText card={card} fieldId="firstName" defaults={card.fieldStyles.firstName} />
      <FieldText card={card} fieldId="lastName" defaults={card.fieldStyles.lastName} />
      <DecorDivider card={card} pos="under-name" width={50} />
      <FieldText card={card} fieldId="jobTitle" defaults={card.fieldStyles.jobTitle} />
      <FieldText card={card} fieldId="company" defaults={card.fieldStyles.company} style={{ marginTop: 6 }} />
      <ContactStack card={card} align="center" />
    </div>
  )
}

/* =========================================================================
   3. MODERN SPLIT — left accent panel + right content
   ========================================================================= */
function ModernSplit({ card }: { card: CardData }) {
  const accentWidth = Math.round(CARD_W * 0.28)
  const accentBg = card.fieldStyles.company?.color || card.border.color
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', margin: -card.effects.innerPadding }}>
      <div style={{ width: accentWidth, height: '100%', background: accentBg, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 16, gap: 8, flexShrink: 0 }}>
        {card.logo.enabled && card.logo.image && (
          <img src={card.logo.image} alt="Logo" style={{ width: card.logo.size, height: card.logo.size, objectFit: 'contain', opacity: card.logo.opacity, borderRadius: card.logo.rounded ? '50%' : 0 }} />
        )}
        {card.fields.tagline && <FieldText card={card} fieldId="tagline" defaults={card.fieldStyles.tagline} style={{ textAlign: 'center', color: '#fff', opacity: 0.8 }} />}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, padding: card.effects.innerPadding }}>
        <NameRow card={card} />
        <FieldText card={card} fieldId="jobTitle" defaults={card.fieldStyles.jobTitle} />
        <DecorDivider card={card} pos="under-title" width={40} />
        <FieldText card={card} fieldId="company" defaults={card.fieldStyles.company} style={{ marginTop: 4 }} />
        <ContactStack card={card} />
      </div>
    </div>
  )
}

/* =========================================================================
   4. MODERN MINIMAL — bottom-aligned, lots of whitespace
   ========================================================================= */
function ModernMinimal({ card }: { card: CardData }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ marginTop: 'auto' }} />
      <NameRow card={card} />
      <FieldText card={card} fieldId="jobTitle" defaults={card.fieldStyles.jobTitle} />
      <DecorDivider card={card} pos="under-title" width={30} />
      <FieldText card={card} fieldId="company" defaults={card.fieldStyles.company} />
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FieldText card={card} fieldId="department" defaults={card.fieldStyles.department} />
        <FieldText card={card} fieldId="phone" defaults={card.fieldStyles.phone} />
        <FieldText card={card} fieldId="email" defaults={card.fieldStyles.email} />
      </div>
    </div>
  )
}

/* =========================================================================
   5. BOLD BLOCK — large name, uppercase, centered
   ========================================================================= */
function BoldBlock({ card }: { card: CardData }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
      <NameRow card={card} />
      <DecorDivider card={card} pos="bottom" width={80} />
      <FieldText card={card} fieldId="jobTitle" defaults={card.fieldStyles.jobTitle} />
      <FieldText card={card} fieldId="company" defaults={card.fieldStyles.company} style={{ marginTop: 8 }} />
      <ContactStack card={card} />
    </div>
  )
}

/* =========================================================================
   6. BOLD BANNER — colored top banner + content below
   ========================================================================= */
function BoldBanner({ card }: { card: CardData }) {
  const bannerHeight = Math.round(CARD_H * 0.3)
  const bannerBg = card.fieldStyles.company?.color || card.border.color
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', margin: -card.effects.innerPadding }}>
      <div style={{ height: bannerHeight, background: bannerBg, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 4, padding: 16 }}>
        {card.logo.enabled && card.logo.image && (
          <img src={card.logo.image} alt="Logo" style={{ width: card.logo.size * 0.6, height: card.logo.size * 0.6, objectFit: 'contain', opacity: card.logo.opacity, borderRadius: card.logo.rounded ? '50%' : 0 }} />
        )}
        <FieldText card={card} fieldId="company" defaults={card.fieldStyles.company} style={{ color: '#fff', fontWeight: 700, fontSize: 18 }} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 6, padding: card.effects.innerPadding }}>
        <NameRow card={card} />
        <FieldText card={card} fieldId="jobTitle" defaults={card.fieldStyles.jobTitle} />
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
          <FieldText card={card} fieldId="department" defaults={card.fieldStyles.department} />
          <FieldText card={card} fieldId="phone" defaults={card.fieldStyles.phone} />
          <FieldText card={card} fieldId="email" defaults={card.fieldStyles.email} />
          <FieldText card={card} fieldId="website" defaults={card.fieldStyles.website} />
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   7. ELEGANT SERIF — centered, serif fonts, thin divider
   ========================================================================= */
function ElegantSerif({ card }: { card: CardData }) {
  const c: CSSProperties = { alignItems: 'center', textAlign: 'center' as const }
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, ...c }}>
      <FieldText card={card} fieldId="firstName" defaults={card.fieldStyles.firstName} />
      <FieldText card={card} fieldId="lastName" defaults={card.fieldStyles.lastName} />
      <DecorDivider card={card} pos="under-name" width={40} />
      <FieldText card={card} fieldId="jobTitle" defaults={card.fieldStyles.jobTitle} style={{ fontStyle: 'italic' }} />
      <FieldText card={card} fieldId="company" defaults={card.fieldStyles.company} style={{ marginTop: 8 }} />
      <ContactStack card={card} align="center" />
    </div>
  )
}

/* =========================================================================
   8. CORPORATE CLEAN — top name, bottom contact, full-width divider
   ========================================================================= */
function CorporateClean({ card }: { card: CardData }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <NameRow card={card} />
        <FieldText card={card} fieldId="jobTitle" defaults={card.fieldStyles.jobTitle} />
        {card.decorativeLine.enabled && card.decorativeLine.position === 'under-title' && (
          <div style={{ width: '100%', height: 1, background: card.decorativeLine.color, marginTop: 6, marginBottom: 4, opacity: 0.3 }} />
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <FieldText card={card} fieldId="company" defaults={card.fieldStyles.company} />
        <FieldText card={card} fieldId="department" defaults={card.fieldStyles.department} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FieldText card={card} fieldId="phone" defaults={card.fieldStyles.phone} />
          <FieldText card={card} fieldId="email" defaults={card.fieldStyles.email} />
          <FieldText card={card} fieldId="website" defaults={card.fieldStyles.website} />
          <FieldText card={card} fieldId="address" defaults={card.fieldStyles.address} />
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   9. CREATIVE ANGLED — accent shape, diagonal geometry
   ========================================================================= */
function CreativeAngled({ card }: { card: CardData }) {
  const accentBg = card.fieldStyles.company?.color || card.border.color
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', margin: -card.effects.innerPadding }}>
      <div style={{ height: 6, background: accentBg }} />
      <div style={{ flex: 1, padding: card.effects.innerPadding, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', background: `linear-gradient(135deg, transparent 40%, ${accentBg}22 40%)`, pointerEvents: 'none' }} />
        <NameRow card={card} style={{ zIndex: 1 }} />
        <FieldText card={card} fieldId="jobTitle" defaults={card.fieldStyles.jobTitle} style={{ zIndex: 1 }} />
        <FieldText card={card} fieldId="company" defaults={card.fieldStyles.company} style={{ marginTop: 4, zIndex: 1 }} />
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 3, zIndex: 1 }}>
          <FieldText card={card} fieldId="department" defaults={card.fieldStyles.department} />
          <FieldText card={card} fieldId="phone" defaults={card.fieldStyles.phone} />
          <FieldText card={card} fieldId="email" defaults={card.fieldStyles.email} />
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   10. TECH DARK — dark bg, mono font, neon accent line
   ========================================================================= */
function TechDark({ card }: { card: CardData }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
      <NameRow card={card} />
      {card.decorativeLine.enabled && card.decorativeLine.position === 'bottom' && (
        <div style={{ width: '100%', height: card.decorativeLine.width, background: card.decorativeLine.color, marginTop: 6, marginBottom: 6, opacity: 0.6 }} />
      )}
      <FieldText card={card} fieldId="jobTitle" defaults={card.fieldStyles.jobTitle} />
      <FieldText card={card} fieldId="company" defaults={card.fieldStyles.company} style={{ marginTop: 4 }} />
      <ContactStack card={card} />
    </div>
  )
}

/* =========================================================================
   11. CIRCLE PHOTO — large circle in center with logo/photo
   ========================================================================= */
function CirclePhoto({ card }: { card: CardData }) {
  const accentBg = card.fieldStyles.company?.color || card.border.color
  const circleSize = Math.round(CARD_H * 0.55)
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', margin: -card.effects.innerPadding, position: 'relative' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: card.effects.innerPadding, gap: 4 }}>
        <NameRow card={card} />
        <FieldText card={card} fieldId="jobTitle" defaults={card.fieldStyles.jobTitle} />
        <FieldText card={card} fieldId="company" defaults={card.fieldStyles.company} style={{ marginTop: 4 }} />
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <FieldText card={card} fieldId="department" defaults={card.fieldStyles.department} />
          <FieldText card={card} fieldId="phone" defaults={card.fieldStyles.phone} />
          <FieldText card={card} fieldId="email" defaults={card.fieldStyles.email} />
        </div>
      </div>
      <div style={{ width: Math.round(CARD_W * 0.38), display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ width: circleSize, height: circleSize, borderRadius: '50%', background: accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {card.logo.enabled && card.logo.image ? (
            <img src={card.logo.image} alt="Logo" style={{ width: '80%', height: '80%', objectFit: 'contain', opacity: card.logo.opacity }} />
          ) : (
            <div style={{ color: '#fff', fontSize: 40, fontWeight: 800 }}>
              {(card.fields.firstName?.[0] ?? '')}{(card.fields.lastName?.[1] ?? '')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   12. DIAGONAL SPLIT — diagonal color split
   ========================================================================= */
function DiagonalSplit({ card }: { card: CardData }) {
  const accentBg = card.fieldStyles.company?.color || card.border.color
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', margin: -card.effects.innerPadding, position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: accentBg, clipPath: 'polygon(0 0, 100% 0, 100% 35%, 0 65%)' }} />
      <div style={{ flex: 1, padding: card.effects.innerPadding, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, zIndex: 1 }}>
        <NameRow card={card} />
        <FieldText card={card} fieldId="jobTitle" defaults={card.fieldStyles.jobTitle} />
        <FieldText card={card} fieldId="company" defaults={card.fieldStyles.company} style={{ marginTop: 4 }} />
        <ContactStack card={card} />
      </div>
    </div>
  )
}

/* =========================================================================
   13. VERTICAL BAND — colored vertical band on left
   ========================================================================= */
function VerticalBand({ card }: { card: CardData }) {
  const accentBg = card.fieldStyles.company?.color || card.border.color
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', margin: -card.effects.innerPadding }}>
      <div style={{ width: 12, height: '100%', background: accentBg, flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, padding: card.effects.innerPadding }}>
        <NameRow card={card} />
        <FieldText card={card} fieldId="jobTitle" defaults={card.fieldStyles.jobTitle} />
        <FieldText card={card} fieldId="company" defaults={card.fieldStyles.company} style={{ marginTop: 4 }} />
        <ContactStack card={card} />
      </div>
    </div>
  )
}

/* =========================================================================
   14. BOTTOM BAND — colored band at bottom
   ========================================================================= */
function BottomBand({ card }: { card: CardData }) {
  const accentBg = card.fieldStyles.company?.color || card.border.color
  const bandHeight = Math.round(CARD_H * 0.2)
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', margin: -card.effects.innerPadding }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 6, padding: card.effects.innerPadding }}>
        <NameRow card={card} />
        <FieldText card={card} fieldId="jobTitle" defaults={card.fieldStyles.jobTitle} />
        <FieldText card={card} fieldId="company" defaults={card.fieldStyles.company} style={{ marginTop: 4 }} />
      </div>
      <div style={{ height: bandHeight, background: accentBg, display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 20px' }}>
        <FieldText card={card} fieldId="department" defaults={card.fieldStyles.department} style={{ color: '#fff', fontSize: 12 }} />
        <FieldText card={card} fieldId="phone" defaults={card.fieldStyles.phone} style={{ color: '#fff', fontSize: 12 }} />
        <FieldText card={card} fieldId="email" defaults={card.fieldStyles.email} style={{ color: '#fff', fontSize: 12 }} />
      </div>
    </div>
  )
}

/* =========================================================================
   15. TOP ACCENT BAR — thin colored bar at top, minimal content
   ========================================================================= */
function TopAccentBar({ card }: { card: CardData }) {
  const accentBg = card.fieldStyles.company?.color || card.border.color
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', margin: -card.effects.innerPadding }}>
      <div style={{ height: 4, background: accentBg }} />
      <div style={{ flex: 1, padding: card.effects.innerPadding, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
        <NameRow card={card} />
        <FieldText card={card} fieldId="jobTitle" defaults={card.fieldStyles.jobTitle} />
        <FieldText card={card} fieldId="company" defaults={card.fieldStyles.company} style={{ marginTop: 4 }} />
        <ContactStack card={card} />
      </div>
    </div>
  )
}

/* =========================================================================
   16. FULL PHOTO BG — image background with text overlay
   ========================================================================= */
function FullPhotoBg({ card }: { card: CardData }) {
  const overlayColor = card.background.color1
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 6, background: card.background.image ? 'transparent' : card.background.color1 }}>
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${overlayColor}ee, ${overlayColor}88 50%, transparent)`, pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <NameRow card={card} />
        <FieldText card={card} fieldId="jobTitle" defaults={card.fieldStyles.jobTitle} />
        <FieldText card={card} fieldId="company" defaults={card.fieldStyles.company} style={{ marginTop: 4 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 8 }}>
          <FieldText card={card} fieldId="department" defaults={card.fieldStyles.department} />
          <FieldText card={card} fieldId="phone" defaults={card.fieldStyles.phone} />
          <FieldText card={card} fieldId="email" defaults={card.fieldStyles.email} />
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   17. LUXURY GOLD — dark bg, gold accents, serif, double border
   ========================================================================= */
function LuxuryGold({ card }: { card: CardData }) {
  const goldColor = card.fieldStyles.company?.color || '#d4af37'
  const c: CSSProperties = { alignItems: 'center', textAlign: 'center' as const }
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, ...c }}>
      <div style={{ width: 50, height: 1, background: goldColor, marginBottom: 8 }} />
      <FieldText card={card} fieldId="firstName" defaults={card.fieldStyles.firstName} />
      <FieldText card={card} fieldId="lastName" defaults={card.fieldStyles.lastName} />
      <DecorDivider card={card} pos="under-name" width={40} />
      <FieldText card={card} fieldId="jobTitle" defaults={card.fieldStyles.jobTitle} style={{ fontStyle: 'italic' }} />
      <FieldText card={card} fieldId="company" defaults={card.fieldStyles.company} style={{ marginTop: 8 }} />
      <div style={{ width: 50, height: 1, background: goldColor, marginTop: 12 }} />
      <ContactStack card={card} align="center" />
    </div>
  )
}

/* =========================================================================
   18. GEOMETRIC HEXAGON — hex pattern bg, modern tech style
   ========================================================================= */
function GeometricHexagon({ card }: { card: CardData }) {
  const accentBg = card.fieldStyles.company?.color || card.border.color
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', margin: -card.effects.innerPadding, position: 'relative' }}>
      <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, background: accentBg, clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', opacity: 0.15 }} />
      <div style={{ position: 'absolute', bottom: -30, left: -10, width: 80, height: 80, background: accentBg, clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', opacity: 0.1 }} />
      <div style={{ flex: 1, padding: card.effects.innerPadding, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, zIndex: 1 }}>
        <NameRow card={card} />
        <FieldText card={card} fieldId="jobTitle" defaults={card.fieldStyles.jobTitle} />
        <FieldText card={card} fieldId="company" defaults={card.fieldStyles.company} style={{ marginTop: 4 }} />
        <ContactStack card={card} />
      </div>
    </div>
  )
}

/* =========================================================================
   19. WATERCOLOR ORGANIC — soft gradient, organic shapes
   ========================================================================= */
function WatercolorOrganic({ card }: { card: CardData }) {
  const accentBg = card.fieldStyles.company?.color || card.border.color
  const c: CSSProperties = { alignItems: 'center', textAlign: 'center' as const }
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, ...c, position: 'relative' }}>
      <div style={{ position: 'absolute', top: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: accentBg, opacity: 0.08, filter: 'blur(20px)' }} />
      <div style={{ position: 'absolute', bottom: -50, right: -30, width: 140, height: 140, borderRadius: '50%', background: accentBg, opacity: 0.06, filter: 'blur(15px)' }} />
      <FieldText card={card} fieldId="firstName" defaults={card.fieldStyles.firstName} />
      <FieldText card={card} fieldId="lastName" defaults={card.fieldStyles.lastName} />
      <DecorDivider card={card} pos="under-name" width={40} />
      <FieldText card={card} fieldId="jobTitle" defaults={card.fieldStyles.jobTitle} style={{ fontStyle: 'italic' }} />
      <FieldText card={card} fieldId="company" defaults={card.fieldStyles.company} style={{ marginTop: 8 }} />
      <ContactStack card={card} align="center" />
    </div>
  )
}

/* =========================================================================
   20. ASYMMETRIC OFFSET — content shifted, dynamic composition
   ========================================================================= */
function AsymmetricOffset({ card }: { card: CardData }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 40, paddingLeft: 30 }}>
      <NameRow card={card} />
      <FieldText card={card} fieldId="jobTitle" defaults={card.fieldStyles.jobTitle} />
      <DecorDivider card={card} pos="under-title" width={30} />
      <FieldText card={card} fieldId="company" defaults={card.fieldStyles.company} />
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 3, paddingBottom: 10 }}>
        <FieldText card={card} fieldId="department" defaults={card.fieldStyles.department} />
        <FieldText card={card} fieldId="phone" defaults={card.fieldStyles.phone} />
        <FieldText card={card} fieldId="email" defaults={card.fieldStyles.email} />
        <FieldText card={card} fieldId="website" defaults={card.fieldStyles.website} />
      </div>
    </div>
  )
}

/* =========================================================================
   21. TWO COLUMN — identity left, contact right
   ========================================================================= */
function TwoColumn({ card }: { card: CardData }) {
  const accentBg = card.fieldStyles.company?.color || card.border.color
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', gap: 16 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, borderRight: `1px solid ${accentBg}33`, paddingRight: 16 }}>
        <NameRow card={card} />
        <FieldText card={card} fieldId="jobTitle" defaults={card.fieldStyles.jobTitle} />
        <FieldText card={card} fieldId="company" defaults={card.fieldStyles.company} style={{ marginTop: 4 }} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, paddingLeft: 4 }}>
        <FieldText card={card} fieldId="department" defaults={card.fieldStyles.department} />
        <FieldText card={card} fieldId="phone" defaults={card.fieldStyles.phone} />
        <FieldText card={card} fieldId="email" defaults={card.fieldStyles.email} />
        <FieldText card={card} fieldId="website" defaults={card.fieldStyles.website} />
        <FieldText card={card} fieldId="address" defaults={card.fieldStyles.address} />
      </div>
    </div>
  )
}

/* =========================================================================
   22. STACKED CARDS — stacked zones with separators
   ========================================================================= */
function StackedCards({ card }: { card: CardData }) {
  const accentBg = card.fieldStyles.company?.color || card.border.color
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ padding: '8px 0', borderBottom: `1px solid ${accentBg}33`, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <NameRow card={card} />
        <FieldText card={card} fieldId="jobTitle" defaults={card.fieldStyles.jobTitle} />
      </div>
      <div style={{ padding: '8px 0', borderBottom: `1px solid ${accentBg}33` }}>
        <FieldText card={card} fieldId="company" defaults={card.fieldStyles.company} />
      </div>
      <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <FieldText card={card} fieldId="department" defaults={card.fieldStyles.department} />
        <FieldText card={card} fieldId="phone" defaults={card.fieldStyles.phone} />
        <FieldText card={card} fieldId="email" defaults={card.fieldStyles.email} />
        <FieldText card={card} fieldId="website" defaults={card.fieldStyles.website} />
      </div>
    </div>
  )
}

/* =========================================================================
   23. SPOTLIGHT CENTER — radial gradient, content centered in light
   ========================================================================= */
function SpotlightCenter({ card }: { card: CardData }) {
  const c: CSSProperties = { alignItems: 'center', textAlign: 'center' as const }
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, ...c }}>
      <FieldText card={card} fieldId="firstName" defaults={card.fieldStyles.firstName} />
      <FieldText card={card} fieldId="lastName" defaults={card.fieldStyles.lastName} />
      <DecorDivider card={card} pos="under-name" width={50} />
      <FieldText card={card} fieldId="jobTitle" defaults={card.fieldStyles.jobTitle} />
      <FieldText card={card} fieldId="company" defaults={card.fieldStyles.company} style={{ marginTop: 6 }} />
      <ContactStack card={card} align="center" />
    </div>
  )
}

/* =========================================================================
   24. SIDE ACCENT STRIP — colored strips on both sides
   ========================================================================= */
function SideAccentStrip({ card }: { card: CardData }) {
  const accentBg = card.fieldStyles.company?.color || card.border.color
  const c: CSSProperties = { alignItems: 'center', textAlign: 'center' as const }
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', margin: -card.effects.innerPadding }}>
      <div style={{ width: 8, height: '100%', background: accentBg, flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, padding: card.effects.innerPadding, ...c }}>
        <NameRow card={card} />
        <FieldText card={card} fieldId="jobTitle" defaults={card.fieldStyles.jobTitle} />
        <FieldText card={card} fieldId="company" defaults={card.fieldStyles.company} style={{ marginTop: 4 }} />
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
          <FieldText card={card} fieldId="department" defaults={card.fieldStyles.department} />
          <FieldText card={card} fieldId="phone" defaults={card.fieldStyles.phone} />
          <FieldText card={card} fieldId="email" defaults={card.fieldStyles.email} />
        </div>
      </div>
      <div style={{ width: 8, height: '100%', background: accentBg, flexShrink: 0 }} />
    </div>
  )
}

/* =========================================================================
   25. MINIMAL DOTS — subtle dot pattern, very minimal layout
   ========================================================================= */
function MinimalDots({ card }: { card: CardData }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ marginTop: 'auto' }} />
      <NameRow card={card} />
      <FieldText card={card} fieldId="jobTitle" defaults={card.fieldStyles.jobTitle} />
      <FieldText card={card} fieldId="company" defaults={card.fieldStyles.company} />
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FieldText card={card} fieldId="department" defaults={card.fieldStyles.department} />
        <FieldText card={card} fieldId="phone" defaults={card.fieldStyles.phone} />
        <FieldText card={card} fieldId="email" defaults={card.fieldStyles.email} />
      </div>
    </div>
  )
}

/* =========================================================================
   26. GRADIENT MESH — multi-color gradient, centered
   ========================================================================= */
function GradientMesh({ card }: { card: CardData }) {
  const c: CSSProperties = { alignItems: 'center', textAlign: 'center' as const }
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, ...c }}>
      <FieldText card={card} fieldId="firstName" defaults={card.fieldStyles.firstName} />
      <FieldText card={card} fieldId="lastName" defaults={card.fieldStyles.lastName} />
      <DecorDivider card={card} pos="under-name" width={50} />
      <FieldText card={card} fieldId="jobTitle" defaults={card.fieldStyles.jobTitle} />
      <FieldText card={card} fieldId="company" defaults={card.fieldStyles.company} style={{ marginTop: 4 }} />
      <ContactStack card={card} align="center" />
    </div>
  )
}

/* =========================================================================
   27. FRAME BORDER — decorative double border, elegant centered
   ========================================================================= */
function FrameBorder({ card }: { card: CardData }) {
  const frameColor = card.border.color
  const c: CSSProperties = { alignItems: 'center', textAlign: 'center' as const }
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, ...c, border: `1px solid ${frameColor}`, margin: -8, padding: 16 }}>
      <FieldText card={card} fieldId="firstName" defaults={card.fieldStyles.firstName} />
      <FieldText card={card} fieldId="lastName" defaults={card.fieldStyles.lastName} />
      <DecorDivider card={card} pos="under-name" width={40} />
      <FieldText card={card} fieldId="jobTitle" defaults={card.fieldStyles.jobTitle} />
      <FieldText card={card} fieldId="company" defaults={card.fieldStyles.company} style={{ marginTop: 8 }} />
      <ContactStack card={card} align="center" />
    </div>
  )
}

/* =========================================================================
   28. MONOGRAM LETTER — large initial letter watermark
   ========================================================================= */
function MonogramLetter({ card }: { card: CardData }) {
  const initial = (card.fields.firstName?.[0] ?? '') + (card.fields.lastName?.[0] ?? '')
  const accentBg = card.fieldStyles.company?.color || card.border.color
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, position: 'relative' }}>
      <div style={{ position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%)', fontSize: 200, fontWeight: 900, color: accentBg, opacity: 0.06, pointerEvents: 'none', lineHeight: 1 }}>
        {initial}
      </div>
      <NameRow card={card} style={{ zIndex: 1 }} />
      <DecorDivider card={card} pos="under-name" width={60} />
      <FieldText card={card} fieldId="jobTitle" defaults={card.fieldStyles.jobTitle} style={{ zIndex: 1 }} />
      <FieldText card={card} fieldId="company" defaults={card.fieldStyles.company} style={{ marginTop: 4, zIndex: 1 }} />
      <ContactStack card={card} />
    </div>
  )
}

/* =========================================================================
   29. HORIZONTAL STRRIPE — colored horizontal band across middle
   ========================================================================= */
function HorizontalStripe({ card }: { card: CardData }) {
  const accentBg = card.fieldStyles.company?.color || card.border.color
  const stripeHeight = Math.round(CARD_H * 0.15)
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', margin: -card.effects.innerPadding }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 4, padding: card.effects.innerPadding }}>
        <NameRow card={card} />
        <FieldText card={card} fieldId="jobTitle" defaults={card.fieldStyles.jobTitle} />
      </div>
      <div style={{ height: stripeHeight, background: accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px' }}>
        <FieldText card={card} fieldId="company" defaults={card.fieldStyles.company} style={{ color: '#fff', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', letterSpacing: '2px' }} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 3, padding: card.effects.innerPadding }}>
        <FieldText card={card} fieldId="department" defaults={card.fieldStyles.department} />
        <FieldText card={card} fieldId="phone" defaults={card.fieldStyles.phone} />
        <FieldText card={card} fieldId="email" defaults={card.fieldStyles.email} />
        <FieldText card={card} fieldId="website" defaults={card.fieldStyles.website} />
      </div>
    </div>
  )
}

/* =========================================================================
   30. BADGE SEAL — circular seal/badge style, centered
   ========================================================================= */
function BadgeSeal({ card }: { card: CardData }) {
  const accentBg = card.fieldStyles.company?.color || card.border.color
  const c: CSSProperties = { alignItems: 'center', textAlign: 'center' as const }
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, ...c }}>
      <div style={{ width: 60, height: 60, borderRadius: '50%', border: `2px solid ${accentBg}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
        {card.logo.enabled && card.logo.image ? (
          <img src={card.logo.image} alt="Logo" style={{ width: 40, height: 40, objectFit: 'contain', opacity: card.logo.opacity }} />
        ) : (
          <div style={{ fontSize: 24, fontWeight: 800, color: accentBg }}>
            {(card.fields.firstName?.[0] ?? '')}
          </div>
        )}
      </div>
      <FieldText card={card} fieldId="firstName" defaults={card.fieldStyles.firstName} />
      <FieldText card={card} fieldId="lastName" defaults={card.fieldStyles.lastName} />
      <DecorDivider card={card} pos="under-name" width={40} />
      <FieldText card={card} fieldId="jobTitle" defaults={card.fieldStyles.jobTitle} style={{ textTransform: 'uppercase', letterSpacing: '1.5px', fontSize: 11 }} />
      <FieldText card={card} fieldId="company" defaults={card.fieldStyles.company} style={{ marginTop: 8 }} />
      <ContactStack card={card} align="center" />
    </div>
  )
}
