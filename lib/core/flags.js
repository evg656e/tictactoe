export function testFlag(value, flag) {
    return (value & flag) === flag && (flag !== 0 || value === flag);
}

export function setFlag(value, flag, on) {
    return on ? (value | flag) : (value & ~flag);
}
