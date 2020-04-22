import * as eventTypes from 'dom-event-types'

interface TriggerOptions {
  code?: String
  key?: String
  keyCode?: Number
  [custom: string]: any
}

interface EventParams {
  eventType: string
  modifier: string
  meta: any
  options?: TriggerOptions
}

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
  const { modifier, meta, options } = eventParams
  const keyCode =
    keyCodesByKeyName[modifier] ||
    (options && (options.keyCode || options.code))

  return {
    ...options, // What the user passed in as the second argument to #trigger
    bubbles: meta.bubbles,
    meta: meta.cancelable,
    // Any derived options should go here
    keyCode,
    code: keyCode
  }
}

function createEvent(eventParams: EventParams) {
  const { eventType, meta } = eventParams
  const metaEventInterface = window[meta.eventInterface]

  const SupportedEventInterface =
    typeof metaEventInterface === 'function' ? metaEventInterface : window.Event

  const eventProperties = getEventProperties(eventParams)

  const event = new SupportedEventInterface(
    eventType,
    // event properties can only be added when the event is instantiated
    // custom properties must be added after the event has been instantiated
    eventProperties
  )

  return event
}

function createDOMEvent(eventString: String, options?: TriggerOptions) {
  const [eventType, modifier] = eventString.split('.')
  const meta = eventTypes[eventType] || {
    eventInterface: 'Event',
    cancelable: true,
    bubbles: true
  }

  const eventParams: EventParams = { eventType, modifier, meta, options }
  const event: Event = createEvent(eventParams)
  const eventPrototype = Object.getPrototypeOf(event)

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
