import { useEffect, useId } from 'react'

type JsonLdData = Record<string, unknown> | Record<string, unknown>[]

/** Injects schema.org JSON-LD into document head; removed on unmount. */
export default function JsonLd({ data }: { data: JsonLdData }) {
  const id = useId().replace(/:/g, '')
  const serialized = JSON.stringify(data)

  useEffect(() => {
    const scripts: HTMLScriptElement[] = []
    const items: Record<string, unknown>[] = Array.isArray(data) ? data : [data]

    items.forEach((item, index) => {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.setAttribute('data-jaai-jsonld', `${id}-${index}`)
      script.textContent = JSON.stringify(item)
      document.head.appendChild(script)
      scripts.push(script)
    })

    return () => {
      scripts.forEach((s) => s.remove())
    }
  }, [serialized, id])

  return null
}
