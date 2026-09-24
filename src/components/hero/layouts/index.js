// The two maps, for the components. The pure modules (graph.js, layout.js)
// take a layout as an argument instead of importing these, so Node's test
// runner can read the JSON without a bundler.
import wide from './wide.json'
import compact from './compact.json'

export const LAYOUTS = { wide, compact }
