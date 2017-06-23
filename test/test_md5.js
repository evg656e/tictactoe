import assert from 'assert';
import md5 from '../lib/md5.js';

describe('md5', function() {
    it('md5', function() {
        [
            { input: '', result: 'd41d8cd98f00b204e9800998ecf8427e' },
            { input: 'hello', result: '5d41402abc4b2a76b9719d911017c592' },
            { input: 'проверка', result: 'c12f955c059aa2bc61bb0b66eb01cfd1' }, // should it be 'c12f955c059aa2bc61bb0b66eb01cfd1' or '2f2dc227432698c5d9c40f972daf67d9'?
            { input: 'The quick brown fox jumps over the lazy dog.', result: 'e4d909c290d0fb1ca068ffaddf22cbd0' }
        ].forEach(function(data) {
            assert.strictEqual(md5(data.input), data.result);
        });
    });
});
