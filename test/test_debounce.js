import assert from 'assert';
import debounce from 'lodash/debounce';

describe('debounce', function() {
    it('debounce', function(done) {
        let clickCount = 0;
        function click() {
            clickCount++;
            assert.strictEqual(clickCount, 1);
            done();
        }

        let debouncedClick = debounce(click);

        debouncedClick();
        debouncedClick();
        debouncedClick();
        assert.strictEqual(clickCount, 0);
    });

    it('debounce cancel', function(done) {
        const delay = 10;

        function click() {
            done(new Error('Function click() should not be called.'));
        }

        let debouncedClick = debounce(click, delay);

        debouncedClick();
        debouncedClick();
        debouncedClick();
        debouncedClick.cancel();

        setTimeout(function() {
            done();
        }, delay*2);
    });
});
