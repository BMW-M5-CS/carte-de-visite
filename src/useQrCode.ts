import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export function useQrCode(value: string | null, dark = '#000000', light = '#ffffff00'): string | null {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    if (!value) {
      setDataUrl(null)
      return
    }
    QRCode.toDataURL(value, {
      margin: 1,
      width: 240,
      color: { dark, light },
    })
      .then((url) => {
        if (active) setDataUrl(url)
      })
      .catch(() => {
        if (active) setDataUrl(null)
      })
    return () => {
      active = false
    }
  }, [value, dark, light])

  return dataUrl
}
