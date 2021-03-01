"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Copyright (c) 2020 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
var jtv = require("@mojotech/json-type-validation");
/**
 * @internal
 */
var registeredTemplates = {};
/**
 * @internal
 */
exports.registerTemplate = function (template) {
    var templateId = template.templateId;
    var oldTemplate = registeredTemplates[templateId];
    if (oldTemplate === undefined) {
        registeredTemplates[templateId] = template;
        console.debug("Registered template " + templateId + ".");
    }
    else {
        console.warn("Trying to re-register template " + templateId + ".");
    }
};
/**
 * @internal
 */
exports.lookupTemplate = function (templateId) {
    var template = registeredTemplates[templateId];
    if (template === undefined) {
        throw Error("Trying to look up template " + templateId + ".");
    }
    return template;
};
/**
 * @internal Turn a thunk into a memoized version of itself. The memoized thunk
 * invokes the original thunk only on its first invocation and caches the result
 * for later uses. We use this to implement a version of `jtv.lazy` with
 * memoization.
 */
function memo(thunk) {
    var memoized = function () {
        var cache = thunk();
        memoized = function () { return cache; };
        return cache;
    };
    // NOTE(MH): Since we change `memoized` when the resultung thunk is invoked
    // for the first time, we need to return it "by reference". Thus, we return
    // a closure which contains a reference to `memoized`.
    return function () { return memoized(); };
}
exports.memo = memo;
/**
 * @internal Variation of `jtv.lazy` which memoizes the computed decoder on its
 * first invocation.
 */
function lazyMemo(mkDecoder) {
    return jtv.lazy(memo(mkDecoder));
}
exports.lazyMemo = lazyMemo;
/**
 * Companion obect of the [[Unit]] type.
 */
exports.Unit = {
    decoder: jtv.object({}),
};
/**
 * Companion object of the [[Bool]] type.
 */
exports.Bool = {
    decoder: jtv.boolean(),
};
/**
 * Companion object of the [[Int]] type.
 */
exports.Int = {
    decoder: jtv.string(),
};
/**
 * Companion function of the [[Numeric]] type.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
exports.Numeric = function (_) {
    return ({
        decoder: jtv.string(),
    });
};
/**
 * Companion object of the [[Decimal]] type.
 */
exports.Decimal = exports.Numeric(10);
/**
 * Companion object of the [[Text]] type.
 */
exports.Text = {
    decoder: jtv.string(),
};
/**
 * Companion object of the [[Time]] type.
 */
exports.Time = {
    decoder: jtv.string(),
};
/**
 * Companion object of the [[Party]] type.
 */
exports.Party = {
    decoder: jtv.string(),
};
/**
 * Companion object of the [[List]] type.
 */
exports.List = function (t) { return ({
    decoder: jtv.array(t.decoder),
}); };
/**
 * Companion object of the [[Date]] type.
 */
exports.Date = {
    decoder: jtv.string(),
};
/**
 * Used to `brand` [[ContractId]].
 */
var ContractIdBrand = Symbol();
/**
 * Companion object of the [[ContractId]] type.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
exports.ContractId = function (_t) { return ({
    decoder: jtv.string(),
}); };
/**
 * This class does the actual work behind the [[Optional]] companion function.  In addition to
 * implementing the [[Serializable]] interface it also stores the [[Serializable]] instance of the
 * payload of the [[Optional]] and uses it to provide a decoder for the [[OptionalInner]] type.
 *
 * @typeparam T The type of the optionally present value.
 */
var OptionalWorker = /** @class */ (function () {
    function OptionalWorker(payload) {
        if (payload instanceof OptionalWorker) {
            var payloadInnerDecoder = payload.innerDecoder;
            this.innerDecoder = jtv.oneOf(jtv.constant([]), jtv.tuple([payloadInnerDecoder]));
        }
        else {
            // NOTE(MH): `T` is not of the form `Optional<U>` here and hence `null`
            // does not extend `T`. Thus, `OptionalInner<T> = T`.
            this.innerDecoder = payload.decoder;
        }
        this.decoder = jtv.oneOf(jtv.constant(null), this.innerDecoder);
    }
    return OptionalWorker;
}());
/**
 * Companion function of the [[Optional]] type.
 */
exports.Optional = function (t) {
    return new OptionalWorker(t);
};
/**
 * Companion object of the [[TextMap]] type.
 */
exports.TextMap = function (t) { return ({
    decoder: jtv.dict(t.decoder),
}); };
// TODO(MH): `Map` type.
//# sourceMappingURL=index.js.map