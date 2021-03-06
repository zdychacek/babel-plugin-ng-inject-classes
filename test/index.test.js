import { test } from 'tape';
import { transform } from 'babel-core';
import plugin from '../src';

function clean ([ code ]) {
	return code.replace(/\n\s*/g, '');
}

function run (code, decoratorNames) {
	return clean([
		transform(code, {
			plugins: [
				'syntax-decorators',
				[ plugin, { decoratorNames } ],
			],
		}).code,
	]);
}

test('it should inject when @Component decorator is present', (t) => {
	const input = clean`
		@Component('foo')
		class Foo {
			constructor($timeout, $element) {}
		}
	`;
	const output = run(input, [ 'Component' ]);
	const expected = clean`
		@Component('foo')
		class Foo {
			constructor($timeout, $element) {}
		}
		Foo.$inject = [\'$timeout\', \'$element\'];
	`;

	t.equal(output, expected);
	t.end();
});

test('it should not inject when @Controller decorator is present and constructor is missing', (t) => {
	const input = clean`
		@Controller('foo')
		class Foo {}
	`;
	const output = run(input, [ 'Controller' ]);
	const expected = clean`
		@Controller('foo')
		class Foo {}
	`;

	t.equal(output, expected);
	t.end();
});

test('it should inject when @Directive decorator is present and class is exported as default export', (t) => {
	const input = clean`
		@Directive('foo')
		export default class Foo {
			constructor($timeout, $element) {}
		}
	`;
	const output = run(input, [ 'Directive' ]);
	const expected = clean`
		export default @Directive('foo')
		class Foo {
			constructor($timeout, $element) {}
		}
		Foo.$inject = [\'$timeout\', \'$element\'];
	`;

	t.equal(output, expected);
	t.end();
});

test('it should not inject when decorator is not present', (t) => {
	const input = clean`
		class Foo {
			constructor($timeout, $element) {}
		}
	`;
	const output = run(input);
	const expected = clean`
		class Foo {
			constructor($timeout, $element) {}
		}
	`;

	t.equal(output, expected);
	t.end();
});

test('it should not inject when @Component decorator is present but constructor has a rest argument', (t) => {
	const input = clean`
		@Component()
		class Foo {
			constructor(...args) {}
		}
	`;
	const output = run(input, [ 'Component' ]);
	const expected = clean`
		@Component()
		class Foo {
			constructor(...args) {}
		}
	`;

	t.equal(output, expected);
	t.end();
});

test('it should not inject when @Component decorator is present and plugin has not `decoratorNames` optio  specified', (t) => { // eslint-disable-line max-len
	const input = clean`
		@Component()
		class Foo {
			constructor(foo) {}
		}
	`;
	const output = run(input);
	const expected = clean`
		@Component()
		class Foo {
			constructor(foo) {}
		}
	`;

	t.equal(output, expected);
	t.end();
});
