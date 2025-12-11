export function getCookie (name: string): string | null {
  const cookieArr = document.cookie.split(';')

  for (const cookieRaw of cookieArr) {
    const cookie = cookieRaw.trim()
    const idx = cookie.indexOf('=')
    if (idx === -1) {
      continue
    }
    const key = cookie.slice(0, idx).trim()
    if (key === name) {
      const value = cookie.slice(idx + 1).trim()
      return decodeURIComponent(value)
    }
  }
  return null
}

export function get (
  url: string,
  data?: Record<string | number, unknown | unknown[]>,
): Promise<Response> {
  const urlObj = new URL(location.origin + url)
  for (const key in data) {
    if (Array.isArray(data[key])) {
      for (const item of data[key] as unknown[]) {
        urlObj.searchParams.append(key, item?.toString() ?? '')
      }
    } else {
      urlObj.searchParams.append(key, data[key]?.toString() ?? '')
    }
  }

  return fetch(urlObj.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export function post (
  url: string,
  data?: Record<string | number, unknown> | unknown[] | FormData,
  contentType?: string,
): Promise<Response> {
  const isFormData = data instanceof FormData
  return fetch(location.origin + url, {
    method: 'POST',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': contentType ?? 'application/json' }),
    },
    body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
    credentials: 'include',
  })
}

export function put (url: string, data?: Record<string | number, unknown>): Promise<Response> {
  return fetch(location.origin + url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  })
}

export function patch (url: string, data?: Record<string | number, unknown>): Promise<Response> {
  return fetch(location.origin + url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  })
}

export function del (url: string): Promise<Response> {
  return fetch(location.origin + url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export function flattenObject (
  obj: any,
  parentKey = '',
  result: Record<string, any> = {},
): Record<string, any> {
  if (typeof obj === 'string' && parentKey === '') {
    return { obj }
  }
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = parentKey ? `${parentKey}[${key}]` : key
      if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        flattenObject(obj[key], newKey, result)
      } else if (Array.isArray(obj[key])) {
        // eslint-disable-next-line unicorn/no-array-for-each
        obj[key].forEach((item: any, index: number) => {
          const arrayKey = `${newKey}[${index}]`
          if (typeof item === 'object') {
            flattenObject(item, arrayKey, result)
          } else {
            result[arrayKey] = item
          }
        })
      } else {
        result[newKey] = obj[key]
      }
    }
  }
  return result
}

export function getErrorMessage (error: any): string {
  if ('details' in error) {
    return Object.values(flattenObject(error.details)).join(' ')
  }
  if ('errors' in error) {
    return Object.values(flattenObject(error.errors)).join(' ')
  }
  if ('error' in error) {
    return Object.values(flattenObject(error.error)).join(' ')
  }
  if ('new_password' in error) {
    return Object.values(flattenObject(error.new_password)).join(' ')
  }
  return 'Неизвестная ошибка'
}
