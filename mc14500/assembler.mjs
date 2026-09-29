#!/usr/bin/env zx

if (argv.h) {
  showHelp();
  process.exit(0);
}

const [inFile, outFile] = getFileNames();

/* All instructions are 4bits and none has any operands 
(operands go into extra memory, ICU not involved).
The binary code is the same as the index in this table
*/
const keywords = [
  'nop0',
  'ld',
  'ldc',
  'and',
  'andc',
  'or',
  'orc',
  'xnor',
  'sto',
  'stoc',
  'ien',
  'oen',
  'jmp',
  'rtn',
  'skz',
  'nopf',
];

// address values for the labels will be collected here
const labelValues = {};

// Extra bits for operands.
// `extra` are bits tucked along the 4 bits of the opcode:
// `extra=4` means the memory is 8 bits wide with 4 bits for opcode and 4 bits for operand
// `extra=0` means the memory is 4 bits wide and only contains the opcode.
// In that case, `extra2=4` means a 4 bits operand goes in the address next to the opcode.
// Other example: `extra=2` and `extra2=6` would mean a program memory 6 bits wide (strange)
// with a 4 bit opCode and the two most significant bits of the operand and
// the 6 less significant digits in the next adddress for a total of 8 bit addresses
let extra = 0;
let extra2 = 0;

// Various regular expressions

//  mostly for validation
const rxComment = /^\s*#/;
const rxIdentifier = /^[a-zA-Z]\w*$/;
const rxAnySpaces = /\s+/;

// used to detect base used for number constants
const rxNumberBases = {
  2: /^0b([01]+)$/,
  8: /^0o([0-7]+)$/,
  16: /^0x([0-9a-fA-F]+)$/,
  10: /^(\d+)$/,
};

// Pseudo- instructions:
const CONST = 'const';
const ORG = 'org';
const EXTRA = 'extra';
const EXTRA2 = 'extra2';

// read the assembly code
const asmFile = await fs.readFile(inFile, 'utf8');
const asm = asmFile.split('\n');

if (firstPass(asm)) {
  console.error('Assembly canceled due to errors');
  process.exit(1);
}

const bytes = secondPass(asm);

if (bytes) {
  await fs.writeFile(
    outFile,
    Array.from(bytes, (b) => `0x${b ?? 0}`).join('\n')
  );
  console.log(`ROM image created in "${outFile}"`);
  process.exit(0);
}
process.exit(1);

function showHelp() {
  console.log(`Usage
  assembler [source] [options]
    
    Assembles the source file into a string of bytes
    to load into the program ROM.

  [source]  Name of the file containing the code to be assembled.
            If omitted "program.asm" will be used.
            If the extension is omitted, ".asm" will be appended to the given base name

  Options:
    -h             Shows this message and exits.
    -o <filename>  Name of the output assembled code in Logisim-compatible format.
                   If omitted, the base name of the source file will be used.
                   If no extension is given ".rom" will be appended.
  
  Examples:

    ./assembler

      It will assemble the file "program.asm" and produce "program.rom"

    ./assembler test

      Assembles "test.asm" into "test.rom"

    ./assembler test.txt

      Assembles "test.txt" into "test.rom"

    ./assembler -o something

      Assembles "program.asm" into "something.rom"

`);
}

function getFileNames() {
  const fileName = argv._[0] || 'program';

  let inFile;
  let outFile;

  if (path.extname(fileName)) {
    inFile = fileName;
    outFile = path.basename(fileName, path.extname(fileName)) + '.rom';
  } else {
    inFile = fileName + '.asm';
    outFile = fileName + '.rom';
  }

  if (argv.o) {
    outFile = argv.o;
    if (!path.extname(outFile)) outFile = outFile + '.rom';
  }
  return [inFile, outFile];
}

// First pass,
// * validate lines
// * collect addresses associated with labels
function firstPass(asm) {
  let address = 0;
  let hasError = false;

  asm.forEach((line, lineNum) => {
    // Skip comments or empty lines
    if (line.trim() && !rxComment.test(line)) {
      try {
        // parse line
        const { label, instr, arg, comment } = parseLine(line);
        // validate
        validateLine(label, instr, arg, comment);
        switch (instr) {
          case CONST: {
            const val = parseValue(arg);
            if (label && val !== null) {
              labelValues[label] = val;
            } else {
              throw new Error(`Invalid constant declaration`);
            }
            break;
          }
          case ORG:
            const val = parseValue(arg);
            if (val !== null) {
              address = val;
              if (label) labelValues[label] = address;
            } else {
              throw new Error(`Invalid constant declaration`);
            }
            break;
          case EXTRA:
            extra = parseValue(arg);
            break;
          case EXTRA2:
            extra2 = parseValue(arg);
            break;
          case '':
            if (label) labelValues[label] = address;
            break;
          default:
            // if it has a label store the instruction address
            if (label) labelValues[label] = address;
            // update the address
            address += extra2 ? 2 : 1;
            break;
        }
      } catch (err) {
        console.error(chalk.red(`[${lineNum + 1}]: ${err} in:\n      ${line}`));
        hasError = true;
      }
    }
  });
  return hasError;
}

// Second pass
// * generate code
function secondPass(asm) {
  let address = 0;
  let hasError = false;

  // output ROM image
  const bytes = [];

  function pushByte(byte) {
    if (typeof bytes[address] === 'undefined') {
      bytes[address] = byte;
    } else {
      throw new Error(`Overlapping code at location ${address}`);
    }
    address++;
  }

  asm.forEach((line, lineNum) => {
    // skip comments and empty lines
    if (rxComment.test(line) || !line.trim()) return;
    try {
      const { instr, arg } = parseLine(line);
      let code;
      switch (instr) {
        case CONST:
        case EXTRA:
        case EXTRA2:
        case '':
          break;
        case ORG:
          address = parseValue(arg);
          break;
        default:
          // get the actual bitcode
          code = keywords.indexOf(instr);

          // Convert the argument into a numeric value
          const argValue = readArg(arg);

          if (extra > 0) {
            code = (code << extra) + (argValue >> extra2);
          }
          pushByte(toHex(code));
          if (extra2 > 0) {
            pushByte(argValue & ((1 << extra2) - 1));
          }
      }
    } catch (err) {
      console.error(chalk.red(`[${lineNum + 1}]: ${err} in:\n      ${line}`));
      hasError = true;
    }
  });
  return !hasError && bytes;
}

function toHex(num) {
  return num.toString(16).padStart(2, '0');
}

function parseLine(line) {
  // split line in before and after the first comment
  const [before, ...after] = line.split('#');
  // rebuild the comments if there are any
  const comments = after.length ? '#' + after.join('#') : '';
  // split the label
  let [label, ...rest] = before.split(':');
  switch (rest.length) {
    case 0: // no label at all
      rest = label;
      label = '';
      break;
    case 1: // there is, indeed, a label
      rest = rest[0];
      break;
    default:
      throw new Error(`Too many colons`);
  }
  // split the instruction part
  const [instr, arg] = rest.trim().split(rxAnySpaces);
  // return parts.
  return {
    label: label.trim(),
    instr: instr.toLowerCase(),
    arg,
    comments,
  };
}

// validation
// the error messages explain what it is checking
function validateLine(label, instr, arg, comment) {
  if (comment && !rxComment.test(comment))
    throw new Error(`Extraneous text at end of instruction "${comment}"`);
  if (label) {
    if (!rxIdentifier.test(label)) throw new Error(`Invalid label "${label}"`);
    if (labelValues[label])
      throw new Error(`Duplicate definition of label "${label}"`);
  }
  switch (instr) {
    case CONST:
      if (!arg) throw new Error(`Missing argument for "${instr}"`);
      if (!label) throw new Error(`Missing label for "${instr}"`);
      break;
    case EXTRA:
    case EXTRA2:
    case ORG:
      if (!arg) throw new Error(`Missing argument for "${instr}"`);
      break;
    case '':
      if (!label) throw new Error('Mising instruction');
      break;
    default:
      if (!rxIdentifier.test(instr))
        throw new Error(`Invalid instruction "${instr}"`);
      if (!keywords.includes(instr))
        throw new Error(`Unknown instruction "${instr}"`);
      break;
  }
}

function readArg(arg) {
  if (typeof arg === 'undefined') return 0;
  let value = parseValue(arg);
  if (value !== null) {
    const numBits = extra + extra2;
    if (value >= 1 << numBits) {
      throw new Error(
        `Numeric argument "${arg}" (${value}) larger than ${(1 << numBits) - 1}`
      );
    }
    return value;
  }

  // It was not a number, perhaps it is a label?
  if (rxIdentifier.test(arg)) {
    value = labelValues[arg];
    if (Number.isInteger(value)) return value;
  }

  // wasn't a known label
  if (arg.length) throw new Error(`Invalid argument value ${arg}`);
}

function parseValue(arg) {
  // loop over the regular expressions to check for number base prefixes
  // and parse it accordingly if match
  if (arg) {
    for (const [base, rx] of Object.entries(rxNumberBases)) {
      const m = rx.exec(arg.trim());
      if (m) {
        const val = parseInt(m[1], base);
        if (!isNaN(val)) return val;
      }
    }
  }
  return null;
}
