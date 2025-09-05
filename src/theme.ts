import type {
  Arrayable,
  Preflight,
  PresetWindTheme,
  Rule,
  SafeListContext,
  UserShortcuts,
  Variant,
} from 'unocss'

export const theme = {} as PresetWindTheme

export const rules = [] as Rule<PresetWindTheme>[]

export const variants = [] as Variant<PresetWindTheme>[]

export const shortcuts = [] as UserShortcuts<PresetWindTheme>

export const preflights = [] as Preflight<PresetWindTheme>[]

type SafeListItem =
  | string
  | ((context: SafeListContext<PresetWindTheme>) => Arrayable<string>)

export const safelist = [] as SafeListItem[]
