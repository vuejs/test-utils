export type EventInterface =
  | 'AnimationEvent'
  | 'AudioProcessingEvent'
  | 'BeforeInputEvent'
  | 'BeforeUnloadEvent'
  | 'BlobEvent'
  | 'CSSFontFaceLoadEvent'
  | 'ClipboardEvent'
  | 'CloseEvent'
  | 'CompositionEvent'
  | 'CustomEvent'
  | 'DOMTransactionEvent'
  | 'DeviceLightEvent'
  | 'DeviceMotionEvent'
  | 'DeviceOrientationEvent'
  | 'DeviceProximityEvent'
  | 'DragEvent'
  | 'EditingBeforeInputEvent'
  | 'ErrorEvent'
  | 'Event'
  | 'FetchEvent'
  | 'FocusEvent'
  | 'GamepadEvent'
  | 'HashChangeEvent'
  | 'IDBVersionChangeEvent'
  | 'InputEvent'
  | 'KeyboardEvent'
  | 'MediaStreamEvent'
  | 'MessageEvent'
  | 'MouseEvent'
  | 'MutationEvent'
  | 'OfflineAudioCompletionEvent'
  | 'OverconstrainedError'
  | 'PageTransitionEvent'
  | 'PaymentRequestUpdateEvent'
  | 'PointerEvent'
  | 'PopStateEvent'
  | 'ProgressEvent'
  | 'RTCDataChannelEvent'
  | 'RTCIdentityErrorEvent'
  | 'RTCIdentityEvent'
  | 'RTCPeerConnectionIceEvent'
  | 'RelatedEvent'
  | 'SVGEvent'
  | 'SVGZoomEvent'
  | 'SensorEvent'
  | 'StorageEvent'
  | 'TimeEvent'
  | 'TouchEvent'
  | 'TrackEvent'
  | 'TransitionEvent'
  | 'UIEvent'
  | 'UserProximityEvent'
  | 'WebGLContextEvent'
  | 'WheelEvent'

export interface DomEvent {
  eventInterface: EventInterface | string
  bubbles: boolean
  cancelable: boolean
}

export type DomEventName = keyof typeof domEvents

export const ignorableKeyModifiers = [
  'stop',
  'prevent',
  'self',
  'exact',
  'prevent',
  'capture'
]
export const systemKeyModifiers = ['ctrl', 'shift', 'alt', 'meta'] as const
export const mouseKeyModifiers = ['left', 'middle', 'right'] as const

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
} as const

export type KeyName = keyof typeof keyCodesByKeyName
export type Modifier =
  | (typeof systemKeyModifiers)[number]
  | (typeof mouseKeyModifiers)[number]

export type DomEventNameWithModifier =
  | DomEventName
  | `${DomEventName}.${(typeof systemKeyModifiers)[number]}`
  | `click.${(typeof mouseKeyModifiers)[number]}`
  | `click.${(typeof systemKeyModifiers)[number]}.${(typeof mouseKeyModifiers)[number]}`
  | `${'keydown' | 'keyup'}.${keyof typeof keyCodesByKeyName}`
  | `${
      | 'keydown'
      | 'keyup'}.${(typeof systemKeyModifiers)[number]}.${keyof typeof keyCodesByKeyName}`

const domEvents = {
  abort: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  afterprint: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  animationend: {
    eventInterface: 'AnimationEvent',
    bubbles: true,
    cancelable: false
  },
  animationiteration: {
    eventInterface: 'AnimationEvent',
    bubbles: true,
    cancelable: false
  },
  animationstart: {
    eventInterface: 'AnimationEvent',
    bubbles: true,
    cancelable: false
  },
  appinstalled: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  /**
   * @deprecated
   */
  audioprocess: {
    eventInterface: 'AudioProcessingEvent',
    bubbles: false,
    cancelable: false
  },
  audioend: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  audiostart: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  beforeprint: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  beforeunload: {
    eventInterface: 'BeforeUnloadEvent',
    bubbles: false,
    cancelable: true
  },
  beginEvent: {
    eventInterface: 'TimeEvent',
    bubbles: false,
    cancelable: false
  },
  blur: {
    eventInterface: 'FocusEvent',
    bubbles: false,
    cancelable: false
  },
  boundary: {
    eventInterface: 'SpeechSynthesisEvent',
    bubbles: false,
    cancelable: false
  },
  cached: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  canplay: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  canplaythrough: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  change: {
    eventInterface: 'Event',
    bubbles: true,
    cancelable: false
  },
  chargingchange: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  chargingtimechange: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  checking: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  click: {
    eventInterface: 'MouseEvent',
    bubbles: true,
    cancelable: true
  },
  close: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  complete: {
    eventInterface: 'OfflineAudioCompletionEvent',
    bubbles: false,
    cancelable: false
  },
  compositionend: {
    eventInterface: 'CompositionEvent',
    bubbles: true,
    cancelable: true
  },
  compositionstart: {
    eventInterface: 'CompositionEvent',
    bubbles: true,
    cancelable: true
  },
  compositionupdate: {
    eventInterface: 'CompositionEvent',
    bubbles: true,
    cancelable: false
  },
  contextmenu: {
    eventInterface: 'MouseEvent',
    bubbles: true,
    cancelable: true
  },
  copy: {
    eventInterface: 'ClipboardEvent',
    bubbles: true,
    cancelable: true
  },
  cut: {
    eventInterface: 'ClipboardEvent',
    bubbles: true,
    cancelable: true
  },
  dblclick: {
    eventInterface: 'MouseEvent',
    bubbles: true,
    cancelable: true
  },
  devicechange: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  devicelight: {
    eventInterface: 'DeviceLightEvent',
    bubbles: false,
    cancelable: false
  },
  devicemotion: {
    eventInterface: 'DeviceMotionEvent',
    bubbles: false,
    cancelable: false
  },
  deviceorientation: {
    eventInterface: 'DeviceOrientationEvent',
    bubbles: false,
    cancelable: false
  },
  deviceproximity: {
    eventInterface: 'DeviceProximityEvent',
    bubbles: false,
    cancelable: false
  },
  dischargingtimechange: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  DOMActivate: {
    eventInterface: 'UIEvent',
    bubbles: true,
    cancelable: true
  },
  DOMAttributeNameChanged: {
    eventInterface: 'MutationNameEvent',
    bubbles: true,
    cancelable: true
  },
  DOMAttrModified: {
    eventInterface: 'MutationEvent',
    bubbles: true,
    cancelable: true
  },
  DOMCharacterDataModified: {
    eventInterface: 'MutationEvent',
    bubbles: true,
    cancelable: true
  },
  DOMContentLoaded: {
    eventInterface: 'Event',
    bubbles: true,
    cancelable: true
  },
  DOMElementNameChanged: {
    eventInterface: 'MutationNameEvent',
    bubbles: true,
    cancelable: true
  },
  DOMFocusIn: {
    eventInterface: 'FocusEvent',
    bubbles: true,
    cancelable: true
  },
  DOMFocusOut: {
    eventInterface: 'FocusEvent',
    bubbles: true,
    cancelable: true
  },
  DOMNodeInserted: {
    eventInterface: 'MutationEvent',
    bubbles: true,
    cancelable: true
  },
  DOMNodeInsertedIntoDocument: {
    eventInterface: 'MutationEvent',
    bubbles: true,
    cancelable: true
  },
  DOMNodeRemoved: {
    eventInterface: 'MutationEvent',
    bubbles: true,
    cancelable: true
  },
  DOMNodeRemovedFromDocument: {
    eventInterface: 'MutationEvent',
    bubbles: true,
    cancelable: true
  },
  /**
   * @deprecated
   */
  DOMSubtreeModified: {
    eventInterface: 'MutationEvent',
    bubbles: true,
    cancelable: false
  },
  downloading: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  drag: {
    eventInterface: 'DragEvent',
    bubbles: true,
    cancelable: true
  },
  dragend: {
    eventInterface: 'DragEvent',
    bubbles: true,
    cancelable: false
  },
  dragenter: {
    eventInterface: 'DragEvent',
    bubbles: true,
    cancelable: true
  },
  dragleave: {
    eventInterface: 'DragEvent',
    bubbles: true,
    cancelable: false
  },
  dragover: {
    eventInterface: 'DragEvent',
    bubbles: true,
    cancelable: true
  },
  dragstart: {
    eventInterface: 'DragEvent',
    bubbles: true,
    cancelable: true
  },
  drop: {
    eventInterface: 'DragEvent',
    bubbles: true,
    cancelable: true
  },
  durationchange: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  emptied: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  end: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  ended: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  endEvent: {
    eventInterface: 'TimeEvent',
    bubbles: false,
    cancelable: false
  },
  error: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  focus: {
    eventInterface: 'FocusEvent',
    bubbles: false,
    cancelable: false
  },
  focusin: {
    eventInterface: 'FocusEvent',
    bubbles: true,
    cancelable: false
  },
  focusout: {
    eventInterface: 'FocusEvent',
    bubbles: true,
    cancelable: false
  },
  fullscreenchange: {
    eventInterface: 'Event',
    bubbles: true,
    cancelable: false
  },
  fullscreenerror: {
    eventInterface: 'Event',
    bubbles: true,
    cancelable: false
  },
  gamepadconnected: {
    eventInterface: 'GamepadEvent',
    bubbles: false,
    cancelable: false
  },
  gamepaddisconnected: {
    eventInterface: 'GamepadEvent',
    bubbles: false,
    cancelable: false
  },
  gotpointercapture: {
    eventInterface: 'PointerEvent',
    bubbles: false,
    cancelable: false
  },
  hashchange: {
    eventInterface: 'HashChangeEvent',
    bubbles: true,
    cancelable: false
  },
  lostpointercapture: {
    eventInterface: 'PointerEvent',
    bubbles: false,
    cancelable: false
  },
  input: {
    eventInterface: 'Event',
    bubbles: true,
    cancelable: false
  },
  invalid: {
    eventInterface: 'Event',
    cancelable: true,
    bubbles: false
  },
  keydown: {
    eventInterface: 'KeyboardEvent',
    bubbles: true,
    cancelable: true
  },
  keypress: {
    eventInterface: 'KeyboardEvent',
    bubbles: true,
    cancelable: true
  },
  keyup: {
    eventInterface: 'KeyboardEvent',
    bubbles: true,
    cancelable: true
  },
  languagechange: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  levelchange: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  load: {
    eventInterface: 'UIEvent',
    bubbles: false,
    cancelable: false
  },
  loadeddata: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  loadedmetadata: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  loadend: {
    eventInterface: 'ProgressEvent',
    bubbles: false,
    cancelable: false
  },
  loadstart: {
    eventInterface: 'ProgressEvent',
    bubbles: false,
    cancelable: false
  },
  mark: {
    eventInterface: 'SpeechSynthesisEvent',
    bubbles: false,
    cancelable: false
  },
  message: {
    eventInterface: 'MessageEvent',
    bubbles: false,
    cancelable: false
  },
  messageerror: {
    eventInterface: 'MessageEvent',
    bubbles: false,
    cancelable: false
  },
  mousedown: {
    eventInterface: 'MouseEvent',
    bubbles: true,
    cancelable: true
  },
  mouseenter: {
    eventInterface: 'MouseEvent',
    bubbles: false,
    cancelable: false
  },
  mouseleave: {
    eventInterface: 'MouseEvent',
    bubbles: false,
    cancelable: false
  },
  mousemove: {
    eventInterface: 'MouseEvent',
    bubbles: true,
    cancelable: true
  },
  mouseout: {
    eventInterface: 'MouseEvent',
    bubbles: true,
    cancelable: true
  },
  mouseover: {
    eventInterface: 'MouseEvent',
    bubbles: true,
    cancelable: true
  },
  mouseup: {
    eventInterface: 'MouseEvent',
    bubbles: true,
    cancelable: true
  },
  nomatch: {
    eventInterface: 'SpeechRecognitionEvent',
    bubbles: false,
    cancelable: false
  },
  notificationclick: {
    eventInterface: 'NotificationEvent',
    bubbles: false,
    cancelable: false
  },
  noupdate: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  obsolete: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  offline: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  online: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  open: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  orientationchange: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  pagehide: {
    eventInterface: 'PageTransitionEvent',
    bubbles: false,
    cancelable: false
  },
  pageshow: {
    eventInterface: 'PageTransitionEvent',
    bubbles: false,
    cancelable: false
  },
  paste: {
    eventInterface: 'ClipboardEvent',
    bubbles: true,
    cancelable: true
  },
  pause: {
    eventInterface: 'SpeechSynthesisEvent',
    bubbles: false,
    cancelable: false
  },
  pointercancel: {
    eventInterface: 'PointerEvent',
    bubbles: true,
    cancelable: false
  },
  pointerdown: {
    eventInterface: 'PointerEvent',
    bubbles: true,
    cancelable: true
  },
  pointerenter: {
    eventInterface: 'PointerEvent',
    bubbles: false,
    cancelable: false
  },
  pointerleave: {
    eventInterface: 'PointerEvent',
    bubbles: false,
    cancelable: false
  },
  pointerlockchange: {
    eventInterface: 'Event',
    bubbles: true,
    cancelable: false
  },
  pointerlockerror: {
    eventInterface: 'Event',
    bubbles: true,
    cancelable: false
  },
  pointermove: {
    eventInterface: 'PointerEvent',
    bubbles: true,
    cancelable: true
  },
  pointerout: {
    eventInterface: 'PointerEvent',
    bubbles: true,
    cancelable: true
  },
  pointerover: {
    eventInterface: 'PointerEvent',
    bubbles: true,
    cancelable: true
  },
  pointerup: {
    eventInterface: 'PointerEvent',
    bubbles: true,
    cancelable: true
  },
  play: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  playing: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  popstate: {
    eventInterface: 'PopStateEvent',
    bubbles: true,
    cancelable: false
  },
  progress: {
    eventInterface: 'ProgressEvent',
    bubbles: false,
    cancelable: false
  },
  push: {
    eventInterface: 'PushEvent',
    bubbles: false,
    cancelable: false
  },
  pushsubscriptionchange: {
    eventInterface: 'PushEvent',
    bubbles: false,
    cancelable: false
  },
  ratechange: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  readystatechange: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  repeatEvent: {
    eventInterface: 'TimeEvent',
    bubbles: false,
    cancelable: false
  },
  reset: {
    eventInterface: 'Event',
    bubbles: true,
    cancelable: true
  },
  resize: {
    eventInterface: 'UIEvent',
    bubbles: false,
    cancelable: false
  },
  resourcetimingbufferfull: {
    eventInterface: 'Performance',
    bubbles: true,
    cancelable: true
  },
  result: {
    eventInterface: 'SpeechRecognitionEvent',
    bubbles: false,
    cancelable: false
  },
  resume: {
    eventInterface: 'SpeechSynthesisEvent',
    bubbles: false,
    cancelable: false
  },
  scroll: {
    eventInterface: 'UIEvent',
    bubbles: false,
    cancelable: false
  },
  seeked: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  seeking: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  select: {
    eventInterface: 'UIEvent',
    bubbles: true,
    cancelable: false
  },
  selectstart: {
    eventInterface: 'Event',
    bubbles: true,
    cancelable: true
  },
  selectionchange: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  show: {
    eventInterface: 'MouseEvent',
    bubbles: false,
    cancelable: false
  },
  slotchange: {
    eventInterface: 'Event',
    bubbles: true,
    cancelable: false
  },
  soundend: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  soundstart: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  speechend: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  speechstart: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  stalled: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  start: {
    eventInterface: 'SpeechSynthesisEvent',
    bubbles: false,
    cancelable: false
  },
  storage: {
    eventInterface: 'StorageEvent',
    bubbles: false,
    cancelable: false
  },
  submit: {
    eventInterface: 'Event',
    bubbles: true,
    cancelable: true
  },
  success: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  suspend: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  SVGAbort: {
    eventInterface: 'SVGEvent',
    bubbles: true,
    cancelable: false
  },
  SVGError: {
    eventInterface: 'SVGEvent',
    bubbles: true,
    cancelable: false
  },
  SVGLoad: {
    eventInterface: 'SVGEvent',
    bubbles: false,
    cancelable: false
  },
  SVGResize: {
    eventInterface: 'SVGEvent',
    bubbles: true,
    cancelable: false
  },
  SVGScroll: {
    eventInterface: 'SVGEvent',
    bubbles: true,
    cancelable: false
  },
  SVGUnload: {
    eventInterface: 'SVGEvent',
    bubbles: false,
    cancelable: false
  },
  SVGZoom: {
    eventInterface: 'SVGZoomEvent',
    bubbles: true,
    cancelable: false
  },
  timeout: {
    eventInterface: 'ProgressEvent',
    bubbles: false,
    cancelable: false
  },
  timeupdate: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  touchcancel: {
    eventInterface: 'TouchEvent',
    bubbles: true,
    cancelable: false
  },
  touchend: {
    eventInterface: 'TouchEvent',
    bubbles: true,
    cancelable: true
  },
  touchmove: {
    eventInterface: 'TouchEvent',
    bubbles: true,
    cancelable: true
  },
  touchstart: {
    eventInterface: 'TouchEvent',
    bubbles: true,
    cancelable: true
  },
  transitionend: {
    eventInterface: 'TransitionEvent',
    bubbles: true,
    cancelable: true
  },
  unload: {
    eventInterface: 'UIEvent',
    bubbles: false,
    cancelable: false
  },
  updateready: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  userproximity: {
    eventInterface: 'UserProximityEvent',
    bubbles: false,
    cancelable: false
  },
  voiceschanged: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  visibilitychange: {
    eventInterface: 'Event',
    bubbles: true,
    cancelable: false
  },
  volumechange: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  waiting: {
    eventInterface: 'Event',
    bubbles: false,
    cancelable: false
  },
  wheel: {
    eventInterface: 'WheelEvent',
    bubbles: true,
    cancelable: true
  }
} as const

export default domEvents as Record<DomEventName, DomEvent>
