
/**
 * Finds a constructor method in class body.
 * @param {Object} node Class body nodes.
 * @return {Object} Constructor method node.
 */
function getCtorNode (node) {
	return node.body.body.find((def) => def.kind === 'constructor');
}

/**
 * Returns a list of method parameter names.
 * @param {Object} node Node to get parameter names from.
 * @param {Object} babel.types babel-types
 */
function getMethodParamNames (node, t) {
	return node.params
		// ignore rest parameter
		.filter((param) => t.isIdentifier(param))
		.map((param) => param.name);
}

/**
 * Babel plugin to automatically annotate functions for Angular dependency injection.
 * @param {Object} babel The current babel object.
 * @param {Object} babel.types babel-types
 * @return {Object} Babel visitor.
 */
export default function ({ types: t }) {
	const classVisitor = (path, { opts: { decoratorNames = [] } }) => {
		if (!path.node.decorators) {
			return;
		}

		const usedDecoratorNames = path.node.decorators
			.filter((decorator) => decorator.expression.callee)
			.map((decorator) => decorator.expression.callee.name);

		const hasDecorator = usedDecoratorNames.some((name) => decoratorNames.includes(name));

		if (!hasDecorator) {
			return;
		}

		const ctorNode = getCtorNode(path.node);

		if (!ctorNode) {
			return;
		}

		const paramNames = getMethodParamNames(ctorNode, t);

		if (!paramNames.length) {
			return;
		}

		// Create `$inject` property, e.g. `Foo.$inject = ['bar', 'baz];`
		const injectExp = t.expressionStatement(
			t.assignmentExpression(
				'=',
				t.memberExpression(
					t.identifier(path.node.id.name),
					t.identifier('$inject'),
				),
				t.arrayExpression(paramNames.map((name) => t.stringLiteral(name)))
			)
		);

		// append to parent node if class is "default-exported"
		if (path.parentPath.type === 'ExportDefaultDeclaration') {
			path.parentPath.insertAfter(injectExp);
		}
		else {
			path.insertAfter(injectExp);
		}
	};

	return {
		visitor: {
			ClassDeclaration: classVisitor,
		},
	};
}
