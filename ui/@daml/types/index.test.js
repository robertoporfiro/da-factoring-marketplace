"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Copyright (c) 2020 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
var index_1 = require("./index");
describe('@daml/types', function () {
    it('optional', function () {
        var dict = index_1.Optional(index_1.Text);
        expect(dict.decoder.run(null).ok).toBe(true);
        expect(dict.decoder.run('X').ok).toBe(true);
        expect(dict.decoder.run([]).ok).toBe(false);
        expect(dict.decoder.run(['X']).ok).toBe(false);
    });
    it('nested optionals', function () {
        var dict = index_1.Optional(index_1.Optional(index_1.Text));
        expect(dict.decoder.run(null).ok).toBe(true);
        expect(dict.decoder.run([]).ok).toBe(true);
        expect(dict.decoder.run(['X']).ok).toBe(true);
        expect(dict.decoder.run('X').ok).toBe(false);
        expect(dict.decoder.run([['X']]).ok).toBe(false);
        expect(dict.decoder.run([[]]).ok).toBe(false);
        expect(dict.decoder.run([null]).ok).toBe(false);
    });
});
test('memo', function () {
    var x = 0;
    var f = index_1.memo(function () {
        x += 1;
        return x;
    });
    expect(f()).toBe(1);
    expect(f()).toBe(1);
    expect(x).toBe(1);
});
//# sourceMappingURL=index.test.js.map