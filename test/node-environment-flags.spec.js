'use strict';

const original = process.allowedNodeEnvironmentFlags;
const nodeEnvironmentFlags = require('..');
const getPolyfill = require('../polyfill');
const getShim = require('../shim');
const semver = require('semver');
const expect = require('unexpected').clone();
const flags = require('../flags.json');

describe('node-environment-flags', function() {
  if (semver.satisfies(process.version, '>= 10.10.0')) {
    describe('in Node.js versions >= 10.10.0', function() {
      describe('polyfill', function() {
        let polyfill;
        beforeEach(function() {
          polyfill = getPolyfill();
        });
        it('should return the `process.allowedNodeEnvironmentFlags` object', function() {
          expect(polyfill, 'to be', process.allowedNodeEnvironmentFlags);
        });

        it('should not replace the original object', function() {
          expect(process.allowedNodeEnvironmentFlags, 'to be', original);
        });
      });

      describe('shim', function() {
        let shim;

        beforeEach(function() {
          shim = getShim();
        });

        it('should return the `process.allowedNodeEnvironmentFlags` object', function() {
          expect(shim, 'to be', process.allowedNodeEnvironmentFlags);
        });

        it('should not replace the original object', function() {
          expect(process.allowedNodeEnvironmentFlags, 'to be', original);
        });
      });

      describe('module', function() {
        it('should be the polyfill', function() {
          expect(nodeEnvironmentFlags, 'to be', getPolyfill());
        });

        it('should be the shim', function() {
          expect(nodeEnvironmentFlags, 'to be', getShim());
        });
      });
    });
  } else {
    describe('in Node.js versions < 10.10.0', function() {
      let impl;
      describe('polyfill', function() {
        beforeEach(function() {
          impl = getPolyfill();
        });

        it('should not modify `process` built-in', function() {
          expect(process.allowedNodeEnvironmentFlags, 'to be undefined');
        });

        it('should return a Set-like object', function() {
          expect(impl, 'to be a', Set);
        });

        it('should be frozen', function() {
          expect(Object.isFrozen(impl), 'to be true');
        });

        describe('object prototype', function() {
          it('should be frozen', function() {
            expect(Object.isFrozen(Object.getPrototypeOf(impl)), 'to be true');
          });

          describe('constructor', function() {
            it('should be frozen', function() {
              expect(
                Object.isFrozen(Object.getPrototypeOf(impl).constructor),
                'to be true'
              );
            });
          });
        });

        describe('elements', function() {
          it('should contain all canonical flags for its Node.js version', function() {
            const setFlags = Array.from(impl).sort();
            const jsonFlags = Object.keys(flags)
              .reduce(
                (acc, range) =>
                  acc ||
                  (semver.satisfies(process.version, range)
                    ? flags[range]
                    : acc),
                null
              )
              .sort();
            expect(setFlags, 'to equal', jsonFlags);
          });
        });

        describe('method', function() {
          describe('add()', function() {
            it('should not add anything to the Set', function() {
              impl.add('foo');
              expect(impl.has('foo'), 'to be false');
            });

            it('should return the Set', function() {
              expect(impl.add('bar'), 'to be', impl);
            });
          });

          describe('delete()', function() {
            it('should not delete anything from the Set', function() {
              impl.delete('-r');
              expect(impl.has('-r'), 'to be true');
            });

            it('should return false', function() {
              expect(impl.delete('-r'), 'to be false');
            });
          });

          describe('clear()', function() {
            it('should not clear the Set', function() {
              impl.clear();
              expect(impl.size, 'to be greater than', 0);
            });
          });
        });
      });
    });
  }
});
