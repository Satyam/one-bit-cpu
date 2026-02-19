export const keywords = {
  and: {
    bitCode: '000',
    argLen: 5,
  },
  or: {
    bitCode: '001',
    argLen: 5,
  },
  load: {
    bitCode: '010',
    argLen: 5,
  },
  save: {
    bitCode: '011',
    argLen: 5,
  },
  not: {
    bitCode: '10000000',
  },
  zero: {
    bitCode: '10001000',
  },
  one: {
    bitCode: '10001100',
  },
  ret: {
    bitCode: '10010000',
    // This is a special case instruction which needs a second cycle to complete
    // even though there is no actual extra parameter
    extra: true,
  },
  // this is the extra instruction to complete the RET.
  // The assembler inserts it automatically
  _ret2: {
    bitCode: '10010100',
  },
  halt: {
    bitCode: '10011000',
  },
  out: {
    bitCode: '10100000',
  },
  outnext: {
    bitCode: '10101000',
  },
  outprev: {
    bitCode: '10101100',
  },
  in: {
    bitCode: '10110000',
  },
  innext: {
    bitCode: '10111000',
  },
  inprev: {
    bitCode: '10111100',
  },
  infrom: {
    bitCode: '11000',
    argLen: 3,
    extra: true,
  },
  outto: {
    bitCode: '11001',
    argLen: 3,
    extra: true,
  },
  call: {
    bitCode: '1101',
    argLen: 4,
    extra: true,
  },
  jmpt: {
    bitCode: '1110',
    argLen: 4,
    extra: true,
  },
  jmp: {
    bitCode: '1111',
    argLen: 4,
    extra: true,
  },
};

export default keywords;
