import { test } from 'tape';
import { transform } from 'babel-core';
import plugin from '../src';

function clean ([ code ]) {
	return code.replace(/\n\s*/g, '');
}

function run (code) {
	return clean([
		transform(code, {
			plugins: [
				'syntax-decorators',
				plugin,
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
	const output = run(input);
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
	const output = run(input);
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
	const output = run(input);
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
