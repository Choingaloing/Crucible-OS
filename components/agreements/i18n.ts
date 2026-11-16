import type { AgreementTemplate } from '@/types/cruciblePro'

/** Languages the public signing page can render in. */
export type AgreementLang = 'en' | 'es'

/** Templates that have a full Spanish translation (the language switch only shows for these). */
export const SPANISH_TEMPLATES: readonly AgreementTemplate[] = ['growth_partner']

export function supportsSpanish(template: AgreementTemplate): boolean {
  return SPANISH_TEMPLATES.includes(template)
}

/** Locale for dates: "November 16, 2026" / "16 de noviembre de 2026". */
export const DATE_LOCALE: Record<AgreementLang, string> = { en: 'en-US', es: 'es-MX' }

/** Shared page chrome: top bar, parties card, signature panel, sign form, signed banner. */
export const UI = {
  en: {
    forSignature: 'Agreement for signature',
    reviewSign: 'Review & sign',
    signed: 'Signed',
    confidential: 'Confidential',
    questions: 'Questions before signing? Email',
    effectiveOnSignature: "the date of the Client's signature below",
    madeAsOf: 'This Agreement is made as of',
    effectiveDate: 'Effective Date',
    between: 'between',
    operatedBy: 'operated by Chandler Ricks',
    and: 'and',
    client: 'Client',
    clientName: 'Client Name',
    company: 'Company',
    email: 'Email',
    phone: 'Phone',
    bySigning: 'By signing, each party confirms they have read, understood, and agree to be bound by this Agreement.',
    signature: 'Signature',
    nameTitle: 'Name / Title',
    date: 'Date',
    founder: 'Founder',
    uponSignature: 'Upon signature',
    pricingOption: 'Pricing option (Section 4)',
    fullName: 'Full name',
    fullNamePlaceholder: 'Your full legal name',
    title: 'Title',
    titlePlaceholder: 'President',
    authorizedPre: 'I am authorized to sign on behalf of',
    authorizedPost:
      ', I have read this Agreement, and I agree that my electronic signature is the legal equivalent of my handwritten signature.',
    signButton: 'Sign & complete agreement',
    signing: 'Signing…',
    recorded: 'Your signature, date, and IP address are recorded for verification.',
    addSignature: 'Please add your signature.',
    genericError: 'Something went wrong. Please try again.',
    agreementSigned: 'Agreement signed',
    signedBy: 'Signed by',
    on: 'on',
    copySaved: 'A copy is saved to your Crucible Pro billing page.',
    downloadPdf: 'Download PDF',
    selected: 'Selected',
    pad: {
      draw: 'Draw',
      type: 'Type',
      clear: 'Clear',
      signHere: 'Sign here',
      typePlaceholder: 'Type your full name',
      ariaLabel: 'Signature pad',
    },
  },
  es: {
    forSignature: 'Acuerdo para firma',
    reviewSign: 'Revisar y firmar',
    signed: 'Firmado',
    confidential: 'Confidencial',
    questions: '¿Tiene preguntas antes de firmar? Escriba a',
    effectiveOnSignature: 'la fecha de la firma del Cliente que aparece abajo',
    madeAsOf: 'Este Acuerdo se celebra a partir de',
    effectiveDate: 'Fecha de Entrada en Vigor',
    between: 'entre',
    operatedBy: 'operada por Chandler Ricks',
    and: 'y',
    client: 'el Cliente',
    clientName: 'Nombre del Cliente',
    company: 'Empresa',
    email: 'Correo electrónico',
    phone: 'Teléfono',
    bySigning: 'Al firmar, cada parte confirma que ha leído y entendido este Acuerdo, y que acepta quedar obligada por él.',
    signature: 'Firma',
    nameTitle: 'Nombre / Cargo',
    date: 'Fecha',
    founder: 'Fundador',
    uponSignature: 'Al momento de la firma',
    pricingOption: 'Opción de pago (Sección 4)',
    fullName: 'Nombre completo',
    fullNamePlaceholder: 'Su nombre legal completo',
    title: 'Cargo',
    titlePlaceholder: 'Propietario',
    authorizedPre: 'Estoy autorizado para firmar en nombre de',
    authorizedPost:
      ', he leído este Acuerdo y acepto que mi firma electrónica tiene la misma validez legal que mi firma autógrafa.',
    signButton: 'Firmar y completar el acuerdo',
    signing: 'Firmando…',
    recorded: 'Su firma, la fecha y su dirección IP quedan registradas para verificación.',
    addSignature: 'Por favor, agregue su firma.',
    genericError: 'Algo salió mal. Por favor, intente de nuevo.',
    agreementSigned: 'Acuerdo firmado',
    signedBy: 'Firmado por',
    on: 'el',
    copySaved: 'Hay una copia guardada en su página de facturación de Crucible Pro.',
    downloadPdf: 'Descargar PDF',
    selected: 'Elegida',
    pad: {
      draw: 'Dibujar',
      type: 'Escribir',
      clear: 'Borrar',
      signHere: 'Firme aquí',
      typePlaceholder: 'Escriba su nombre completo',
      ariaLabel: 'Área de firma',
    },
  },
} as const

export type AgreementUI = (typeof UI)[AgreementLang]
export type SignaturePadLabels = AgreementUI['pad']

/** Spanish versions of the sign route's error messages (the API answers in English). */
const SERVER_ERRORS_ES: Record<string, string> = {
  'Please choose a pricing option.': 'Por favor, elija una opción de pago.',
  'Please enter your full name.': 'Por favor, escriba su nombre completo.',
  'Please enter a valid date.': 'Por favor, escriba una fecha válida.',
  'Please add your signature.': 'Por favor, agregue su firma.',
  'Signature image is too large.': 'La imagen de la firma es demasiado grande.',
  'This agreement has already been signed.': 'Este acuerdo ya fue firmado.',
  'Agreement not found': 'No se encontró el acuerdo.',
}

export function translateServerError(message: string, lang: AgreementLang): string {
  if (lang === 'en') return message
  return SERVER_ERRORS_ES[message] ?? UI.es.genericError
}
