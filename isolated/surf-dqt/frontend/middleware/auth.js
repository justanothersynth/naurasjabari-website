export default async ({ route, store, redirect }) => {
  const found = route.meta.find((meta) => {
    return meta.hasOwnProperty('requiresAuth') && typeof meta.requiresAuth === 'boolean'
  })
  const toLogin = route.path.includes('login')
  if (toLogin || (found && found.requiresAuth)) {
    const authenticated = await store.dispatch('admin/authenticate')
    if (!authenticated && !toLogin) {
      return redirect('/login')
    } else if (authenticated && toLogin) {
      return redirect('/modify')
    }
  }
}
