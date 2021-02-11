// @ts-ignore No DefinitelyTyped package exists
import eventTypes from 'dom-event-types'

interface TriggerOptions {
  code?: String
  key?: String
  keyCode?: Number
  [custom: string]: any
}

interface EventParams {
  eventType: string
  modifiers: KeyNameArray
  options?: TriggerOptions
}

// modifiers to keep an eye on
const ignorableKeyModifiers = ['stop', 'prevent', 'self', 'exact']
const systemKeyModifiers = ['ctrl', 'shift', 'alt', 'meta']
const mouseKeyModifiers = ['left', 'middle', 'right']

/**
 * Groups modifiers into lists
 */
function generateModifiers(modifiers: KeyNameArray, isOnClick: boolean) {
  const keyModifiers: KeyNameArray = []
  const systemModifiers: string[] = []

  for (let i = 0; i < modifiers.length; i++) {
    const modifier = modifiers[i]

    // addEventListener() options, e.g. .passive & .capture, that we dont need to handle
    if (ignorableKeyModifiers.includes(modifier)) {
      continue
    }
    // modifiers that require special conversion
    // if passed a left/right key modifier with onClick, add it here as well.
    if (
      systemKeyModifiers.includes(modifier) ||
      (mouseKeyModifiers.includes(modifier) && isOnClick)
    ) {
      systemModifiers.push(modifier)
    } else {
      keyModifiers.push(modifier)
    }
  }

  return {
    keyModifiers,
    systemModifiers
  }
}

export type KeyNameArray = Array<keyof typeof keyCodesByKeyName>
export const keyCodesByKeyName = {
  backspace: 8,
  tab: 9,
  enter: 13,
  esc: 27,
  space: 32,
  pageup: 33,
  pagedown: 34,
  end: 35,
  home: 36,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  insert: 45,
  delete: 46
}

function getEventProperties(eventParams: EventParams) {
  let { modifiers, options = {}, eventType } = eventParams

  let isOnClick = eventType === 'click'

  const { keyModifiers, systemModifiers } = generateModifiers(
    modifiers,
    isOnClick
  )

  if (isOnClick) {
    // if it's a right click, it should fire a `contextmenu` event
    if (systemModifiers.includes('right')) {
      eventType = 'contextmenu'
      options.button = 2
      // if its a middle click, fire a `mouseup` event
    } else if (systemModifiers.includes('middle')) {
      eventType = 'mouseup'
      options.button = 1
    }
  }

  const meta = eventTypes[eventType] || {
    eventInterface: 'Event',
    cancelable: true,
    bubbles: true
  }

  // convert `shift, ctrl` to `shiftKey, ctrlKey`
  // allows trigger('keydown.shift.ctrl.n') directly
  const systemModifiersMeta = systemModifiers.reduce(
    (all: Record<string, boolean>, key) => {
      all[`${key}Key`] = true
      return all
    },
    {}
  )

  // get the keyCode for backwards compat
  const keyCode =
    keyCodesByKeyName[keyModifiers[0]] ||
    (options && (options.keyCode || options.code))

  const eventProperties = {
    ...systemModifiersMeta, // shiftKey, metaKey etc
    ...options, // What the user passed in as the second argument to #trigger
    bubbles: meta.bubbles,
    cancelable: meta.cancelable,
    // Any derived options should go here
    keyCode,
    code: keyCode,
    // if we have a `key`, use it, otherwise dont set anything (allows user to pass custom key)
    ...(keyModifiers[0] ? { key: keyModifiers[0] } : {})
  }

  return {
    eventProperties,
    meta,
    eventType
  }
}

function createEvent(eventParams: EventParams) {
  const { eventProperties, meta, eventType } = getEventProperties(eventParams)

  // user defined eventInterface
  const metaEventInterface = window[meta.eventInterface]

  const SupportedEventInterface =
    typeof metaEventInterface === 'function' ? metaEventInterface : window.Event

  return new SupportedEventInterface(
    eventType,
    // event properties can only be added when the event is instantiated
    // custom properties must be added after the event has been instantiated
    eventProperties
  )
}

function createDOMEvent(eventString: String, options?: TriggerOptions) {
  // split eventString like `keydown.ctrl.shift.c` into `keydown` and array of modifiers
  const [eventType, ...modifiers] = eventString.split('.')

  const eventParams: EventParams = {
    eventType,
    modifiers: modifiers as KeyNameArray,
    options
  }
  const event: Event & TriggerOptions = createEvent(eventParams)
  const eventPrototype = Object.getPrototypeOf(event)

  // attach custom options to the event, like `relatedTarget` and so on.
  options &&
    Object.keys(options).forEach((key) => {
      const propertyDescriptor = Object.getOwnPropertyDescriptor(
        eventPrototype,
        key
      )
      const canSetProperty = !(
        propertyDescriptor && propertyDescriptor.set === undefined
      )
      if (canSetProperty) {
        event[key] = options[key]
      }
    })
  return event
}

export { TriggerOptions, createDOMEvent }
