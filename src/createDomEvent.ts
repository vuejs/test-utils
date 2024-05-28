import domEvents, {
  DomEvent,
  DomEventName,
  DomEventNameWithModifier,
  KeyName,
  Modifier,
  ignorableKeyModifiers,
  systemKeyModifiers,
  mouseKeyModifiers,
  keyCodesByKeyName
} from './constants/dom-events'

interface TriggerOptions {
  code?: String
  key?: String
  keyCode?: Number
  [custom: string]: any
}

interface EventParams {
  eventType: DomEventName
  modifiers: KeyName[]
  options?: TriggerOptions
}

/**
 * Groups modifiers into lists
 */
function generateModifiers(modifiers: KeyName[], isOnClick: boolean) {
  const keyModifiers: KeyName[] = []
  const systemModifiers: Modifier[] = []

  for (let i = 0; i < modifiers.length; i++) {
    const modifier: KeyName | Modifier = modifiers[i]

    // addEventListener() options, e.g. .passive & .capture, that we dont need to handle
    if (ignorableKeyModifiers.includes(modifier)) {
      continue
    }
    // modifiers that require special conversion
    // if passed a left/right key modifier with onClick, add it here as well.
    if (
      systemKeyModifiers.includes(
        modifier as Exclude<typeof modifier, KeyName>
      ) ||
      (mouseKeyModifiers.includes(
        modifier as Exclude<typeof modifier, KeyName>
      ) &&
        isOnClick)
    ) {
      systemModifiers.push(modifier as Modifier)
    } else {
      keyModifiers.push(modifier)
    }
  }

  return {
    keyModifiers,
    systemModifiers
  }
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

  const meta: DomEvent = domEvents[eventType] || {
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
    code: options.code || keyCode,
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
  const eventInterface = meta.eventInterface as keyof Window
  const metaEventInterface = window[eventInterface] as Event

  const SupportedEventInterface =
    typeof metaEventInterface === 'function' ? metaEventInterface : window.Event

  return new SupportedEventInterface(
    eventType,
    // event properties can only be added when the event is instantiated
    // custom properties must be added after the event has been instantiated
    eventProperties
  )
}

function createDOMEvent(
  eventString: DomEventNameWithModifier | string,
  options?: TriggerOptions
) {
  // split eventString like `keydown.ctrl.shift` into `keydown` and array of modifiers
  const [eventType, ...modifiers] = eventString.split('.')

  const eventParams: EventParams = {
    eventType: eventType as DomEventName,
    modifiers: modifiers as KeyName[],
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

export { TriggerOptions, createDOMEvent, keyCodesByKeyName, KeyName }
