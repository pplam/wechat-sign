export default (opts) => {
  const template = String(opts.template)
  const data = opts.data
  const pattern = opts.pattern || /#\{([^}]*)\}/mg
  const trim = String.trim ||
    function trim(str) { return str.replace(/^\s+|\s+$/g, '') }
  return template.replace(pattern, (value, name) => {
    value = data[trim(name)]
    return value === undefined ? '' : value
  })
}
