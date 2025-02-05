import { reactive, toRef, isReactive, Ref } from '@vue/composition-api'
import type VueRouter from 'vue-router'
import type { Route } from 'vue-router'
import { useNuxtApp } from './app'

export * from '@vue/composition-api'

const mock = () => () => { throw new Error('not implemented') }

export const useAsyncData = mock()
export const useHydration = mock()

// Runtime config helper
export const useRuntimeConfig = () => {
  const app = useNuxtApp().legacyApp
  if (!app._$config) {
    app._$config = reactive(app.$config)
  }
  return app._$config
}

// Auto-import equivalents for `vue-router`
export const useRouter = () => {
  return useNuxtApp()?.legacyNuxt.router as VueRouter
}

// This provides an equivalent interface to `vue-router` (unlike legacy implementation)
export const useRoute = () => {
  const nuxt = useNuxtApp()

  if (!nuxt._route) {
    Object.defineProperty(nuxt, '__route', {
      get: () => nuxt.legacyNuxt.context.route
    })
    nuxt._route = reactive(nuxt.__route)
    const router = useRouter()
    router.afterEach(route => Object.assign(nuxt._route, route))
  }

  return nuxt._route as Route
}

// payload.state is used for vuex by nuxt 2
export const useState = <T>(key: string, init?: (() => T)): Ref<T> => {
  const nuxtApp = useNuxtApp()
  if (!nuxtApp.payload.useState) {
    nuxtApp.payload.useState = {}
  }
  if (!isReactive(nuxtApp.payload.useState)) {
    nuxtApp.payload.useState = reactive(nuxtApp.payload.useState)
  }
  const state = toRef(nuxtApp.payload.useState, key)
  if (state.value === undefined && init) {
    state.value = init()
  }
  return state
}
