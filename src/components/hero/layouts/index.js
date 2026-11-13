// The two maps, for the components: wide from 1200px, medium from 768px,
// and none on phones (October 14). The pure modules (graph.js, layout.js)
// take a layout as an argument instead of importing these, so Node's test
// runner can read the JSON without a bundler.
import wide from './wide.json'
import medium from './medium.json'

export const LAYOUTS = { wide, medium }
