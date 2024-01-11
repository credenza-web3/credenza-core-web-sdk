const path = require('path')

const TAGS = {
  LATEST: 'latest',
  ALPHA: 'alpha',
  BETA: 'beta',
  RC: 'rc',
}

const run = () => {
  const args = process.argv.slice(2)
  if (!args[0]) throw new Error('Invalid path')

  const { version } = require(path.resolve(__dirname, args[0], 'package.json'))
  const tagWithVersion = version.split('-')[1]
  let tag
  if (!tagWithVersion) {
    tag = TAGS.LATEST
  } else {
    tag = tagWithVersion.split('.')[0]
  }
  if (!Object.values(TAGS).includes(tag)) throw new Error('Invalid tag')

  console.log(tag)
}

run()
