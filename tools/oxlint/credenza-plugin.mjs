// Local oxlint JS plugin for project-specific conventions not covered by built-in oxlint rules.
const INTERFACE_PREFIX = /^I[A-Z]/

export default {
  meta: { name: 'credenza' },
  rules: {
    // Port of the former `@typescript-eslint/naming-convention` interface rule: interfaces must be `IPascalCase`.
    'interface-prefix': {
      meta: {
        type: 'suggestion',
        docs: { description: 'Require interface names to be prefixed with `I`' },
        messages: { prefix: "Interface name '{{name}}' must match /^I[A-Z]/" },
      },
      create(context) {
        return {
          TSInterfaceDeclaration(node) {
            const { name } = node.id
            if (!INTERFACE_PREFIX.test(name)) context.report({ node: node.id, messageId: 'prefix', data: { name } })
          },
        }
      },
    },
  },
}
