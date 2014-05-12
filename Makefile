TESTS = test/*.test.js
REPORTER = spec
TIMEOUT = 10000

test:
	./node_modules/mocha/bin/mocha -R $(REPORTER) -t $(TIMEOUT) $(TESTS)

.PHONY: test