export const hasCameraPermission = async (remembered: boolean): Promise<boolean> => {
  if (remembered) {
    return true
  }

  if (!navigator.permissions?.query) {
    return false
  }

  try {
    const status = await navigator.permissions.query({ name: 'camera' as PermissionName })
    return status.state === 'granted'
  } catch (error) {
    console.warn('Не удалось проверить разрешение камеры', error)
    return false
  }
}
