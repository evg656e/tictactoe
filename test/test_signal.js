import assert from 'assert';
import signal from '../lib/signal.js';

describe('signal', function() {
    it('signal', function() {
        let clickCount = 0;
        function clicked() {
            clickCount++;
        }

        let initialized = false;
        function init() {
            initialized = !initialized;
        }

        let widget = {
            clickCount: 0,
            clicked: function() {
                this.clickCount++;
            }
        };

        let widgetClicked = widget.clicked.bind(widget);

        let click = signal();

        assert.strictEqual(click.slotCount(), 0);

        click.once(init);
        click.connect(clicked);
        click.connect(widgetClicked);

        assert.strictEqual(click.slotCount(), 3);

        click();

        assert.strictEqual(click.slotCount(), 2);

        assert.ok(initialized);
        assert.strictEqual(clickCount, 1);
        assert.strictEqual(widget.clickCount, 1);
        click();

        assert.ok(initialized);
        assert.strictEqual(clickCount, 2);
        assert.strictEqual(widget.clickCount, 2);

        click.disconnect(clicked);

        assert.strictEqual(click.slotCount(), 1);

        click();

        assert.strictEqual(clickCount, 2);
        assert.strictEqual(widget.clickCount, 3);

        click.disconnect(widgetClicked);

        assert.strictEqual(click.slotCount(), 0);

        click();

        assert.strictEqual(clickCount, 2);
        assert.strictEqual(widget.clickCount, 3);

        click.connect(clicked);

        assert.strictEqual(click.slotCount(), 1);

        click();

        assert.strictEqual(clickCount, 3);

        click.disconnectAll();

        assert.strictEqual(click.slotCount(), 0);

        click();

        assert.strictEqual(clickCount, 3);
    });

    it('signal async', function(done) {
        function callLater(fn, delay) {
            return function(...args) {
                setTimeout(function() {
                    fn.apply(null, args);
                }, delay);
            };
        }

        const phrases = ['Hello John', 'Hola John'];
        const delay = 50;

        let count = phrases.length;
        let greet = signal();

        greet.connect(callLater(function(phrase, index) {
            assert.equal(phrase, phrases[index]);
            if (--count === 0)
                done();
        }, delay));

        phrases.forEach(function(phrase, index) {
            greet(phrases[0], 0);
            greet(phrases[1], 1);
        });
    });
});
