import eventTypes from 'dom-event-types'

const keyCodesByKeyName = {
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

function getEventProperties(eventParams) {
  const { modifier, meta, options } = eventParams
  const keyCode = keyCodesByKeyName[modifier] || options.key || options.keyCode || options.code

  return {
    ...options, // What the user passed in as the second argument to #trigger
    bubbles: meta.bubbles,
    meta: meta.cancelable,
    // Any derived options should go here
    key: keyCode,
    keyCode,
    code: keyCode
  }
}

function createEvent(eventParams) {
  const { eventType, meta } = eventParams
  const metaEventInterface = window[meta.eventInterface]

  const SupportedEventInterface =
    typeof metaEventInterface === 'function'
      ? metaEventInterface
      : window.Event

  const eventProperties = getEventProperties(eventParams)

  const event = new SupportedEventInterface(
    eventType,
    // event properties can only be added when the event is instantiated
    // custom properties must be added after the event has been instantiated
    eventProperties
  )

  return event
}

function createEventForOldBrowsers(eventParams) {
  const { eventType, modifier, meta } = eventParams
  const { bubbles, cancelable } = meta

  const event = document.createEvent('Event')
  event.initEvent(eventType, bubbles, cancelable)
  event['keyCode'] = keyCodesByKeyName[modifier]
  return event
}

export default function createDOMEvent(eventString: String, options: Object = {}) {
  const [eventType, modifier] = eventString.split('.')
  const meta = eventTypes[eventType]
    || { eventInterface: 'Event', cancelable: true, bubbles: true }

  const eventParams = { eventType, modifier, meta, options }

  const event = 
    typeof window.Event === 'function'
      ? createEvent(eventParams)
      : createEventForOldBrowsers(eventParams) // Fallback for IE10,11 - https://stackoverflow.com/questions/26596123

  const eventPrototype = Object.getPrototypeOf(event)

  Object.keys(options).forEach(key => {
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
