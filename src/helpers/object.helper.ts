import {ObjectLiteral} from "../typings/shared.type";

export const pickKeys = (obj: ObjectLiteral, keys: string[]): ObjectLiteral => {
    return Object.fromEntries(
        keys
            .map(key => key in obj ? [key, obj[key]] : [])
            .filter(el => el.length)
    );
};
