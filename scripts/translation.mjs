#!/usr/bin/env node
/**
 * Tracks which commit of the English docs each translation is synced to.
 * Replaces the `v-translation` CLI of vitepress-translation-helper
 * (https://github.com/vuejs-translations/vitepress-translation-helper, MIT).
 *
 * Usage:
 *   node scripts/translation.mjs status [<locale>] [--status-file=<file>]
 *   node scripts/translation.mjs compare <locale> [<commit>] [--status-file=<file>] [--path=<path>...]
 *   node scripts/translation.mjs update <locale> [<commit>] [--status-file=<file>]
 *
 * <commit> defaults to `main`. `--path` can be repeated, or given as a
 * comma-separated list, optionally wrapped in braces: `--path={a,b}`.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { parseArgs } from 'node:util'

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    'status-file': {
      type: 'string',
      short: 's',
      default: 'docs/.vitepress/translation-status.json'
    },
    path: { type: 'string', short: 'p', multiple: true },
    help: { type: 'boolean', short: 'h' }
  }
})

const [command, locale, commit = 'main'] = positionals
const statusFile = values['status-file']

const git = args => {
  try {
    return execFileSync('git', args, {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe']
    })
  } catch (e) {
    console.error(`❌ git ${args[0]} failed: ${String(e.stderr).trim()}`)
    process.exit(1)
  }
}

const readStatus = () => {
  try {
    return JSON.parse(readFileSync(statusFile, 'utf8'))
  } catch {
    return {}
  }
}

const requireLocale = () => {
  if (!locale) {
    console.error(`Please specify a locale to ${command}.`)
    process.exit(1)
  }
}

if (command === 'status') {
  const status = readStatus()
  for (const name of locale ? [locale] : Object.keys(status)) {
    if (!status[name]) {
      console.log(`No docs(${name}) checkpoint found.`)
      continue
    }
    const { hash, date } = status[name]
    console.log(`The last checkpoint of docs(${name}) is "${hash}" (${date}).`)
  }
} else if (command === 'compare') {
  requireLocale()
  const hash = readStatus()[locale]?.hash
  if (!hash) {
    console.log(`No docs(${locale}) checkpoint found.`)
    process.exit(0)
  }
  const paths = (values.path ?? ['.']).flatMap(p =>
    p.replace(/^\{(.*)\}$/, '$1').split(',')
  )
  console.log(`The last checkpoint of docs(${locale}) is "${hash}".\n`)
  console.log(git(['diff', `${hash}..${commit}`, '--', ...paths]))
} else if (command === 'update') {
  requireLocale()
  const [hash, date] = git(['log', commit, '-n', '1', '--format=%h%x00%aI'])
    .trim()
    .split('\0')
  const status = readStatus()
  status[locale] = { hash, date: new Date(date).toISOString().slice(0, 10) }
  writeFileSync(statusFile, JSON.stringify(status, null, 2) + '\n')
  console.log(`✅ Updated ${locale} to "${hash}" (${status[locale].date})`)
} else {
  console.log(
    'Usage: node scripts/translation.mjs <status|compare|update> [<locale>] [<commit>] [--status-file=<file>] [--path=<path>]'
  )
  process.exit(values.help ? 0 : 1)
}
