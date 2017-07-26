const DECORATORS = [ 'Component', 'Directive', 'Controller', 'Service', 'Filter' ];

function getCtorNode (node) {
	return node.body.body.find((def) => def.kind === 'constructor');
}

function getMethodParamNames (node, t) {
	return node.params
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
	const classVisitor = (path) => {
		if (!path.node.decorators) {
			return;
		}

		const decoratorNames = path.node.decorators
			.filter((decorator) => decorator.expression.callee)
			.map((decorator) => decorator.expression.callee.name);

		const hasDecorator = decoratorNames.some((name) => DECORATORS.includes(name));

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

		const injectExp = t.expressionStatement(
			t.assignmentExpression(
				'=',
				t.memberExpression(
					t.identifier(path.node.id.name),
					t.identifier('$inject')
				),
				t.arrayExpression(paramNames.map((name) => t.stringLiteral(name)))
			)
		);

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
