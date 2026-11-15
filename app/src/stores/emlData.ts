import { atom } from 'nanostores'

import type { Email } from '~/lib/email'

const emlData = atom<Email | null>(null)

export default emlData
