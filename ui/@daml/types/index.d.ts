import * as jtv from '@mojotech/json-type-validation';
/**
 * Interface for companion objects of serializable types. Its main purpose is
 * to describe the JSON encoding of values of the serializable type.
 *
 * @typeparam T The template type.
 */
export interface Serializable<T> {
    /**
     * @internal The decoder for a contract of template T.
     */
    decoder: jtv.Decoder<T>;
}
/**
 * Interface for objects representing DAML templates. It is similar to the
 * `Template` type class in DAML.
 *
 * @typeparam T The template type.
 * @typeparam K The contract key type.
 * @typeparam I The contract id type.
 *
 */
export interface Template<T extends object, K = unknown, I extends string = string> extends Serializable<T> {
    templateId: I;
    /**
     * @internal
     */
    keyDecoder: jtv.Decoder<K>;
    Archive: Choice<T, {}, {}, K>;
}
/**
 * Interface for objects representing DAML choices.
 *
 * @typeparam T The template type.
 * @typeparam K The contract key type.
 * @typeparam C The choice type.
 * @typeparam R The choice return type.
 *
 */
export interface Choice<T extends object, C, R, K = unknown> {
    /**
     * Returns the template to which this choice belongs.
     */
    template: () => Template<T, K>;
    /**
     * @internal Returns a decoder to decode the choice arguments.
     */
    argumentDecoder: jtv.Decoder<C>;
    /**
     * @internal Returns a deocoder to decode the return value.
     */
    resultDecoder: jtv.Decoder<R>;
    /**
     * The choice name.
     */
    choiceName: string;
}
/**
 * @internal
 */
export declare const registerTemplate: <T extends object>(template: Template<T, unknown, string>) => void;
/**
 * @internal
 */
export declare const lookupTemplate: (templateId: string) => Template<object, unknown, string>;
/**
 * @internal Turn a thunk into a memoized version of itself. The memoized thunk
 * invokes the original thunk only on its first invocation and caches the result
 * for later uses. We use this to implement a version of `jtv.lazy` with
 * memoization.
 */
export declare function memo<A>(thunk: () => A): () => A;
/**
 * @internal Variation of `jtv.lazy` which memoizes the computed decoder on its
 * first invocation.
 */
export declare function lazyMemo<A>(mkDecoder: () => jtv.Decoder<A>): jtv.Decoder<A>;
/**
 * The counterpart of DAML's `()` type.
 */
export interface Unit {
}
/**
 * Companion obect of the [[Unit]] type.
 */
export declare const Unit: Serializable<Unit>;
/**
 * The counterpart of DAML's `Bool` type.
 */
export declare type Bool = boolean;
/**
 * Companion object of the [[Bool]] type.
 */
export declare const Bool: Serializable<Bool>;
/**
 * The counterpart of DAML's `Int` type.
 *
 * We represent `Int`s as string in order to avoid a loss of precision.
 */
export declare type Int = string;
/**
 * Companion object of the [[Int]] type.
 */
export declare const Int: Serializable<Int>;
/**
 * The counterpart of DAML's `Numeric` type.
 *
 * We represent `Numeric`s as string in order to avoid a loss of precision. The string must match
 * the regular expression `-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?`.
 */
export declare type Numeric = string;
/**
 * The counterpart of DAML's Decimal type.
 *
 * In DAML, Decimal's are the same as Numeric with precision 10.
 *
 */
export declare type Decimal = Numeric;
/**
 * Companion function of the [[Numeric]] type.
 */
export declare const Numeric: (_: number) => Serializable<string>;
/**
 * Companion object of the [[Decimal]] type.
 */
export declare const Decimal: Serializable<Decimal>;
/**
 * The counterpart of DAML's `Text` type.
 */
export declare type Text = string;
/**
 * Companion object of the [[Text]] type.
 */
export declare const Text: Serializable<Text>;
/**
 * The counterpart of DAML's `Time` type.
 *
 * We represent `Times`s as strings with format `YYYY-MM-DDThh:mm:ss[.ssssss]Z`.
 */
export declare type Time = string;
/**
 * Companion object of the [[Time]] type.
 */
export declare const Time: Serializable<Time>;
/**
 * The counterpart of DAML's `Party` type.
 *
 * We represent `Party`s as strings matching the regular expression `[A-Za-z0-9:_\- ]+`.
 */
export declare type Party = string;
/**
 * Companion object of the [[Party]] type.
 */
export declare const Party: Serializable<Party>;
/**
 * The counterpart of DAML's `[T]` list type.
 *
 * We represent lists using arrays.
 *
 * @typeparam T The type of the list values.
 */
export declare type List<T> = T[];
/**
 * Companion object of the [[List]] type.
 */
export declare const List: <T>(t: Serializable<T>) => Serializable<T[]>;
/**
 * The counterpart of DAML's `Date` type.
 *
 * We represent `Date`s as strings with format `YYYY-MM-DD`.
 */
export declare type Date = string;
/**
 * Companion object of the [[Date]] type.
 */
export declare const Date: Serializable<Date>;
/**
 * Used to `brand` [[ContractId]].
 */
declare const ContractIdBrand: unique symbol;
/**
 * The counterpart of DAML's `ContractId T` type.
 *
 * We represent `ContractId`s as strings. Their exact format of these strings depends on the ledger
 * the DAML application is running on.
 *
 * The purpose of the intersection with `{ [ContractIdBrand]: T }` is to
 * prevent accidental use of a `ContractId<T>` when a `ContractId<U>` is
 * needed (unless `T` is a subtype of `U`). This technique is known as
 * "branding" in the TypeScript community.
 *
 * @typeparam T The contract template.
 */
export declare type ContractId<T> = string & {
    [ContractIdBrand]: T;
};
/**
 * Companion object of the [[ContractId]] type.
 */
export declare const ContractId: <T>(_t: Serializable<T>) => Serializable<ContractId<T>>;
/**
 * The counterpart of DAML's `Optional T` type.
 *
 * @typeparam T The type of the optionally present value.
 */
export declare type Optional<T> = null | T | OptionalInner<T>;
/**
 * Inner type of [[Optional]].
 */
declare type OptionalInner<T> = null extends T ? [] | [Exclude<T, null>] : T;
/**
 * Companion function of the [[Optional]] type.
 */
export declare const Optional: <T>(t: Serializable<T>) => Serializable<Optional<T>>;
/**
 * The counterpart of DAML's `TextMap T` type.
 *
 * We represent `TextMap`s as dictionaries.
 *
 * @typeparam T The type of the map values.
 */
export declare type TextMap<T> = {
    [key: string]: T;
};
/**
 * Companion object of the [[TextMap]] type.
 */
export declare const TextMap: <T>(t: Serializable<T>) => Serializable<TextMap<T>>;
export {};
