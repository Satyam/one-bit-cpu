# One bit CPU

An exercise in the design of a simple 1 bit CPU.   With only logical single-bit operations available the complexity is much reduced and it still has all it needs to have to be a Turing Complete computer. After all, a Turing Machine is a one bit computer.

It uses [Logisim-evolution](https://github.com/logisim-evolution/logisim-evolution) digital circuit design and simulation package.

## Hardware


## Instruction set

The CPU has one accumulator `Acc` which stores a single bit and is often the implied source or destination of many of the instructions.

There are 32 internal registers `Reg` each storing one bit.  They are often used to store internal state and intermediate results.

The CPU can read or write a single bit into or from the `Acc` from or to any of 2048 addressable external locations or `Ports`.  It also has instructions to access successive contiguous `Ports`.

It can jump to any location in the 4096 addressable program memory, either unconditionally or depending on the value of the `Acc`.

The address spaces of `Ports`, `Regs` and executable instructions are totally separate.

It can jump to a subroutine at any location in program memory (`Call`) and resume where it left of with (`Ret`) later.  Calls can be nested up to 8 deep. 

Instructions are case insensitive.  Arguments, when indicated, are mandatory. They can be written in various bases:

* `nnn`: (no prefix) decimal
* `0bnnn`: binary
* `0onnn`: octal
* `0xnnn`: hexadecimal

Arguments can use constants defined with the `Const` pseudo-instruction, as described later.

All instructions take 1 byte except those that have either a `Port Addr` or `Inst Addr` as an argument which take two bytes.


| Instruction | Argument  | Description                                                                     |
| ----------- | --------- | ------------------------------------------------------------------------------- |
| And         | Reg       | Logical `And` of `Acc` with bit in given register                               |
| Or          | Reg       | Logical `Or` of `Acc` with bit in given register                                |
| Load        | Reg       | Load `Acc` with bit in given register                                           |
| Save        | Reg       | Save `Acc` in given register                                                    |
| Not         |           | Invert bit in `Acc`                                                             |
| Zero        |           | Load a 0 in the `Acc`                                                           |
| One         |           | Load a 1 in the `Acc`                                                           |
| OutTo       | Port Addr | Output value at `Acc` to given port address                                     |
| Out         |           | Output value at `Acc` to port address previously set                            |
| OutInc      |           | Output value at `Acc` to the next port address. Leaves address incremented      |
| OutDec      |           | Output value at `Acc` to the previous port address. Leaves address decremented  |
| InFrom      | Port Addr | Input value to `Acc` from given port address                                    |
| In          |           | Input value to `Acc` from port address previously set                           |
| InInc       |           | Input value to `Acc` from the next port address. Leaves address incremented     |
| InDec       |           | Input value to `Acc` from the previous port address. Leaves address decremented |
| Jmp         | Inst Addr | Jump to given instruction address                                               |
| JmpT        | Inst Addr | Jump to given instruction address if `Acc` is true                              |
| Call        | Inst Addr | Call subroutine at given instruction address                                    |
| Ret         |           | Return from subroutine call                                                     |
    
Where:		
* Reg is up to 31 or 0x1f		
* Port Addr is up to 2047 or 0x7ff		
* Inst Addr is up to 4095 or 0xfff		

## Assembler

The `assembler.mjs` script (symlinked to `as` for simplicity) can read files containing the instructions above and generate the binary code in a format suitable for `Logisim` to read. The assembler interprets lines of code containing the instructions listed above in a format quite popular with assemblers.

Each instruction should occupy one line. 

Empty lines are ignored.

Comments are preceded with the `#` character.  Anything in the line after the `#` character is ignored, though it is copied over as comment to the binary file for reference, where it is also ignored by `Logisim`.

A line of code follows this format:

```asm
[Label :] Instruction [Argument] [#Comments]
```

Bracketed elements are optional.  

The `Instruction` and `Argument` must be separated by at least one space. Other spaces are optional and multiple spaces count as one.  Tabs also count as spaces.   

#### Label

A `Label` marks a location that can be a destination of a `Jmp`, `JmpT` or `Call` instruction. 

It must be followed by a colon `:` separating it from the `Instruction`.  Spaces either before or after the `Label` itself are ignored. 

Labels, 

* must be unique, there can be no duplicates nor can they be redefined.
* are not needed. 
* must start with a letter and can be followed by any number of letters, digits or underscore. 
* are case sensitive and have no length limit. 
* can also be an alias for a value defined via the `Const` pseudo-instruction.
* do not need to be defined prior to their use.  

#### Instruction

An instruction is one of those listed in the table above, or one of the pseudo-instructions listed below.

Instructions are case insensitive.  Instructions that have arguments must be followed by at least one space

#### Argument

For those instructions that require an argument, it must be separated from the instruction by at least one space.

Arguments, if specified for the instruction, cannot be omitted.

Value arguments can be written in several bases using appropriate prefixes:

* `nnn`: (no prefix) decimal
* `0bnnn`: binary
* `0onnn`: octal
* `0xnnn`: hexadecimal

It is a good practice to use labels instead of plain values.  

#### Pseudo-instructions

##### `Const`

Allows the programmer to name a particular value, a *constant*,  which usually repressents a register or a port address so that it can be used as a mnemonic for a resource.  

`Const` requires both a label and an argument.

The assembler does not differentiate labels used for instructions from those defined with `Const`.  

##### `Org`

The assembler assumes the code starts at memory location 0, the default *origin*. If, for any reason, a piece of code needs to be located elsewhere, the `Org` pseudo-instruction can set the origin of the code from then on.  

`Org` requires an argument, an actual value or a defined `Const`. 

## File list

### 1bit_CPU.circ

XML file containing the circuit, generated by the Logisim program.

### assembler.mjs

Assembler for the assembly language for the processor. 

```
Usage
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
```

### opcodes.ods

LibreOffice spreadsheet 

