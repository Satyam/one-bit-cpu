export const keywords = {
  halt: {
    bitCode: '00000000',
  },
  not: {
    bitCode: '00000100',
  },
  zero: {
    bitCode: '00001000',
  },
  one: {
    bitCode: '00001100',
  },
  ret: {
    bitCode: '00010000',
    // This is a special case instruction which needs a second cycle to complete
    // even though there is no actual extra parameter
    extra: true,
  },
  // this is the extra instruction to complete the RET.
  // The assembler inserts it automatically
  _ret2: {
    bitCode: '00010100',
  },
  in: {
    bitCode: '00100100',
  },
  innext: {
    bitCode: '00101000',
  },
  inprev: {
    bitCode: '00101100',
  },
  out: {
    bitCode: '00110100',
  },
  outnext: {
    bitCode: '00111000',
  },
  outprev: {
    bitCode: '00111100',
  },
  infrom: {
    bitCode: '01000',
    argLen: 3,
    extra: true,
  },
  outto: {
    bitCode: '01001',
    argLen: 3,
    extra: true,
  },
  call: {
    bitCode: '0101',
    argLen: 4,
    extra: true,
  },
  jmpt: {
    bitCode: '0110',
    argLen: 4,
    extra: true,
  },
  jmp: {
    bitCode: '0111',
    argLen: 4,
    extra: true,
  },

  and: {
    bitCode: '100',
    argLen: 5,
  },
  or: {
    bitCode: '101',
    argLen: 5,
  },
  load: {
    bitCode: '110',
    argLen: 5,
  },
  save: {
    bitCode: '111',
    argLen: 5,
  },
};

export default keywords;
