#!/usr/bin/env zx
import { keywords } from './keywords.mjs';

if (argv.h) {
  showHelp();
  process.exit(0);
}

const [inFile, outFile] = getFileNames();

// address values for the labels will be collected here
const labelValues = {};

// Various regular expressions

//  mostly for validation
const rxComment = /^\s*#/;
const rxLabel = /^[a-zA-Z]\w*$/;
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

// read the assembly code
const asmFile = await fs.readFile(inFile, 'utf8');
const asm = asmFile.split('\n');

if (firstPass(asm)) {
  console.error('Assembly canceled due to errors');
  process.exit(1);
}

const romImage = secondPass(asm);

if (romImage) {
  await fs.writeFile(outFile, romImage.join('\n'));
  console.log(`ROM image created in "${outFile}"`);
  process.exit(0);
}
process.exit(1);

function showHelp() {
  console.log(`Usage
  assembler [source] [options]
    
    Assembles the source file into a Logisim "v3.0 hex words addressed" format
    to load into the program ROM of the CPU.

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
    if (!path.extname) outFile = outFile + '.rom';
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
          default:
            // if it has a label store the instruction address
            if (label) labelValues[label] = address;
            // update the address
            address += keywords[instr].extra ? 2 : 1;
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
  const romImage = ['v3.0 hex words addressed'];

  asm.forEach((line, lineNum) => {
    // skip comments and empty lines
    if (rxComment.test(line) || !line.trim()) {
      romImage.push(line.trim());
    } else {
      try {
        // _label is not used in this step but it has to have a placeholder
        const { instr, arg } = parseLine(line);
        switch (instr) {
          case CONST:
            romImage.push(`           # [${lineNum + 1}]: ${line}`);
            break;
          case ORG:
            address = parseValue(arg);
            romImage.push(`           # [${lineNum + 1}]: ${line}`);
            break;
          default:
            const config = keywords[instr];

            // Convert the argument into a numeric value
            const argValue = readArg(arg, config);

            // get the actual bitcode
            let code = parseInt(config.bitCode, 2);

            // merge argument or part of it if it is a two byte instruction
            if (config.argLen) {
              code <<= config.argLen;
              code += config.extra ? argValue >>> 8 : argValue;
            }

            romImage.push(
              `${toHex(address)}: ${toHex(code)} ${
                config.extra ? toHex(argValue % 256) : '  '
              }  # [${lineNum + 1}]: ${line}`
            );
            address += config.extra ? 2 : 1;
        }
      } catch (err) {
        console.error(chalk.red(`[${lineNum + 1}]: ${err} in:\n      ${line}`));
        hasError = true;
      }
    }
  });
  return !hasError && romImage;
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
    if (!rxLabel.test(label)) throw new Error(`Invalid label "${label}"`);
    if (labelValues[label])
      throw new Error(`Duplicate definition of label "${label}"`);
  }
  if (!instr) throw new Error('Mising instruction');
  switch (instr) {
    case CONST:
      if (!arg) throw new Error(`Missing argument for "${instr}"`);
      if (!label) throw new Error(`Missing label for "${instr}"`);
      break;
    case ORG:
      if (!arg) throw new Error(`Missing argument for "${instr}"`);
      break;
    default:
      const config = keywords[instr];
      if (!config) throw new Error(`Unknown instruction "${instr}"`);
      if (config.argLen) {
        if (!arg) throw new Error(`Missing argument for "${instr}"`);
      } else {
        if (arg) throw new Error(`Unexpected argument "${arg}"`);
      }
      break;
  }
}

function readArg(arg, config) {
  if (!config.argLen) return 0;
  let value = parseValue(arg);

  if (value !== null) {
    // a match was found, now check for valid argument range
    const numBits = config.argLen + (config.extra ? 8 : 0);
    if (value >= 1 << numBits) {
      throw new Error(
        `Numeric argument "${arg}" (${value}) larger than ${(1 << numBits) - 1}`
      );
    }
    return value;
  }

  // It was not a number, perhaps it is a label?
  if (rxLabel.test(arg)) {
    value = labelValues[arg];
    if (Number.isInteger(value)) return value;
  }

  // wasn't a known label
  throw new Error(`Invalid argument value ${arg}`);
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
