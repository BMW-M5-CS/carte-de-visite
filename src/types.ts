/* =========================================================================
   TYPES — Business card data model
   ========================================================================= */

export type FontFamily =
  | 'Inter'
  | 'Georgia'
  | 'Playfair Display'
  | 'Roboto Mono'
  | 'Montserrat'
  | 'Lora'
  | 'Poppins'
  | 'Source Serif Pro'

export type FontFamilyId = FontFamily

export type TextAlign = 'left' | 'center' | 'right'

export type BackgroundType = 'solid' | 'gradient' | 'pattern' | 'image'

export type GradientDirection = 'to-br' | 'to-r' | 'to-b' | 'to-bl' | 'radial'

export type PatternType = 'dots' | 'grid' | 'diagonal' | 'chevron' | 'waves'

export type BorderStyle = 'none' | 'solid' | 'dashed' | 'dotted' | 'double'

export type FieldType =
  | 'firstName'
  | 'lastName'
  | 'jobTitle'
  | 'company'
  | 'department'
  | 'phone'
  | 'email'
  | 'website'
  | 'address'
  | 'tagline'
  | 'slogan'

export type FieldStyle = {
  fontFamily: FontFamily
  fontSize: number
  fontWeight: number
  italic: boolean
  underline: boolean
  uppercase: boolean
  letterSpacing: number
  color: string
  opacity: number
  align: TextAlign
  visible: boolean
  offsetX: number
  offsetY: number
  rotation: number
}

export type CardBackground = {
  type: BackgroundType
  color1: string
  color2: string
  gradientDirection: GradientDirection
  gradientIntensity: number
  pattern: PatternType
  patternColor: string
  patternOpacity: number
  image: string | null
  imageOpacity: number
}

export type CardBorder = {
  style: BorderStyle
  color: string
  width: number
  radius: number
}

export type CardEffects = {
  shadow: boolean
  shadowColor: string
  shadowBlur: number
  shadowOffsetY: number
  innerPadding: number
  cardOpacity: number
}

export type QrConfig = {
  enabled: boolean
  source: 'vcard' | 'phone' | 'email' | 'website' | 'custom'
  customValue: string
  size: number
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  bgColor: string
  fgColor: string
  margin: number
  rounded: boolean
}

export type LogoConfig = {
  enabled: boolean
  image: string | null
  size: number
  position: 'top-right' | 'top-left' | 'center' | 'bottom-right' | 'bottom-left' | 'custom'
  x: number
  y: number
  opacity: number
  rounded: boolean
}

export type DecorativeLine = {
  enabled: boolean
  color: string
  width: number
  style: BorderStyle
  position: 'top' | 'bottom' | 'under-name' | 'under-title' | 'none'
}

export type CardType = 'personnel' | 'professionnel' | 'freelance' | 'entreprise'

export const CARD_TYPES: { id: CardType; label: string; description: string }[] = [
  { id: 'personnel',    label: 'Personnel',    description: 'Carte personnelle pour vos contacts privés' },
  { id: 'professionnel', label: 'Professionnel', description: 'Carte pour votre activité professionnelle' },
  { id: 'freelance',    label: 'Freelance',    description: 'Carte pour indépendants et auto-entrepreneurs' },
  { id: 'entreprise',   label: 'Entreprise',   description: 'Carte corporate pour équipes et sociétés' },
]

export type CardTypeFeatures = {
  showCompany: boolean
  showDepartment: boolean
  showLogo: boolean
  showProfilePhoto: boolean
  showSocialLinks: boolean
  showQR: boolean
  showTagline: boolean
  showSlogan: boolean
  recommendedArchetypes: ArchetypeId[]
}

export const CARD_TYPE_FEATURES: Record<CardType, CardTypeFeatures> = {
  personnel: {
    showCompany: false,
    showDepartment: false,
    showLogo: false,
    showProfilePhoto: true,
    showSocialLinks: true,
    showQR: true,
    showTagline: true,
    showSlogan: true,
    recommendedArchetypes: ['classic-left', 'classic-center', 'elegant-serif', 'circle-photo', 'watercolor-organic', 'asymmetric-offset', 'minimal-dots', 'gradient-mesh', 'full-photo-bg'],
  },
  professionnel: {
    showCompany: true,
    showDepartment: true,
    showLogo: true,
    showProfilePhoto: true,
    showSocialLinks: true,
    showQR: true,
    showTagline: true,
    showSlogan: true,
    recommendedArchetypes: ['classic-left', 'classic-center', 'modern-split', 'corporate-clean', 'elegant-serif', 'two-column', 'top-accent-bar', 'frame-border', 'monogram-letter'],
  },
  freelance: {
    showCompany: true,
    showDepartment: false,
    showLogo: true,
    showProfilePhoto: true,
    showSocialLinks: true,
    showQR: true,
    showTagline: true,
    showSlogan: true,
    recommendedArchetypes: ['modern-split', 'modern-minimal', 'bold-block', 'creative-angled', 'circle-photo', 'asymmetric-offset', 'minimal-dots', 'gradient-mesh'],
  },
  entreprise: {
    showCompany: true,
    showDepartment: true,
    showLogo: true,
    showProfilePhoto: false,
    showSocialLinks: true,
    showQR: true,
    showTagline: false,
    showSlogan: true,
    recommendedArchetypes: ['corporate-clean', 'bold-banner', 'vertical-band', 'bottom-band', 'two-column', 'stacked-cards', 'side-accent-strip', 'luxury-gold', 'horizontal-stripe', 'badge-seal'],
  },
}

export type CardIcon = {
  id: string
  icon: string
  color: string
  size: number
  x: number
  y: number
  showOnBack: boolean
}

export type SocialLink = {
  platform: string
  url: string
}

export type SocialLinks = {
  linkedin: string
  instagram: string
  facebook: string
  twitter: string
  whatsapp: string
  telegram: string
  youtube: string
  tiktok: string
}

export type ProfilePhotoConfig = {
  enabled: boolean
  image: string | null
  size: number
  x: number
  y: number
  shape: 'circle' | 'square' | 'rounded'
  opacity: number
}

/* =========================================================================
   ICON LIBRARY — 150+ icons across categories
   ========================================================================= */

export type IconCategory = 'Contact' | 'Social' | 'Business' | 'Industry' | 'Decorative' | 'Arrows' | 'Shapes'

export type IconDef = { id: string; icon: string; label: string; category: IconCategory }

export const ICON_LIBRARY: IconDef[] = [
  // Contact
  { id: 'phone',       icon: '☎',  label: 'Téléphone',     category: 'Contact' },
  { id: 'mobile',      icon: '📱', label: 'Mobile',         category: 'Contact' },
  { id: 'fax',         icon: '📠', label: 'Fax',            category: 'Contact' },
  { id: 'mail',        icon: '✉',  label: 'Email',          category: 'Contact' },
  { id: 'envelope',    icon: '✉',  label: 'Enveloppe',      category: 'Contact' },
  { id: 'web',         icon: '🌐', label: 'Site web',       category: 'Contact' },
  { id: 'globe',       icon: '🌍', label: 'Globe',          category: 'Contact' },
  { id: 'location',    icon: '📍', label: 'Localisation',   category: 'Contact' },
  { id: 'pin',         icon: '📌', label: 'Marqueur',       category: 'Contact' },
  { id: 'map',         icon: '🗺',  label: 'Carte',          category: 'Contact' },
  { id: 'address',     icon: '⌖',  label: 'Adresse',        category: 'Contact' },
  { id: 'home',        icon: '🏠', label: 'Domicile',       category: 'Contact' },
  { id: 'clock',       icon: '🕐', label: 'Horloge',        category: 'Contact' },
  { id: 'calendar',    icon: '📅', label: 'Calendrier',     category: 'Contact' },

  // Social Media
  { id: 'linkedin',    icon: 'in',  label: 'LinkedIn',      category: 'Social' },
  { id: 'instagram',   icon: '◎',   label: 'Instagram',     category: 'Social' },
  { id: 'facebook',    icon: 'f',   label: 'Facebook',      category: 'Social' },
  { id: 'twitter',     icon: '𝕏',   label: 'Twitter/X',     category: 'Social' },
  { id: 'whatsapp',    icon: '✆',   label: 'WhatsApp',      category: 'Social' },
  { id: 'telegram',    icon: '✈',   label: 'Telegram',      category: 'Social' },
  { id: 'youtube',     icon: '▷',   label: 'YouTube',       category: 'Social' },
  { id: 'tiktok',      icon: '♪',   label: 'TikTok',        category: 'Social' },
  { id: 'snapchat',    icon: '♢',   label: 'Snapchat',      category: 'Social' },
  { id: 'pinterest',   icon: 'ⓟ',   label: 'Pinterest',     category: 'Social' },
  { id: 'github',      icon: '⌥',   label: 'GitHub',        category: 'Social' },
  { id: 'behance',     icon: 'Be',  label: 'Behance',       category: 'Social' },
  { id: 'dribbble',    icon: '◉',   label: 'Dribbble',      category: 'Social' },
  { id: 'vimeo',       icon: '▽',   label: 'Vimeo',         category: 'Social' },
  { id: 'soundcloud',  icon: '☁',   label: 'SoundCloud',    category: 'Social' },
  { id: 'spotify',     icon: '♫',   label: 'Spotify',       category: 'Social' },
  { id: 'discord',     icon: '✦',   label: 'Discord',       category: 'Social' },
  { id: 'twitch',      icon: '▶',   label: 'Twitch',        category: 'Social' },
  { id: 'medium',      icon: 'M',   label: 'Medium',        category: 'Social' },
  { id: 'reddit',      icon: '★',   label: 'Reddit',        category: 'Social' },
  { id: 'weixin',      icon: '微',   label: 'WeChat',        category: 'Social' },
  { id: 'vk',          icon: 'VK',  label: 'VK',            category: 'Social' },
  { id: 'xing',        icon: 'X',   label: 'Xing',          category: 'Social' },

  // Business
  { id: 'briefcase',   icon: '💼', label: 'Mallette',      category: 'Business' },
  { id: 'building',    icon: '🏢', label: 'Immeuble',      category: 'Business' },
  { id: 'chart',       icon: '📊', label: 'Graphique',     category: 'Business' },
  { id: 'handshake',   icon: '🤝', label: 'Poignée',       category: 'Business' },
  { id: 'target',      icon: '🎯', label: 'Cible',         category: 'Business' },
  { id: 'trophy',      icon: '🏆', label: 'Trophée',       category: 'Business' },
  { id: 'medal',       icon: '🏅', label: 'Médaille',      category: 'Business' },
  { id: 'certificate', icon: '📜', label: 'Certificat',    category: 'Business' },
  { id: 'shield',      icon: '🛡', label: 'Bouclier',      category: 'Business' },
  { id: 'crown',       icon: '👑', label: 'Couronne',      category: 'Business' },
  { id: 'key',         icon: '🔑', label: 'Clé',           category: 'Business' },
  { id: 'lock',        icon: '🔒', label: 'Cadenas',       category: 'Business' },
  { id: 'bank',        icon: '🏦', label: 'Banque',        category: 'Business' },
  { id: 'money',       icon: '💰', label: 'Argent',        category: 'Business' },
  { id: 'euro',        icon: '€',  label: 'Euro',          category: 'Business' },
  { id: 'dollar',      icon: '$',  label: 'Dollar',        category: 'Business' },
  { id: 'percent',     icon: '%',  label: 'Pourcentage',   category: 'Business' },
  { id: 'briefcase2',  icon: '👜', label: 'Sac pro',       category: 'Business' },
  { id: 'store',       icon: '🏪', label: 'Boutique',      category: 'Business' },
  { id: 'factory',     icon: '🏭', label: 'Usine',         category: 'Business' },
  { id: 'scale',       icon: '⚖',  label: 'Justice',       category: 'Business' },
  { id: 'gavel',       icon: '🔨', label: 'Marteau',       category: 'Business' },

  // Industry
  { id: 'heart',       icon: '♥',  label: 'Santé',         category: 'Industry' },
  { id: 'hospital',    icon: '✚',  label: 'Médical',       category: 'Industry' },
  { id: 'stethoscope', icon: '⚕',  label: 'Stéthoscope',   category: 'Industry' },
  { id: 'pill',        icon: '💊', label: 'Pharmacie',     category: 'Industry' },
  { id: 'tooth',       icon: '🦷', label: 'Dentaire',      category: 'Industry' },
  { id: 'graduation',  icon: '🎓', label: 'Éducation',     category: 'Industry' },
  { id: 'book',        icon: '📚', label: 'Livres',        category: 'Industry' },
  { id: 'ruler',       icon: '📏', label: 'Architecture',  category: 'Industry' },
  { id: 'compass',     icon: '🧭', label: 'Boussole',      category: 'Industry' },
  { id: 'hammer',      icon: '⚒',  label: 'Construction',  category: 'Industry' },
  { id: 'wrench',      icon: '🔧', label: 'Outils',        category: 'Industry' },
  { id: 'gear',        icon: '⚙',  label: 'Engrenage',     category: 'Industry' },
  { id: 'camera',      icon: '📷', label: 'Photo',         category: 'Industry' },
  { id: 'film',        icon: '🎬', label: 'Cinéma',        category: 'Industry' },
  { id: 'palette',     icon: '🎨', label: 'Art',           category: 'Industry' },
  { id: 'music',       icon: '♪',  label: 'Musique',       category: 'Industry' },
  { id: 'mic',         icon: '🎤', label: 'Micro',         category: 'Industry' },
  { id: 'scissors',    icon: '✂',  label: 'Coiffure',      category: 'Industry' },
  { id: 'spa',         icon: '🌸', label: 'Spa/Beauté',    category: 'Industry' },
  { id: 'car',         icon: '🚗', label: 'Automobile',    category: 'Industry' },
  { id: 'plane',       icon: '✈',  label: 'Aviation',      category: 'Industry' },
  { id: 'restaurant',  icon: '🍽',  label: 'Restaurant',   category: 'Industry' },
  { id: 'coffee',      icon: '☕', label: 'Café',          category: 'Industry' },
  { id: 'wine',        icon: '🍷', label: 'Vin',           category: 'Industry' },
  { id: 'leaf',        icon: '☘',  label: 'Nature/Bio',    category: 'Industry' },
  { id: 'tree',        icon: '🌳', label: 'Arbre',         category: 'Industry' },
  { id: 'flask',       icon: '⚗',  label: 'Science',       category: 'Industry' },
  { id: 'atom',        icon: '⚛',  label: 'Atome',         category: 'Industry' },
  { id: 'dna',         icon: '🧬', label: 'ADN',           category: 'Industry' },
  { id: 'rocket',      icon: '🚀', label: 'Startup',       category: 'Industry' },
  { id: 'football',    icon: '⚽', label: 'Sport',         category: 'Industry' },
  { id: 'dumbbell',    icon: '💪', label: 'Fitness',       category: 'Industry' },
  { id: 'gamepad',     icon: '🎮', label: 'Gaming',        category: 'Industry' },
  { id: 'code',        icon: '⌨',  label: 'Code',          category: 'Industry' },
  { id: 'terminal',    icon: '⌘',  label: 'Terminal',      category: 'Industry' },
  { id: 'cpu',         icon: '▣',  label: 'CPU',           category: 'Industry' },

  // Decorative
  { id: 'star',        icon: '★',  label: 'Étoile',        category: 'Decorative' },
  { id: 'star-outline',icon: '☆',  label: 'Étoile vide',   category: 'Decorative' },
  { id: 'sparkle',     icon: '✦',  label: 'Étincelle',     category: 'Decorative' },
  { id: 'sparkle2',    icon: '✧',  label: 'Scintillement', category: 'Decorative' },
  { id: 'diamond',     icon: '◆',  label: 'Diamant',       category: 'Decorative' },
  { id: 'flower',      icon: '✿',  label: 'Fleur',         category: 'Decorative' },
  { id: 'snowflake',   icon: '❄',  label: 'Flocon',        category: 'Decorative' },
  { id: 'sun',         icon: '☀',  label: 'Soleil',        category: 'Decorative' },
  { id: 'moon',        icon: '☾',  label: 'Lune',          category: 'Decorative' },
  { id: 'cloud',       icon: '☁',  label: 'Nuage',         category: 'Decorative' },
  { id: 'fire',        icon: '🔥', label: 'Feu',           category: 'Decorative' },
  { id: 'lightning',   icon: '⚡', label: 'Éclair',        category: 'Decorative' },
  { id: 'rainbow',     icon: '🌈', label: 'Arc-en-ciel',   category: 'Decorative' },
  { id: 'feather',     icon: ' Feather', label: 'Plume',   category: 'Decorative' },
  { id: 'anchor',      icon: '⚓', label: 'Ancre',         category: 'Decorative' },
  { id: 'fingerprint', icon: '◑',  label: 'Empreinte',     category: 'Decorative' },
  { id: 'infinity',    icon: '∞',  label: 'Infini',        category: 'Decorative' },
  { id: 'yinyang',     icon: '☯',  label: 'Yin-Yang',      category: 'Decorative' },
  { id: 'peace',       icon: '☮',  label: 'Paix',          category: 'Decorative' },
  { id: 'check',       icon: '✓',  label: 'Validé',        category: 'Decorative' },
  { id: 'check-circle',icon: '✔',  label: 'Validé cercle', category: 'Decorative' },
  { id: 'asterisk',    icon: '✱',  label: 'Astérisque',    category: 'Decorative' },
  { id: 'ornament',    icon: '❧',  label: 'Ornement',      category: 'Decorative' },
  { id: 'fleur',       icon: '⚜',  label: 'Fleur de lys',  category: 'Decorative' },
  { id: 'quill',       icon: '✒',  label: 'Plume d\'encre',category: 'Decorative' },
  { id: 'crown2',      icon: '♛',  label: 'Reine',         category: 'Decorative' },

  // Arrows
  { id: 'arrow-r',     icon: '➤',  label: 'Flèche droite', category: 'Arrows' },
  { id: 'arrow-l',     icon: '⬅',  label: 'Flèche gauche', category: 'Arrows' },
  { id: 'arrow-u',     icon: '⬆',  label: 'Flèche haut',   category: 'Arrows' },
  { id: 'arrow-d',     icon: '⬇',  label: 'Flèche bas',    category: 'Arrows' },
  { id: 'arrow-ur',    icon: '↗',  label: 'Flèche HD',     category: 'Arrows' },
  { id: 'arrow-dr',    icon: '↘',  label: 'Flèche BD',     category: 'Arrows' },
  { id: 'arrow-ul',    icon: '↖',  label: 'Flèche HG',     category: 'Arrows' },
  { id: 'arrow-dl',    icon: '↙',  label: 'Flèche BG',     category: 'Arrows' },
  { id: 'double-arrow',icon: '⇒',  label: 'Double flèche', category: 'Arrows' },
  { id: 'curved-arrow',icon: '➩',  label: 'Flèche courbe', category: 'Arrows' },

  // Shapes
  { id: 'circle',      icon: '●',  label: 'Cercle',        category: 'Shapes' },
  { id: 'circle-o',    icon: '○',  label: 'Cercle vide',   category: 'Shapes' },
  { id: 'square',      icon: '■',  label: 'Carré',         category: 'Shapes' },
  { id: 'square-o',    icon: '□',  label: 'Carré vide',    category: 'Shapes' },
  { id: 'triangle',    icon: '▲',  label: 'Triangle',      category: 'Shapes' },
  { id: 'triangle-d',  icon: '▼',  label: 'Triangle bas',  category: 'Shapes' },
  { id: 'hexagon',     icon: '⬢',  label: 'Hexagone',      category: 'Shapes' },
  { id: 'pentagon',    icon: '⬟',  label: 'Pentagone',     category: 'Shapes' },
  { id: 'octagon',     icon: '⯃',  label: 'Octogone',      category: 'Shapes' },
  { id: 'slash',       icon: '／', label: 'Barre',         category: 'Shapes' },
  { id: 'pipe',        icon: '│',  label: 'Trait vertical',category: 'Shapes' },
  { id: 'dot',         icon: '·',  label: 'Point',         category: 'Shapes' },
]

export type SavedPalette = {
  id: string
  name: string
  bg1: string
  bg2: string
  text: string
  accent: string
  muted: string
  border: string
  dark: boolean
}

/* =========================================================================
   ARCHETYPE IDS — 30 visually distinct layout archetypes
   ========================================================================= */

export type ArchetypeId =
  | 'classic-left'
  | 'classic-center'
  | 'modern-split'
  | 'modern-minimal'
  | 'bold-block'
  | 'bold-banner'
  | 'elegant-serif'
  | 'corporate-clean'
  | 'creative-angled'
  | 'tech-dark'
  | 'circle-photo'
  | 'diagonal-split'
  | 'vertical-band'
  | 'bottom-band'
  | 'top-accent-bar'
  | 'full-photo-bg'
  | 'luxury-gold'
  | 'geometric-hexagon'
  | 'watercolor-organic'
  | 'asymmetric-offset'
  | 'two-column'
  | 'stacked-cards'
  | 'spotlight-center'
  | 'side-accent-strip'
  | 'minimal-dots'
  | 'gradient-mesh'
  | 'frame-border'
  | 'monogram-letter'
  | 'horizontal-stripe'
  | 'badge-seal'

export type CardData = {
  id: string
  archetype: ArchetypeId
  cardType: CardType
  fields: Record<FieldType, string>
  fieldStyles: Partial<Record<FieldType, Partial<FieldStyle>>>
  background: CardBackground
  border: CardBorder
  effects: CardEffects
  qr: QrConfig
  logo: LogoConfig
  profilePhoto: ProfilePhotoConfig
  socialLinks: SocialLinks
  decorativeLine: DecorativeLine
  icons: CardIcon[]
  cardSize: { width: number; height: number }
  paletteName: string
}

export type BrandKit = {
  id: string
  name: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  textColor: string
  fontFamily: FontFamily
  logoImage: string | null
}

/* =========================================================================
   FONT DEFINITIONS
   ========================================================================= */

export const FONT_FAMILIES: { id: FontFamily; label: string; stack: string; weights: number[] }[] = [
  { id: 'Inter', label: 'Inter (Sans)', stack: "'Inter', system-ui, sans-serif", weights: [300, 400, 500, 600, 700, 800] },
  { id: 'Montserrat', label: 'Montserrat (Sans)', stack: "'Montserrat', system-ui, sans-serif", weights: [300, 400, 500, 600, 700] },
  { id: 'Poppins', label: 'Poppins (Sans)', stack: "'Poppins', system-ui, sans-serif", weights: [300, 400, 500, 600, 700] },
  { id: 'Georgia', label: 'Georgia (Serif)', stack: "Georgia, 'Times New Roman', serif", weights: [400, 700] },
  { id: 'Playfair Display', label: 'Playfair (Serif)', stack: "'Playfair Display', Georgia, serif", weights: [400, 700, 900] },
  { id: 'Source Serif Pro', label: 'Source Serif', stack: "'Source Serif Pro', Georgia, serif", weights: [400, 600, 700] },
  { id: 'Lora', label: 'Lora (Serif)', stack: "'Lora', Georgia, serif", weights: [400, 500, 600, 700] },
  { id: 'Roboto Mono', label: 'Roboto Mono', stack: "'Roboto Mono', 'Courier New', monospace", weights: [400, 500, 700] },
]

export const FONT_WEIGHT_LABELS: { value: number; label: string }[] = [
  { value: 300, label: 'Léger' },
  { value: 400, label: 'Normal' },
  { value: 500, label: 'Moyen' },
  { value: 600, label: 'Semi-gras' },
  { value: 700, label: 'Gras' },
  { value: 800, label: 'Extra gras' },
  { value: 900, label: 'Ultra gras' },
]

/* =========================================================================
   PALETTES — 50 professional color palettes with harmony
   ========================================================================= */

export type Palette = {
  id: string
  name: string
  bg1: string
  bg2: string
  text: string
  accent: string
  muted: string
  border: string
  dark: boolean
}

export const PALETTES: Palette[] = [
  // Dark / Luxury
  { id: 'midnight',     name: 'Minuit',         bg1: '#0f172a', bg2: '#1e293b', text: '#f8fafc', accent: '#38bdf8', muted: '#94a3b8', border: '#334155', dark: true },
  { id: 'graphite',     name: 'Graphite',       bg1: '#1c1917', bg2: '#292524', text: '#fafaf9', accent: '#f59e0b', muted: '#a8a29e', border: '#44403c', dark: true },
  { id: 'obsidian',     name: 'Obsidienne',     bg1: '#0c0a09', bg2: '#1c1917', text: '#fafaf9', accent: '#fbbf24', muted: '#78716c', border: '#292524', dark: true },
  { id: 'noir-gold',    name: 'Noir & Or',      bg1: '#000000', bg2: '#1a1a1a', text: '#ffffff', accent: '#d4af37', muted: '#a3a3a3', border: '#333333', dark: true },
  { id: 'noir-silver',  name: 'Noir & Argent',  bg1: '#0a0a0a', bg2: '#181818', text: '#e5e5e5', accent: '#c0c0c0', muted: '#737373', border: '#262626', dark: true },
  { id: 'charcoal',     name: 'Charbon',        bg1: '#171717', bg2: '#262626', text: '#fafafa', accent: '#22d3ee', muted: '#737373', border: '#404040', dark: true },
  { id: 'deep-sea',     name: 'Mer Profonde',   bg1: '#042f2e', bg2: '#064e3b', text: '#ecfdf5', accent: '#2dd4bf', muted: '#5eead4', border: '#0f766e', dark: true },
  { id: 'royal-purple', name: 'Pourpre Royal',  bg1: '#1e1b4b', bg2: '#312e81', text: '#e0e7ff', accent: '#a78bfa', muted: '#818cf8', border: '#3730a3', dark: true },
  { id: 'wine',         name: 'Vin Rouge',      bg1: '#4c0519', bg2: '#7f1d1d', text: '#fef2f2', accent: '#fca5a5', muted: '#fda4af', border: '#991b1b', dark: true },
  { id: 'espresso',     name: 'Espresso',       bg1: '#1c1410', bg2: '#292017', text: '#fef3c7', accent: '#d97706', muted: '#a8a29e', border: '#44403c', dark: true },

  // Blues
  { id: 'ocean',        name: 'Océan',          bg1: '#0c4a6e', bg2: '#075985', text: '#f0f9ff', accent: '#0ea5e9', muted: '#7dd3fc', border: '#0369a1', dark: true },
  { id: 'navy',         name: 'Marine',         bg1: '#1e3a5f', bg2: '#2d4a6e', text: '#ffffff', accent: '#60a5fa', muted: '#93c5fd', border: '#1e40af', dark: true },
  { id: 'steel-blue',   name: 'Acier Bleu',     bg1: '#334155', bg2: '#475569', text: '#f1f5f9', accent: '#38bdf8', muted: '#94a3b8', border: '#64748b', dark: true },
  { id: 'sky',          name: 'Ciel',           bg1: '#e0f2fe', bg2: '#bae6fd', text: '#0c4a6e', accent: '#0284c7', muted: '#0369a1', border: '#7dd3fc', dark: false },
  { id: 'ice',          name: 'Glace',          bg1: '#f0f9ff', bg2: '#e0f2fe', text: '#0c4a6e', accent: '#0ea5e9', muted: '#38bdf8', border: '#bae6fd', dark: false },
  { id: 'teal',         name: 'Sarcelle',       bg1: '#134e4a', bg2: '#115e59', text: '#ccfbf1', accent: '#2dd4bf', muted: '#5eead4', border: '#0d9488', dark: true },
  { id: 'aqua',         name: 'Aqua',           bg1: '#ecfeff', bg2: '#cffafe', text: '#164e63', accent: '#06b6d4', muted: '#0891b2', border: '#67e8f9', dark: false },
  { id: 'corporate-blue', name: 'Bleu Corporate', bg1: '#1e40af', bg2: '#1d4ed8', text: '#ffffff', accent: '#fbbf24', muted: '#bfdbfe', border: '#2563eb', dark: true },

  // Greens
  { id: 'forest',       name: 'Forêt',          bg1: '#064e3b', bg2: '#065f46', text: '#ecfdf5', accent: '#34d399', muted: '#6ee7b7', border: '#047857', dark: true },
  { id: 'emerald',      name: 'Émeraude',       bg1: '#064e3b', bg2: '#059669', text: '#d1fae5', accent: '#10b981', muted: '#34d399', border: '#065f46', dark: true },
  { id: 'mint',         name: 'Menthe',         bg1: '#ecfdf5', bg2: '#d1fae5', text: '#064e3b', accent: '#059669', muted: '#10b981', border: '#6ee7b7', dark: false },
  { id: 'olive',        name: 'Olive',          bg1: '#3f6212', bg2: '#4d7c0f', text: '#f7fee7', accent: '#a3e635', muted: '#bef264', border: '#365314', dark: true },
  { id: 'sage',         name: 'Sauge',          bg1: '#f0fdf4', bg2: '#dcfce7', text: '#14532d', accent: '#16a34a', muted: '#22c55e', border: '#86efac', dark: false },
  { id: 'jungle',       name: 'Jungle',         bg1: '#052e16', bg2: '#14532d', text: '#dcfce7', accent: '#4ade80', muted: '#86efac', border: '#166534', dark: true },

  // Earth tones
  { id: 'sand',         name: 'Sable',          bg1: '#fef3c7', bg2: '#fde68a', text: '#78350f', accent: '#d97706', muted: '#a16207', border: '#f59e0b', dark: false },
  { id: 'kraft',        name: 'Kraft',          bg1: '#d6c7a4', bg2: '#c9b895', text: '#44403c', accent: '#92400e', muted: '#78716c', border: '#a8a29e', dark: false },
  { id: 'terracotta',   name: 'Terracotta',     bg1: '#7c2d12', bg2: '#9a3412', text: '#fff7ed', accent: '#fb923c', muted: '#fdba74', border: '#c2410c', dark: true },
  { id: 'brick',        name: 'Brique',         bg1: '#7f1d1d', bg2: '#991b1b', text: '#fef2f2', accent: '#f87171', muted: '#fca5a5', border: '#b91c1c', dark: true },
  { id: 'cognac',       name: 'Cognac',         bg1: '#422006', bg2: '#713f12', text: '#fefce8', accent: '#ca8a04', muted: '#a16207', border: '#854d0e', dark: true },
  { id: 'cream',        name: 'Crème',          bg1: '#fffbeb', bg2: '#fef3c7', text: '#78350f', accent: '#b45309', muted: '#92400e', border: '#fcd34d', dark: false },
  { id: 'clay',         name: 'Argile',         bg1: '#f5f0eb', bg2: '#e8e0d5', text: '#44403c', accent: '#a78b6f', muted: '#8b7d6b', border: '#d6cbb8', dark: false },

  // Reds / Pinks
  { id: 'rose',         name: 'Rose',           bg1: '#fff1f2', bg2: '#ffe4e6', text: '#881337', accent: '#e11d48', muted: '#be123c', border: '#fda4af', dark: false },
  { id: 'crimson',      name: 'Cramoisi',       bg1: '#7f1d1d', bg2: '#dc2626', text: '#fef2f2', accent: '#fde047', muted: '#fecaca', border: '#991b1b', dark: true },
  { id: 'blush',        name: 'Blush',          bg1: '#fdf2f8', bg2: '#fce7f3', text: '#831843', accent: '#ec4899', muted: '#db2777', border: '#f9a8d4', dark: false },
  { id: 'coral',        name: 'Corail',         bg1: '#fff7ed', bg2: '#ffedd5', text: '#7c2d12', accent: '#ea580c', muted: '#c2410c', border: '#fb923c', dark: false },
  { id: 'salmon',       name: 'Saumon',         bg1: '#fff5f5', bg2: '#fed7d7', text: '#742a2a', accent: '#e53e3e', muted: '#c53030', border: '#fc8181', dark: false },

  // Purples / Violets
  { id: 'lavender',     name: 'Lavande',        bg1: '#f5f3ff', bg2: '#ede9fe', text: '#3b0764', accent: '#7c3aed', muted: '#6d28d9', border: '#c4b5fd', dark: false },
  { id: 'plum',         name: 'Prune',          bg1: '#3b0764', bg2: '#5b21b6', text: '#f5f3ff', accent: '#c4b5fd', muted: '#a78bfa', border: '#6d28d9', dark: true },
  { id: 'grape',        name: 'Raisin',         bg1: '#2e1065', bg2: '#4c1d95', text: '#ede9fe', accent: '#a78bfa', muted: '#8b5cf6', border: '#5b21b6', dark: true },
  { id: 'mauve',        name: 'Mauve',          bg1: '#faf5ff', bg2: '#f3e8ff', text: '#581c87', accent: '#a855f7', muted: '#9333ea', border: '#d8b4fe', dark: false },

  // Neutrals / Light
  { id: 'snow',         name: 'Neige',          bg1: '#ffffff', bg2: '#f1f5f9', text: '#0f172a', accent: '#0ea5e9', muted: '#64748b', border: '#e2e8f0', dark: false },
  { id: 'steel',        name: 'Acier',          bg1: '#f8fafc', bg2: '#e2e8f0', text: '#1e293b', accent: '#475569', muted: '#64748b', border: '#cbd5e1', dark: false },
  { id: 'pearl',        name: 'Perle',          bg1: '#fdfdfd', bg2: '#f8f8f8', text: '#1a1a1a', accent: '#c0a062', muted: '#737373', border: '#e5e5e5', dark: false },
  { id: 'ivory',        name: 'Ivoire',         bg1: '#fffff0', bg2: '#fefef0', text: '#262626', accent: '#ca8a04', muted: '#a8a29e', border: '#fde68a', dark: false },
  { id: 'warm-gray',    name: 'Gris Chaud',     bg1: '#fafaf9', bg2: '#f5f5f4', text: '#1c1917', accent: '#d97706', muted: '#78716c', border: '#d6d3d1', dark: false },
  { id: 'cool-gray',    name: 'Gris Froid',     bg1: '#f8fafc', bg2: '#f1f5f9', text: '#1e293b', accent: '#0284c7', muted: '#64748b', border: '#e2e8f0', dark: false },
  { id: 'stone',        name: 'Pierre',         bg1: '#fafaf9', bg2: '#e7e5e4', text: '#1c1917', accent: '#78716c', muted: '#57534e', border: '#d6d3d1', dark: false },

  // Vibrant / Creative
  { id: 'sunset',       name: 'Coucher Soleil', bg1: '#f97316', bg2: '#dc2626', text: '#fffbeb', accent: '#fde047', muted: '#fed7aa', border: '#ea580c', dark: true },
  { id: 'tropical',     name: 'Tropical',       bg1: '#06b6d4', bg2: '#0891b2', text: '#ecfeff', accent: '#fde047', muted: '#a5f3fc', border: '#0e7490', dark: true },
  { id: 'electric',     name: 'Électrique',     bg1: '#171717', bg2: '#1e1b4b', text: '#fafafa', accent: '#22d3ee', muted: '#67e8f9', border: '#334155', dark: true },
  { id: 'neon',         name: 'Néon',           bg1: '#0a0a0a', bg2: '#18181b', text: '#fafafa', accent: '#a3e635', muted: '#84cc16', border: '#27272a', dark: true },
  { id: 'candy',        name: 'Bonbon',         bg1: '#fdf4ff', bg2: '#fae8ff', text: '#581c87', accent: '#d946ef', muted: '#c026d3', border: '#e879f9', dark: false },
]

/* =========================================================================
   ARCHETYPES — 30 visually distinct layout styles
   ========================================================================= */

export type Archetype = {
  id: ArchetypeId
  name: string
  description: string
  category: 'Classique' | 'Moderne' | 'Audacieux' | 'Élégant' | 'Corporate' | 'Créatif' | 'Tech' | 'Luxe' | 'Photo' | 'Géométrique' | 'Minimal'
  defaultAlign: TextAlign
  defaultLogoPosition: LogoConfig['position']
  defaultQrPosition: QrConfig['position']
  defaultLinePosition: DecorativeLine['position']
  cardTypes: CardType[]
}

export const ARCHETYPES: Archetype[] = [
  { id: 'classic-left',       name: 'Classique Gauche',     description: 'Alignement gauche, ligne en haut',         category: 'Classique', defaultAlign: 'left',   defaultLogoPosition: 'top-right',  defaultQrPosition: 'bottom-right', defaultLinePosition: 'top',        cardTypes: ['personnel', 'professionnel', 'freelance', 'entreprise'] },
  { id: 'classic-center',     name: 'Classique Centré',     description: 'Tout centré, élégant et équilibré',         category: 'Classique', defaultAlign: 'center', defaultLogoPosition: 'top-left' as LogoConfig['position'], defaultQrPosition: 'bottom-right', defaultLinePosition: 'under-name', cardTypes: ['personnel', 'professionnel', 'freelance', 'entreprise'] },
  { id: 'modern-split',       name: 'Moderne Scindé',       description: 'Panneau latéral, contenu à droite',         category: 'Moderne',   defaultAlign: 'left',   defaultLogoPosition: 'center',     defaultQrPosition: 'bottom-left',  defaultLinePosition: 'none' as DecorativeLine['position'], cardTypes: ['professionnel', 'freelance', 'entreprise'] },
  { id: 'modern-minimal',     name: 'Moderne Minimal',      description: 'Épuré, espace, micro-typographie',          category: 'Moderne',   defaultAlign: 'left',   defaultLogoPosition: 'bottom-right', defaultQrPosition: 'bottom-left', defaultLinePosition: 'under-title', cardTypes: ['personnel', 'professionnel', 'freelance'] },
  { id: 'bold-block',         name: 'Audacieux Bloc',       description: 'Nom géant, fond sombre, accent vif',        category: 'Audacieux', defaultAlign: 'left',   defaultLogoPosition: 'top-right',  defaultQrPosition: 'bottom-left',  defaultLinePosition: 'bottom',     cardTypes: ['professionnel', 'freelance', 'entreprise'] },
  { id: 'bold-banner',        name: 'Audacieux Bandeau',    description: 'Bandeau coloré en haut, contenu dessous',   category: 'Audacieux', defaultAlign: 'center', defaultLogoPosition: 'top-left' as LogoConfig['position'], defaultQrPosition: 'bottom-right', defaultLinePosition: 'none' as DecorativeLine['position'], cardTypes: ['entreprise', 'professionnel'] },
  { id: 'elegant-serif',      name: 'Élégant Serif',        description: 'Serif raffiné, ligne fine, palette douce',  category: 'Élégant',   defaultAlign: 'center', defaultLogoPosition: 'top-left' as LogoConfig['position'], defaultQrPosition: 'bottom-right', defaultLinePosition: 'under-name', cardTypes: ['personnel', 'professionnel', 'freelance'] },
  { id: 'corporate-clean',    name: 'Corporate Net',        description: 'Pro, structuré, hiérarchie claire',         category: 'Corporate', defaultAlign: 'left',   defaultLogoPosition: 'top-right',  defaultQrPosition: 'bottom-right', defaultLinePosition: 'under-title', cardTypes: ['professionnel', 'entreprise'] },
  { id: 'creative-angled',    name: 'Créatif Angulaire',    description: 'Forme géométrique, angle dynamique',        category: 'Créatif',   defaultAlign: 'left',   defaultLogoPosition: 'top-right',  defaultQrPosition: 'bottom-left',  defaultLinePosition: 'top',        cardTypes: ['freelance', 'personnel', 'professionnel'] },
  { id: 'tech-dark',          name: 'Tech Sombre',          description: 'Fond noir, accents néon, police mono',      category: 'Tech',      defaultAlign: 'left',   defaultLogoPosition: 'top-right',  defaultQrPosition: 'bottom-right', defaultLinePosition: 'bottom',     cardTypes: ['professionnel', 'freelance', 'entreprise'] },
  { id: 'circle-photo',       name: 'Cercle Photo',         description: 'Grand cercle avec logo/photo, texte autour', category: 'Photo',     defaultAlign: 'left',   defaultLogoPosition: 'center',     defaultQrPosition: 'bottom-right', defaultLinePosition: 'none' as DecorativeLine['position'], cardTypes: ['personnel', 'professionnel', 'freelance', 'entreprise'] },
  { id: 'diagonal-split',     name: 'Diagonale',            description: 'Séparation diagonale, deux zones',          category: 'Géométrique', defaultAlign: 'left', defaultLogoPosition: 'top-right',  defaultQrPosition: 'bottom-left',  defaultLinePosition: 'none' as DecorativeLine['position'], cardTypes: ['freelance', 'professionnel', 'entreprise'] },
  { id: 'vertical-band',      name: 'Bande Verticale',      description: 'Bande colorée verticale à gauche',          category: 'Moderne',   defaultAlign: 'left',   defaultLogoPosition: 'top-right',  defaultQrPosition: 'bottom-right', defaultLinePosition: 'none' as DecorativeLine['position'], cardTypes: ['entreprise', 'professionnel'] },
  { id: 'bottom-band',        name: 'Bandeau Bas',          description: 'Bandeau coloré en bas, contenu au-dessus',  category: 'Moderne',   defaultAlign: 'center', defaultLogoPosition: 'top-left' as LogoConfig['position'], defaultQrPosition: 'bottom-left',  defaultLinePosition: 'none' as DecorativeLine['position'], cardTypes: ['entreprise', 'professionnel', 'freelance'] },
  { id: 'top-accent-bar',     name: 'Barre Accent Haut',    description: 'Fine barre colorée en haut, minimal',       category: 'Minimal',   defaultAlign: 'left',   defaultLogoPosition: 'top-right',  defaultQrPosition: 'bottom-right', defaultLinePosition: 'top',        cardTypes: ['personnel', 'professionnel', 'freelance', 'entreprise'] },
  { id: 'full-photo-bg',      name: 'Photo Plein Fond',     description: 'Image en fond, texte par-dessus',           category: 'Photo',     defaultAlign: 'left',   defaultLogoPosition: 'top-right',  defaultQrPosition: 'bottom-left',  defaultLinePosition: 'none' as DecorativeLine['position'], cardTypes: ['personnel', 'freelance', 'professionnel'] },
  { id: 'luxury-gold',        name: 'Luxe Or',              description: 'Noir mat, filets dorés, serif élégant',     category: 'Luxe',      defaultAlign: 'center', defaultLogoPosition: 'top-left' as LogoConfig['position'], defaultQrPosition: 'bottom-right', defaultLinePosition: 'under-name', cardTypes: ['entreprise', 'professionnel'] },
  { id: 'geometric-hexagon',  name: 'Hexagone Géométrique', description: 'Motif hexagonal, style moderne tech',       category: 'Géométrique', defaultAlign: 'left', defaultLogoPosition: 'top-right',  defaultQrPosition: 'bottom-right', defaultLinePosition: 'none' as DecorativeLine['position'], cardTypes: ['professionnel', 'freelance', 'entreprise'] },
  { id: 'watercolor-organic', name: 'Aquarelle',            description: 'Formes organiques, dégradés doux',          category: 'Créatif',   defaultAlign: 'center', defaultLogoPosition: 'top-left' as LogoConfig['position'], defaultQrPosition: 'bottom-right', defaultLinePosition: 'none' as DecorativeLine['position'], cardTypes: ['personnel', 'freelance'] },
  { id: 'asymmetric-offset',  name: 'Asymétrique',          description: 'Contenu décalé, composition dynamique',     category: 'Créatif',   defaultAlign: 'left',   defaultLogoPosition: 'bottom-right', defaultQrPosition: 'bottom-left', defaultLinePosition: 'under-title', cardTypes: ['freelance', 'personnel', 'professionnel'] },
  { id: 'two-column',         name: 'Deux Colonnes',        description: 'Info gauche, contact droite',               category: 'Corporate', defaultAlign: 'left',   defaultLogoPosition: 'top-right',  defaultQrPosition: 'bottom-right', defaultLinePosition: 'none' as DecorativeLine['position'], cardTypes: ['entreprise', 'professionnel'] },
  { id: 'stacked-cards',      name: 'Empilé',               description: 'Zones empilées avec séparateurs',           category: 'Moderne',   defaultAlign: 'left',   defaultLogoPosition: 'top-right',  defaultQrPosition: 'bottom-left',  defaultLinePosition: 'under-title', cardTypes: ['professionnel', 'entreprise'] },
  { id: 'spotlight-center',   name: 'Projecteur Centre',    description: 'Cerc lumineux central,聚焦 contenu',        category: 'Moderne',   defaultAlign: 'center', defaultLogoPosition: 'top-left' as LogoConfig['position'], defaultQrPosition: 'bottom-right', defaultLinePosition: 'none' as DecorativeLine['position'], cardTypes: ['personnel', 'professionnel', 'freelance'] },
  { id: 'side-accent-strip',  name: 'Bandes Latérales',     description: 'Bandes colorées sur les côtés',             category: 'Audacieux', defaultAlign: 'center', defaultLogoPosition: 'top-left' as LogoConfig['position'], defaultQrPosition: 'bottom-right', defaultLinePosition: 'none' as DecorativeLine['position'], cardTypes: ['entreprise', 'professionnel'] },
  { id: 'minimal-dots',       name: 'Points Minimal',       description: 'Motif de points subtil, épuré',             category: 'Minimal',   defaultAlign: 'left',   defaultLogoPosition: 'top-right',  defaultQrPosition: 'bottom-left',  defaultLinePosition: 'none' as DecorativeLine['position'], cardTypes: ['personnel', 'professionnel', 'freelance'] },
  { id: 'gradient-mesh',      name: 'Dégradé Maille',       description: 'Fond dégradé multi-couleurs, moderne',      category: 'Créatif',   defaultAlign: 'center', defaultLogoPosition: 'top-left' as LogoConfig['position'], defaultQrPosition: 'bottom-right', defaultLinePosition: 'none' as DecorativeLine['position'], cardTypes: ['freelance', 'personnel', 'professionnel'] },
  { id: 'frame-border',       name: 'Cadre Bordure',        description: 'Bordure décorative encadrant le contenu',   category: 'Élégant',   defaultAlign: 'center', defaultLogoPosition: 'top-left' as LogoConfig['position'], defaultQrPosition: 'bottom-right', defaultLinePosition: 'none' as DecorativeLine['position'], cardTypes: ['personnel', 'professionnel', 'entreprise'] },
  { id: 'monogram-letter',    name: 'Monogramme',           description: 'Grande initiale en filigrane, élégant',     category: 'Luxe',      defaultAlign: 'left',   defaultLogoPosition: 'bottom-right', defaultQrPosition: 'bottom-left', defaultLinePosition: 'under-name', cardTypes: ['personnel', 'professionnel', 'freelance', 'entreprise'] },
  { id: 'horizontal-stripe',  name: 'Rayure Horizontale',   description: 'Bande colorée horizontale au milieu',       category: 'Audacieux', defaultAlign: 'center', defaultLogoPosition: 'top-left' as LogoConfig['position'], defaultQrPosition: 'bottom-right', defaultLinePosition: 'none' as DecorativeLine['position'], cardTypes: ['entreprise', 'professionnel'] },
  { id: 'badge-seal',         name: 'Sceau Badge',          description: 'Style sceau/certification, circulaire',     category: 'Élégant',   defaultAlign: 'center', defaultLogoPosition: 'top-left' as LogoConfig['position'], defaultQrPosition: 'bottom-right', defaultLinePosition: 'none' as DecorativeLine['position'], cardTypes: ['professionnel', 'entreprise'] },
]

/* =========================================================================
   FIELD DEFINITIONS
   ========================================================================= */

export type FieldDef = {
  id: FieldType
  label: string
  placeholder: string
  group: 'Identité' | 'Contact' | 'Entreprise' | 'Personnalisation'
  defaultFontSize: number
  defaultFontWeight: number
  defaultFont: FontFamily
}

export const FIELD_DEFS: FieldDef[] = [
  { id: 'firstName',   label: 'Prénom',       placeholder: 'Camille',          group: 'Identité',        defaultFontSize: 32, defaultFontWeight: 700, defaultFont: 'Inter' },
  { id: 'lastName',    label: 'Nom',          placeholder: 'Durand',           group: 'Identité',        defaultFontSize: 32, defaultFontWeight: 700, defaultFont: 'Inter' },
  { id: 'jobTitle',    label: 'Poste',        placeholder: 'Directrice Marketing', group: 'Identité',   defaultFontSize: 15, defaultFontWeight: 400, defaultFont: 'Inter' },
  { id: 'company',     label: 'Entreprise',   placeholder: 'Durand & Co.',     group: 'Entreprise',      defaultFontSize: 16, defaultFontWeight: 600, defaultFont: 'Inter' },
  { id: 'department',  label: 'Département',  placeholder: 'Marketing',        group: 'Entreprise',      defaultFontSize: 12, defaultFontWeight: 400, defaultFont: 'Inter' },
  { id: 'phone',       label: 'Téléphone',    placeholder: '+33 6 12 34 56 78', group: 'Contact',        defaultFontSize: 13, defaultFontWeight: 400, defaultFont: 'Inter' },
  { id: 'email',       label: 'Email',        placeholder: 'camille@exemple.fr', group: 'Contact',       defaultFontSize: 13, defaultFontWeight: 400, defaultFont: 'Inter' },
  { id: 'website',     label: 'Site web',     placeholder: 'www.durand.fr',    group: 'Contact',         defaultFontSize: 13, defaultFontWeight: 400, defaultFont: 'Inter' },
  { id: 'address',     label: 'Adresse',      placeholder: '12 rue de la Paix, 75002 Paris', group: 'Contact', defaultFontSize: 11, defaultFontWeight: 400, defaultFont: 'Inter' },
  { id: 'tagline',     label: 'Slogan',       placeholder: 'L\'excellence au service de votre image', group: 'Personnalisation', defaultFontSize: 12, defaultFontWeight: 400, defaultFont: 'Lora' },
  { id: 'slogan',      label: 'Accroche',     placeholder: 'Votre partenaire créatif', group: 'Personnalisation', defaultFontSize: 11, defaultFontWeight: 500, defaultFont: 'Inter' },
]

/* =========================================================================
   CARD SIZE (standard 85×55mm → 560×362px at 6.58px/mm)
   ========================================================================= */

export const MM_TO_PX = 6.588
export const CARD_W = 560
export const CARD_H = Math.round((560 * 55) / 85)

export const CARD_SIZES = [
  { id: 'standard', label: 'Standard (85×55mm)', width: 85, height: 55 },
  { id: 'us',       label: 'US (3.5×2 in)',      width: 89, height: 51 },
  { id: 'square',   label: 'Carré (55×55mm)',    width: 55, height: 55 },
  { id: 'european', label: 'Européen (85×55mm)', width: 85, height: 55 },
]

/* =========================================================================
   TEMPLATE GENERATION (30 archetypes × 50 palettes = 1500 templates)
   Each archetype is tagged with compatible card types.
   ========================================================================= */

export type TemplateEntry = {
  id: string
  archetype: ArchetypeId
  paletteId: string
  name: string
  category: string
  cardType: CardType
  card: Omit<CardData, 'id'>
}

function buildCardFromArchetypePalette(archetype: Archetype, palette: Palette, cardType: CardType): Omit<CardData, 'id'> {
  const isDark = palette.dark
  const isLuxury = archetype.id === 'luxury-gold' || archetype.id === 'monogram-letter' || archetype.id === 'badge-seal'
  const isTech = archetype.id === 'tech-dark' || archetype.id === 'geometric-hexagon'
  const isElegant = archetype.id === 'elegant-serif' || archetype.id === 'frame-border' || archetype.id === 'luxury-gold'
  const isCirclePhoto = archetype.id === 'circle-photo'

  const serifFont: FontFamily = isElegant ? 'Playfair Display' : 'Lora'
  const monoFont: FontFamily = 'Roboto Mono'
  const sansFont: FontFamily = isTech ? 'Montserrat' : 'Inter'
  const nameFont: FontFamily = isElegant ? serifFont : isTech ? monoFont : sansFont
  const nameSize = archetype.id === 'bold-block' ? 38 : archetype.id === 'bold-banner' ? 34 : archetype.id === 'monogram-letter' ? 28 : archetype.id === 'circle-photo' ? 26 : 30

  return {
    archetype: archetype.id,
    cardType,
    fields: {
      firstName: 'Camille',
      lastName: 'Durand',
      jobTitle: 'Directrice Marketing',
      company: 'Durand & Co.',
      department: '',
      phone: '+33 6 12 34 56 78',
      email: 'camille.durand@exemple.fr',
      website: 'www.durand.fr',
      address: '12 rue de la Paix, 75002 Paris',
      tagline: '',
      slogan: '',
    },
    fieldStyles: {
      firstName:  { fontFamily: nameFont, fontSize: nameSize, fontWeight: 700, color: palette.text, align: archetype.defaultAlign, visible: true, italic: false, underline: false, uppercase: archetype.id === 'bold-block' || archetype.id === 'bold-banner' || archetype.id === 'horizontal-stripe', letterSpacing: archetype.id === 'classic-center' || archetype.id === 'elegant-serif' || isLuxury ? 1 : 0, opacity: 1, offsetX: 0, offsetY: 0 },
      lastName:   { fontFamily: nameFont, fontSize: nameSize, fontWeight: 700, color: palette.text, align: archetype.defaultAlign, visible: true, italic: false, underline: false, uppercase: archetype.id === 'bold-block' || archetype.id === 'bold-banner' || archetype.id === 'horizontal-stripe', letterSpacing: archetype.id === 'classic-center' || archetype.id === 'elegant-serif' || isLuxury ? 1 : 0, opacity: 1, offsetX: 0, offsetY: 0 },
      jobTitle:   { fontFamily: isElegant ? serifFont : sansFont, fontSize: 14, fontWeight: 400, color: palette.muted, align: archetype.defaultAlign, visible: true, italic: isElegant, underline: false, uppercase: archetype.id === 'bold-banner' || archetype.id === 'tech-dark' || archetype.id === 'badge-seal', letterSpacing: archetype.id === 'corporate-clean' || archetype.id === 'monogram-letter' ? 0.5 : 0, opacity: 1, offsetX: 0, offsetY: 0 },
      company:    { fontFamily: isElegant ? serifFont : sansFont, fontSize: 16, fontWeight: 600, color: palette.accent, align: archetype.defaultAlign, visible: true, italic: false, underline: false, uppercase: isLuxury, letterSpacing: isLuxury ? 1.5 : 0, opacity: 1, offsetX: 0, offsetY: 0 },
      department: { fontFamily: sansFont, fontSize: 11, fontWeight: 400, color: palette.muted, align: archetype.defaultAlign, visible: false, italic: false, underline: false, uppercase: true, letterSpacing: 1, opacity: 1, offsetX: 0, offsetY: 0 },
      phone:      { fontFamily: isTech ? monoFont : sansFont, fontSize: 13, fontWeight: 400, color: palette.text, align: archetype.defaultAlign, visible: true, italic: false, underline: false, uppercase: false, letterSpacing: 0, opacity: 0.9, offsetX: 0, offsetY: 0 },
      email:      { fontFamily: isTech ? monoFont : sansFont, fontSize: 13, fontWeight: 400, color: palette.text, align: archetype.defaultAlign, visible: true, italic: false, underline: false, uppercase: false, letterSpacing: 0, opacity: 0.9, offsetX: 0, offsetY: 0 },
      website:    { fontFamily: isTech ? monoFont : sansFont, fontSize: 12, fontWeight: 400, color: palette.accent, align: archetype.defaultAlign, visible: true, italic: false, underline: true, uppercase: false, letterSpacing: 0, opacity: 1, offsetX: 0, offsetY: 0 },
      address:    { fontFamily: sansFont, fontSize: 10, fontWeight: 400, color: palette.muted, align: archetype.defaultAlign, visible: false, italic: false, underline: false, uppercase: false, letterSpacing: 0, opacity: 0.8, offsetX: 0, offsetY: 0 },
      tagline:    { fontFamily: serifFont, fontSize: 12, fontWeight: 400, color: palette.muted, align: archetype.defaultAlign, visible: false, italic: true, underline: false, uppercase: false, letterSpacing: 0, opacity: 1, offsetX: 0, offsetY: 0 },
      slogan:     { fontFamily: sansFont, fontSize: 11, fontWeight: 500, color: palette.accent, align: archetype.defaultAlign, visible: false, italic: false, underline: false, uppercase: true, letterSpacing: 1.5, opacity: 1, offsetX: 0, offsetY: 0 },
    },
    background: {
      type: archetype.id === 'bold-block' || archetype.id === 'tech-dark' || archetype.id === 'gradient-mesh' || archetype.id === 'watercolor-organic' || archetype.id === 'spotlight-center' ? 'gradient' : archetype.id === 'minimal-dots' || archetype.id === 'geometric-hexagon' ? 'pattern' : 'solid',
      color1: palette.bg1,
      color2: palette.bg2,
      gradientDirection: archetype.id === 'creative-angled' || archetype.id === 'diagonal-split' ? 'to-bl' : archetype.id === 'spotlight-center' ? 'radial' : 'to-br',
      gradientIntensity: 100,
      pattern: archetype.id === 'geometric-hexagon' ? 'diagonal' : 'dots',
      patternColor: isDark ? palette.border : palette.muted,
      patternOpacity: 0.12,
      image: null,
      imageOpacity: 0.3,
    },
    border: {
      style: archetype.id === 'modern-minimal' || archetype.id === 'tech-dark' || archetype.id === 'minimal-dots' || archetype.id === 'full-photo-bg' ? 'none' : archetype.id === 'frame-border' || archetype.id === 'luxury-gold' ? 'double' : 'solid',
      color: palette.border,
      width: archetype.id === 'frame-border' || archetype.id === 'luxury-gold' ? 3 : 2,
      radius: archetype.id === 'bold-block' || archetype.id === 'bold-banner' || archetype.id === 'horizontal-stripe' ? 0 : archetype.id === 'classic-left' || archetype.id === 'classic-center' ? 8 : archetype.id === 'modern-split' || archetype.id === 'modern-minimal' || archetype.id === 'circle-photo' ? 20 : archetype.id === 'badge-seal' ? 40 : 14,
    },
    effects: {
      shadow: true,
      shadowColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.12)',
      shadowBlur: 20,
      shadowOffsetY: 6,
      innerPadding: archetype.id === 'modern-split' || archetype.id === 'vertical-band' || archetype.id === 'diagonal-split' || archetype.id === 'bottom-band' || archetype.id === 'bold-banner' || archetype.id === 'horizontal-stripe' ? 0 : 28,
      cardOpacity: 1,
    },
    qr: {
      enabled: true,
      source: 'vcard',
      customValue: '',
      size: 80,
      position: archetype.defaultQrPosition,
      bgColor: isDark ? palette.bg2 : '#ffffff',
      fgColor: isDark ? palette.text : '#000000',
      margin: 1,
      rounded: false,
    },
    logo: {
      enabled: false,
      image: null,
      size: isCirclePhoto ? 100 : 60,
      position: archetype.defaultLogoPosition,
      x: 50,
      y: 50,
      opacity: 1,
      rounded: isCirclePhoto,
    },
    decorativeLine: {
      enabled: archetype.defaultLinePosition !== ('none' as DecorativeLine['position']),
      color: palette.accent,
      width: isLuxury ? 2 : 3,
      style: 'solid',
      position: archetype.defaultLinePosition,
    },
    profilePhoto: {
      enabled: false,
      image: null,
      size: 80,
      x: 50,
      y: 50,
      shape: 'circle',
      opacity: 1,
    },
    socialLinks: {
      linkedin: '',
      instagram: '',
      facebook: '',
      twitter: '',
      whatsapp: '',
      telegram: '',
      youtube: '',
      tiktok: '',
    },
    icons: [],
    cardSize: { width: 85, height: 55 },
    paletteName: palette.name,
  }
}

export const TEMPLATES: TemplateEntry[] = (() => {
  const list: TemplateEntry[] = []
  for (const arch of ARCHETYPES) {
    for (const pal of PALETTES) {
      for (const ct of arch.cardTypes) {
        list.push({
          id: `${arch.id}__${pal.id}__${ct}`,
          archetype: arch.id,
          paletteId: pal.id,
          name: `${arch.name} — ${pal.name}`,
          category: arch.category,
          cardType: ct,
          card: buildCardFromArchetypePalette(arch, pal, ct),
        })
      }
    }
  }
  return list
})()

export function getTemplate(id: string): TemplateEntry | undefined {
  return TEMPLATES.find((t) => t.id === id)
}

export function cardFromTemplate(templateId: string): CardData {
  const tpl = getTemplate(templateId)
  if (!tpl) {
    const first = TEMPLATES[0]
    return { ...first.card, id: crypto.randomUUID() }
  }
  return { ...tpl.card, id: crypto.randomUUID() }
}

export function templatesByCardType(cardType: CardType): TemplateEntry[] {
  return TEMPLATES.filter((t) => t.cardType === cardType)
}

/* =========================================================================
   DEFAULT CARD + CONVERSION HELPERS
   ========================================================================= */

export function defaultCard(): CardData {
  return cardFromTemplate('modern-split__snow__professionnel')
}

export function cardFromArchetypePalette(archetypeId: ArchetypeId, paletteId: string, cardType?: CardType): CardData {
  const ct = cardType || 'professionnel'
  const tpl = TEMPLATES.find((t) => t.archetype === archetypeId && t.paletteId === paletteId && t.cardType === ct)
  if (!tpl) {
    const fallback = TEMPLATES.find((t) => t.archetype === archetypeId && t.paletteId === paletteId)
    if (fallback) return { ...fallback.card, id: crypto.randomUUID() }
    return defaultCard()
  }
  return { ...tpl.card, id: crypto.randomUUID() }
}

/* =========================================================================
   MIGRATION HELPERS
   ========================================================================= */

export function migrateOldCard(old: Record<string, unknown>): CardData {
  if (old.archetype && old.fields) {
    const c = old as unknown as CardData
    if (!c.cardType) c.cardType = 'professionnel'
    if (!c.icons) c.icons = []
    if (!c.background.gradientIntensity) c.background.gradientIntensity = 100
    if (!c.profilePhoto) c.profilePhoto = { enabled: false, image: null, size: 80, x: 50, y: 50, shape: 'circle', opacity: 1 }
    if (!c.socialLinks) c.socialLinks = { linkedin: '', instagram: '', facebook: '', twitter: '', whatsapp: '', telegram: '', youtube: '', tiktok: '' }
    if (c.qr && c.qr.source === 'phone') c.qr.source = 'vcard'
    if (c.logo && c.logo.x === undefined) c.logo.x = 50
    if (c.logo && c.logo.y === undefined) c.logo.y = 50
    if (c.icons) c.icons = c.icons.map((ic: any) => ({ ...ic, showOnBack: ic.showOnBack ?? true }))
    return c
  }

  const template = old.template as string | undefined
  let archetypeId: ArchetypeId = 'modern-split'
  let paletteId = 'snow'

  if (template === 'classic') { archetypeId = 'classic-left'; paletteId = 'sand' }
  else if (template === 'bold') { archetypeId = 'bold-block'; paletteId = 'midnight' }
  else if (template === 'modern') { archetypeId = 'modern-split'; paletteId = 'snow' }

  const base = cardFromArchetypePalette(archetypeId, paletteId)
  base.id = (old.id as string) || crypto.randomUUID()

  base.fields.firstName = (old.firstName as string) || base.fields.firstName
  base.fields.lastName = (old.lastName as string) || base.fields.lastName
  base.fields.jobTitle = (old.jobTitle as string) || base.fields.jobTitle
  base.fields.phone = (old.phone as string) || base.fields.phone
  base.fields.email = (old.email as string) || base.fields.email

  if (old.textColor) base.fieldStyles.firstName!.color = old.textColor as string
  if (old.textColor) base.fieldStyles.lastName!.color = old.textColor as string
  if (old.bgColor) base.background.color1 = old.bgColor as string
  if (old.borderColor) base.border.color = old.borderColor as string
  if (old.cornerRadius !== undefined) base.border.radius = old.cornerRadius as number
  if (old.opacity !== undefined) base.effects.cardOpacity = old.opacity as number
  if (old.logo) {
    base.logo.image = old.logo as string
    base.logo.enabled = true
  }
  if (old.qrSource) base.qr.source = old.qrSource as QrConfig['source']

  return base
}

/* =========================================================================
   VCARD GENERATION
   ========================================================================= */

export function buildVCard(card: CardData): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${card.fields.lastName};${card.fields.firstName};;;`,
    `FN:${card.fields.firstName} ${card.fields.lastName}`.trim(),
  ]
  if (card.fields.company) lines.push(`ORG:${card.fields.company}`)
  if (card.fields.jobTitle) lines.push(`TITLE:${card.fields.jobTitle}`)
  if (card.fields.phone) lines.push(`TEL;TYPE=cell:${card.fields.phone.replace(/\s+/g, '')}`)
  if (card.fields.email) lines.push(`EMAIL:${card.fields.email}`)
  if (card.fields.website) {
    const url = card.fields.website.startsWith('http') ? card.fields.website : `https://${card.fields.website}`
    lines.push(`URL:${url}`)
  }
  if (card.fields.address) lines.push(`ADR;TYPE=intl,work:;;${card.fields.address};;;`)
  if (card.socialLinks?.linkedin) lines.push(`URL;type=LinkedIn:${card.socialLinks.linkedin}`)
  if (card.socialLinks?.instagram) lines.push(`URL;type=Instagram:${card.socialLinks.instagram}`)
  if (card.socialLinks?.facebook) lines.push(`URL;type=Facebook:${card.socialLinks.facebook}`)
  lines.push('END:VCARD')
  return lines.join('\n')
}

/* =========================================================================
   DESIGN RECOMMENDATIONS — professional advice based on card state
   ========================================================================= */

export type Recommendation = {
  level: 'info' | 'warning' | 'tip'
  message: string
}

export function getRecommendations(card: CardData): Recommendation[] {
  const recs: Recommendation[] = []
  const visibleFields = FIELD_DEFS.filter((f) => card.fieldStyles[f.id]?.visible !== false && card.fields[f.id])
  const visibleFieldCount = visibleFields.length
  const iconCount = card.icons?.length ?? 0

  // Too many visible fields
  if (visibleFieldCount > 7) {
    recs.push({ level: 'warning', message: `Vous affichez ${visibleFieldCount} champs. Pour une carte lisible, limitez à 5-6 informations essentielles.` })
  }

  // Too many icons
  if (iconCount > 4) {
    recs.push({ level: 'warning', message: `${iconCount} icônes sur la carte. Un excès d'icônes nuit à la lisibilité. Recommandé : 2-3 maximum.` })
  }

  // Font size too small
  for (const field of visibleFields) {
    const fs = card.fieldStyles[field.id]
    const size = fs?.fontSize ?? field.defaultFontSize
    if (size < 8) {
      recs.push({ level: 'warning', message: `Le champ « ${field.label} » a une taille de ${size}px, trop petite pour l'impression. Minimum recommandé : 8px.` })
    }
  }

  // Color contrast check
  const bg = card.background.color1
  for (const field of visibleFields) {
    const fs = card.fieldStyles[field.id]
    const color = fs?.color ?? '#0f172a'
    const contrast = getColorContrast(bg, color)
    if (contrast < 2.5) {
      recs.push({ level: 'warning', message: `Le contraste entre le texte « ${field.label} » et le fond est faible. Utilisez une couleur plus contrastée pour une meilleure lisibilité.` })
    }
  }

  // Too many colors
  const colors = new Set<string>()
  for (const field of visibleFields) {
    const fs = card.fieldStyles[field.id]
    if (fs?.color) colors.add(fs.color)
  }
  colors.add(card.background.color1)
  colors.add(card.border.color)
  if (colors.size > 5) {
    recs.push({ level: 'tip', message: `${colors.size} couleurs différentes détectées. Pour un rendu professionnel, utilisez 2-3 couleurs maximum (principe de cohérence visuelle).` })
  }

  // No QR code
  if (!card.qr.enabled) {
    recs.push({ level: 'info', message: 'Ajouter un QR code facilite le partage de vos coordonnées. Les smartphones peuvent scanner directement votre carte.' })
  }

  // No logo
  if (!card.logo.enabled) {
    recs.push({ level: 'info', message: "Un logo renforce l'identité visuelle de votre carte. Envisagez d'en ajouter un." })
  }

  // Gradient intensity
  if (card.background.type === 'gradient' && card.background.gradientIntensity < 30) {
    recs.push({ level: 'tip', message: "Un dégradé très subtil peut paraître uniforme. Augmentez l'intensité pour un effet plus visible." })
  }

  // Border radius too large
  if (card.border.radius > 40 && card.border.style !== 'none') {
    recs.push({ level: 'tip', message: 'Un rayon de coins très grand peut sembler inhabituel pour une carte de visite professionnelle. Essayez 8-16px.' })
  }

  // Font mixing
  const fonts = new Set<string>()
  for (const field of visibleFields) {
    const fs = card.fieldStyles[field.id]
    if (fs?.fontFamily) fonts.add(fs.fontFamily)
  }
  if (fonts.size > 3) {
    recs.push({ level: 'tip', message: `${fonts.size} polices différentes. Limitez à 2 polices (une pour les titres, une pour le corps) pour un rendu cohérent.` })
  }

  // Empty essential fields
  if (!card.fields.firstName && !card.fields.lastName) {
    recs.push({ level: 'warning', message: "Aucun nom renseigné. Le nom est l'information la plus importante sur une carte de visite." })
  }
  if (!card.fields.email && !card.fields.phone) {
    recs.push({ level: 'warning', message: "Aucune coordonnée de contact (email ou téléphone). Ajoutez au moins un moyen d'être contacté." })
  }

  // QR size
  if (card.qr.enabled && card.qr.size < 50) {
    recs.push({ level: 'warning', message: `Le QR code est petit (${card.qr.size}px). Pour un scan fiable, recommandé : 60px minimum.` })
  }

  // QR source is not vCard
  if (card.qr.enabled && card.qr.source !== 'vcard') {
    recs.push({ level: 'tip', message: 'Le QR code vCard permet d\'ajouter directement le contact au téléphone en un scan, sans internet.' })
  }

  // Profile photo missing for personnel/freelance
  if ((card.cardType === 'personnel' || card.cardType === 'freelance') && !card.profilePhoto?.enabled) {
    recs.push({ level: 'info', message: 'Une photo de profil rend votre carte plus personnelle et mémorable.' })
  }

  // No social links
  const hasSocial = card.socialLinks && Object.values(card.socialLinks).some((v) => v.trim() !== '')
  if (!hasSocial) {
    recs.push({ level: 'info', message: 'Ajouter des liens vers vos réseaux sociaux (LinkedIn, Instagram) renforce votre présence en ligne.' })
  }

  // Text too large for card
  for (const field of visibleFields) {
    const fs = card.fieldStyles[field.id]
    const size = fs?.fontSize ?? field.defaultFontSize
    if (size > 40) {
      recs.push({ level: 'tip', message: `Le champ « ${field.label} » a une taille de ${size}px, ce qui peut déborder. Réduisez pour un rendu équilibré.` })
    }
  }

  // Mismatched alignment
  const alignments = new Set<string>()
  for (const field of visibleFields) {
    const fs = card.fieldStyles[field.id]
    if (fs?.align) alignments.add(fs.align)
  }
  if (alignments.size > 2) {
    recs.push({ level: 'tip', message: 'Vous mélangez plusieurs alignements de texte. Pour un rendu professionnel, conservez un alignement cohérent.' })
  }

  // Phone format check
  if (card.fields.phone && !card.fields.phone.startsWith('+')) {
    recs.push({ level: 'warning', message: 'Votre numéro de téléphone n\'a pas d\'indicatif international. Ajoutez-le (ex: +33, +228) pour une utilisation internationale.' })
  }

  // Safe zone — content too close to edges
  if (card.effects.innerPadding < 16) {
    recs.push({ level: 'warning', message: 'La marge intérieure est très faible. Un minimum de 5mm (environ 16px) est recommandé pour éviter que le contenu soit coupé à l\'impression.' })
  }

  // Too many icons on card
  if (iconCount > 5) {
    recs.push({ level: 'warning', message: `${iconCount} icônes sur la carte. Pour un rendu professionnel, limitez à 3 icônes maximum.` })
  }

  // Archetype not recommended for card type
  const arch = ARCHETYPES.find((a) => a.id === card.archetype)
  if (arch && !arch.cardTypes.includes(card.cardType)) {
    recs.push({ level: 'tip', message: `Le style « ${arch.name} » n'est pas optimisé pour une carte de type « ${card.cardType} ». Vérifiez le rendu.` })
  }

  // Company field empty for professional/business cards
  if ((card.cardType === 'professionnel' || card.cardType === 'entreprise') && !card.fields.company?.trim()) {
    recs.push({ level: 'warning', message: 'Aucune entreprise renseignée. Pour une carte professionnelle, le nom de l\'entreprise est essentiel.' })
  }

  // QR vCard missing essential contact data
  if (card.qr.enabled && card.qr.source === 'vcard') {
    if (!card.fields.phone?.trim() && !card.fields.email?.trim()) {
      recs.push({ level: 'warning', message: 'Le QR code vCard ne contiendra aucune coordonnée de contact. Ajoutez au moins un email ou téléphone.' })
    }
  }

  return recs
}

/* =========================================================================
   DATA VALIDATION
   ========================================================================= */

export type ValidationIssue = {
  field: string
  level: 'error' | 'warning'
  message: string
}

export function validateCardData(card: CardData): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  if (!card.fields.firstName?.trim() && !card.fields.lastName?.trim()) {
    issues.push({ field: 'name', level: 'error', message: 'Le nom est obligatoire.' })
  }

  if (card.fields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(card.fields.email)) {
    issues.push({ field: 'email', level: 'warning', message: 'L\'email semble mal formaté.' })
  }

  if (card.fields.phone && !card.fields.phone.includes('+')) {
    issues.push({ field: 'phone', level: 'warning', message: 'Le numéro de téléphone devrait inclure un indicatif international (ex: +33, +228).' })
  }

  if (!card.fields.email?.trim() && !card.fields.phone?.trim()) {
    issues.push({ field: 'contact', level: 'warning', message: 'Au moins un moyen de contact (email ou téléphone) est recommandé.' })
  }

  if (card.fields.website && !card.fields.website.includes('.') ) {
    issues.push({ field: 'website', level: 'warning', message: 'L\'adresse du site web semble incomplète.' })
  }

  if (card.socialLinks?.linkedin && !card.socialLinks.linkedin.includes('linkedin.com')) {
    issues.push({ field: 'linkedin', level: 'warning', message: 'Le lien LinkedIn devrait contenir « linkedin.com ».' })
  }

  if (card.socialLinks?.instagram && !card.socialLinks.instagram.includes('instagram.com')) {
    issues.push({ field: 'instagram', level: 'warning', message: 'Le lien Instagram devrait contenir « instagram.com ».' })
  }

  return issues
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16) || 0
  const g = parseInt(h.substring(2, 4), 16) || 0
  const b = parseInt(h.substring(4, 6), 16) || 0
  return { r, g, b }
}

function getRelativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex)
  const rs = r / 255
  const gs = g / 255
  const bs = b / 255
  const toLin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  return 0.2126 * toLin(rs) + 0.7152 * toLin(gs) + 0.0722 * toLin(bs)
}

function getColorContrast(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hex1)
  const l2 = getRelativeLuminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}